// Haml - Copyright TJ Holowaychuk <tj@vision-media.ca> (MIT Licensed)

var HAML = {};

/**
 * Version.
 */

HAML.version = '0.6.2'

/**
 * Haml template cache.
 */

HAML.cache = {}

/**
 * Default error context length.
 */

HAML.errorContextLength = 15

/**
 * Self closing tags.
 */

HAML.selfClosing = [
    'meta',
    'img',
    'link',
    'br',
    'hr',
    'input',
    'area',
    'base'
  ]

/**
 * Default supported doctypes.
 */

HAML.doctypes = {
  '5': '<!DOCTYPE html>',
  'xml': '<?xml version="1.0" encoding="utf-8" ?>',
  'default': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
  'strict': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
  'frameset': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">',
  '1.1': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
  'basic': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">',
  'mobile': '<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">'
}

/**
 * Default filters.
 */

HAML.filters = {

  /**
   * Return plain string.
   */

  plain: function(str, buf) {
    buf.push(str)
  },

  /**
   * Wrap with CDATA tags.
   */

  cdata: function(str, buf) {
    buf.push('<![CDATA[\n' + str + '\n]]>')
  },

  /**
   * Wrap with <script> and CDATA tags.
   */

  javascript: function(str, buf) {
    buf.push('<script type="text/javascript">\n//<![CDATA[\n' + str + '\n//]]></script>')
  }
}

/**
 * HamlError.
 */

var HamlError = HAML.HamlError = function(msg) {
    this.name = 'HamlError'
    this.message = msg
    Error.captureStackTrace(this, HAML.render)
}

/**
 * HamlError inherits from Error.
 */
HamlError.super_ = Error;
HamlError.prototype = Object.create(Error.prototype, {
  constructor: {
    value: HamlError,
    enumerable: false,
    writable: true,
    configurable: true
  }
});

/**
 * Lexing rules.
 */

var rules = {
  indent: /^\n( *)(?! *-#)/,
  conditionalComment: /^\/(\[[^\n]+\])/,
  comment: /^\n? *\/ */,
  silentComment: /^\n? *-#([^\n]*)/,
  doctype: /^!!! *([^\n]*)/,
  escape: /^\\(.)/,
  filter: /^:(\w+) */,
  each: /^\- *each *(\w+)(?: *, *(\w+))? * in ([^\n]+)/,
  code: /^\-([^\n]+)/,
  outputCode: /^!=([^\n]+)/,
  escapeCode: /^=([^\n]+)/,
  attrs: /^\{(.*?['"]?.*)\}/,
  tag: /^%([-a-zA-Z][-a-zA-Z0-9:]*)/,
  class: /^\.([\w\-]+)/,
  id: /^\#([\w\-]+)/,
  text: /^([^\n]+)/
}

/**
 * Return error context _str_.
 *
 * @param  {string} str
 * @return {string}
 * @api private
 */

function context(str) {
  return String(str)
    .substr(0, HAML.errorContextLength)
    .replace(/\n/g, '\\n')
}

/**
 * Tokenize _str_.
 *
 * @param  {string} str
 * @return {array}
 * @api private
 */

function tokenize(str) {
  var captures,
      token,
      tokens = [],
      line = 1,
      lastIndents = 0,
      str = String(str).trim().replace(/\r\n|\r|\n *\n/g, '\n')
  function error(msg){ throw new HamlError('(Haml):' + line + ' ' + msg) }
  while (str.length) {
    for (var type in rules)
      if (captures = rules[type].exec(str)) {
        token = {
          type: type,
          line: line,
          match: captures[0],
          val: captures.length > 2
            ? captures.slice(1)
            : captures[1]
        }
        str = str.substr(captures[0].length)
        if (type === 'indent') ++line
        else  break
        var indents = token.val.length / 2
        if (indents % 1)
          error('invalid indentation; got ' + token.val.length + ' spaces, should be multiple of 2')
        else if (indents - 1 > lastIndents)
          error('invalid indentation; got ' + indents + ', when previous was ' + lastIndents)
        else if (lastIndents > indents)
          while (lastIndents-- > indents)
            tokens.push({ type: 'outdent', line: line })
        else if (lastIndents !== indents)
          tokens.push({ type: 'indent', line: line })
        else
          tokens.push({ type: 'newline', line: line })
        lastIndents = indents
      }
    if (token) {
      if (token.type !== 'silentComment')
        tokens.push(token)
      token = null
    } else
      error('near "' + context(str) + '"')
  }
  return tokens.concat({ type: 'eof' })
}

// --- Parser

/**
 * Initialize parser with _str_ and _options_.
 */

var Parser = HAML.Parser = function (str, options) {
  options = options || {}
  this.tokens = tokenize(str)
  this.xml = options.xml
}

Parser.prototype = {

  /**
   * Lookahead a single token.
   *
   * @return {object}
   * @api private
   */

  get peek() {
    return this.tokens[0]
  },

  /**
   * Advance a single token.
   *
   * @return {object}
   * @api private
   */

  get advance() {
    return this.current = this.tokens.shift()
  },

  /**
   *    outdent
   *  | eof
   */

  get outdent() {
    switch (this.peek.type) {
      case 'eof':
        return
      case 'outdent':
        return this.advance
      default:
        throw new HamlError('expected outdent, got ' + this.peek.type)
    }
  },

  /**
   * text
   */

  get text() {
    var text = this.advance.val.trim();
    var idx = -1, nesting = 0;
    var buf = [];

    while ((idx = text.indexOf('#{')) != -1) {
      buf.push(JSON.stringify(text.substring(0, idx)));
      text = text.substring(idx + 1);
      // text looks like "{some({expression: true})} remainder" so we will grab
      // everything between some matched curly brackets.
      for (idx = nesting = 0; idx < text.length; idx++) {
        if (text[idx] == "{") {
          nesting += 1;
        } else if (text[idx] == "}") {
          nesting -= 1;
          if (nesting == 0) {
            break;
          }
        }
      }
      if (nesting > 0) {
        error("Missing closing bracket in string interpolation");
      }
      // Add as an unquoted segment, stripping exterior brackets
      buf.push(text.substring(1, idx));
      text = text.substring(idx + 1);
    }

    buf.push(JSON.stringify(text));

    this.buffer(buf.join(" + "), false)
  },

  /**
   * indent expr outdent
   */

  get block() {
    this.advance
    while (this.peek.type !== 'outdent' &&
           this.peek.type !== 'eof')
      this.expr
    this.outdent
  },

  /**
   * indent expr
   */

  get textBlock() {
    var token,
        indents = 1
    this.advance
    while (this.peek.type !== 'eof' && indents)
      switch((token = this.advance).type) {
        case 'newline':
          this.buffer('\\n' + Array(indents).join('  ') + '')
          break
        case 'indent':
          ++indents
          this.buffer('\\n' + Array(indents).join('  ') + '')
          break
        case 'outdent':
          --indents
          if (indents === 1) this.buffer('\\n')
          break
        default:
          this.buffer(token.match.replace(/"/g, '\\\"'))
      }
  },

  /**
   *  ( attrs | class | id )*
   */

  get attrs() {
    var attrs = ['attrs', 'class', 'id'],
        buf = []

    while (attrs.indexOf(this.peek.type) !== -1)
      switch (this.peek.type) {
        case 'id':
          buf.push('{ id: "' + this.advance.val + '" }')
          break
        case 'class':
          buf.push('{ class: "' + this.advance.val + '" }');
          break
        case 'attrs':
          buf.push('{ ' + this.advance.val.replace(/(for) *:/gi, '"$1":') + ' }')
      }

    return buf.length
      ? ' " + attrs([' + buf.join(', ') + ']) + "'
      : ''
  },

  /**
   *   tag
   * | tag text
   * | tag conditionalComment
   * | tag comment
   * | tag outputCode
   * | tag escapeCode
   * | tag block
   */

  get tag() {
    var tag = this.advance.val,
        selfClosing = !this.xml && HAML.selfClosing.indexOf(tag) !== -1

    this.buffer('\\n<' + tag + this.attrs + (selfClosing ? '/>' : '>'));
    switch (this.peek.type) {
      case 'text':
        this.text
        break
      case 'conditionalComment':
        this.conditionalComment
        break;
      case 'comment':
        this.comment
        break
      case 'outputCode':
        this.outputCode
        break
      case 'escapeCode':
        this.escapeCode
        break
      case 'indent':
        this.block
    }
    if (!selfClosing) this.buffer('</' + tag + '>')
  },

  /**
   * outputCode
   */

  get outputCode() {
    this.buffer(this.advance.val, false)
  },

  /**
   * escapeCode
   */

  get escapeCode() {
    this.buffer('escape(' + this.advance.val + ')', false)
  },

  /**
   * doctype
   */

  get doctype() {
    var doctype = this.advance.val.trim().toLowerCase() || 'default'
    if (doctype in HAML.doctypes)
      this.buffer(HAML.doctypes[doctype].replace(/"/g, '\\"'))
    else
      throw new HamlError("doctype `" + doctype + "' does not exist")
  },

  /**
   * conditional comment expr
   */

  get conditionalComment() {
    var condition= this.advance.val

    this.buffer('<!--' + condition + '>')

    this.peek.type === 'indent'
      ? this.block
      : this.expr

    this.buffer('<![endif]-->')
  },

  /**
   * comment expr
   */

  get comment() {
    this.advance
    this.buffer('<!-- ')
    var buf = this.peek.type === 'indent'
      ? this.block
      : this.expr
    this.buffer(' -->')
  },

  /**
   *   code
   * | code block
   */

  get code() {
    var code = this.advance.val

    if (this.peek.type === 'indent') {
      this.buf.push(code)
      this.buf.push('{')
      this.block
      this.buf.push('}')
      return
    }

    this.buf.push(code)
  },

  /**
   * filter textBlock
   */

  get filter() {
    var filter = this.advance.val
    if (!(filter in HAML.filters))
      throw new HamlError("filter `" + filter + "' does not exist")
    if (this.peek.type !== 'indent')
      throw new HamlError("filter `" + filter + "' expects a text block")

    this.buf.push('HAML.filters.' + filter + '(')
    this.buf.push('(function(){')
    this.buf.push('var buf = []')
    this.textBlock
    this.buf.push('return buf.join("")')
    this.buf.push('}).call(this)')
    this.buf.push(', buf)')
  },

  /**
   * each block
   */

  get iterate() {
    var each = this.advance,
      key = each.val[1],
      vals = each.val[2],
      val = each.val[0]

    if (this.peek.type !== 'indent')
      throw new HamlError("'- each' expects a block, but got " + this.peek.type)

    this.buf.push('for (var ' + (key || 'index') + ' in ' + vals + ') {')
    this.buf.push('var ' + val + ' = ' + vals + '[' + (key || 'index') + '];')

    this.block

    this.buf.push('}')
  },

  /**
   *   eof
   * | tag
   * | text*
   * | each
   * | code
   * | escape
   * | doctype
   * | filter
   * | comment
   * | conditionalComment
   * | escapeCode
   * | outputCode
   */

  get expr() {
    switch (this.peek.type) {
      case 'id':
      case 'class':
        this.tokens.unshift({ type: 'tag', val: 'div' })
        return this.tag
      case 'tag':
        return this.tag
      case 'text':
        var buf = []
        while (this.peek.type === 'text') {
          buf.push(this.advance.val.trim())
          if (this.peek.type === 'newline')
            this.advance
        }
        return this.buffer(buf.join(' '))
      case 'each':
        return this.iterate
      case 'code':
        return this.code
      case 'escape':
        return this.buffer(this.advance.val);
      case 'doctype':
        return this.doctype
      case 'filter':
        return this.filter
      case 'conditionalComment':
        return this.conditionalComment
      case 'comment':
        return this.comment
      case 'escapeCode':
        return this.escapeCode
      case 'outputCode':
        return this.outputCode
      case 'newline':
      case 'indent':
      case 'outdent':
        this.advance
        return this.expr
      default:
        throw new HamlError('unexpected ' + this.peek.type)
    }
  },

  /**
   * expr*
   */

  get js() {
    this.buf = [
      'with (locals || {}) {',
      '  var buf = [];'
    ]

    while (this.peek.type !== 'eof')
      this.expr

    this.buf.push('  return buf.join("")')
    this.buf.push('}');

    return this.buf.join('\n')
  },

  buffer: function (str, quoted) {
    if (typeof quoted === 'undefined')
      var quoted = true

    if (quoted)
      this.buf.push('  buf.push("' + str + '")')
    else
      this.buf.push('  buf.push(' + str + ')')
  }
}

/**
 * Escape html entities in _str_.
 *
 * @param  {string} str
 * @return {string}
 * @api private
 */

function escape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/>/g, '&gt;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
}

/**
 * Render _attrs_ to html escaped attributes.
 *
 * @param  {array} attrs
 * @return {string}
 * @api public
 */

function attrs(attrs) {
  var finalAttrs = {}
    , classes = []
    , buf = []

  for (var i = 0, len = attrs.length; i < len; i++)
    for (var attrName in attrs[i])
      if (attrName === 'class')
        classes.push(attrs[i][attrName])
      else
        finalAttrs[attrName] = attrs[i][attrName]

  if (classes.length)
    finalAttrs['class'] = classes.join(' ')

  for (var key in finalAttrs)
    if (typeof finalAttrs[key] === 'boolean') {
      if (finalAttrs[key] === true)
        buf.push(key + '="' + key + '"')
    } else if (finalAttrs[key])
      buf.push(key + '="' + escape(finalAttrs[key]) + '"')
  return buf.join(' ')
}

/**
 * Compile a function from the given `str`.
 *
 * @param {String} str
 * @return {Function}
 * @api public
 */

HAML.compile = function(str, options){
  var parser = new Parser(str, options);
  var fn = new Function('locals, attrs, escape, HAML', parser.js);
  return function(locals){
    return fn.apply(this, [locals, attrs, escape, HAML]);
  };
};

/**
 * Render a _str_ of haml.
 *
 * Options:
 *
 *   - locals   Local variables available to the template
 *   - context  Context in which the template is evaluated (becoming "this")
 *   - filename Filename used to aid in error reporting
 *   - cache    Cache compiled javascript, requires "filename"
 *   - xml      Force xml support (no self-closing tags)
 *
 * @param  {string} str
 * @param  {object} options
 * @return {string}
 * @api public
 */

HAML.render = function(str, options) {
  var parser,
      options = options || {}
  if (options.cache && !options.filename)
    throw new Error('filename option must be passed when cache is enabled')
  return (function(){
    try {
      var fn
      if (options.cache && HAML.cache[options.filename])
        fn = HAML.cache[options.filename]
      else {
        parser = new Parser(str, options)
        fn = Function('locals, attrs, escape, HAML', parser.js)
      }
      return (options.cache
          ? HAML.cache[options.filename] = fn
          : fn).call(options.context, options.locals, attrs, escape, HAML)
    } catch (err) {
      if (parser && err instanceof HamlError)
        err.message = '(Haml):' + parser.peek.line + ' ' + err.message
      else if (!(err instanceof HamlError))
        err.message = '(Haml): ' + err.message
      if (options.filename)
        err.message = err.message.replace('Haml', options.filename)
      throw err
    }
  }).call(options.context)
}

/**
 * Render a file containing haml and cache the parser.
 *
 * @param  {string} filename
 * @param  {string} encoding
 * @param  {object} options
 * @param  {function} callback
 * @return {void}
 * @api public
 */

HAML.renderFile = function(filename, encoding, options, callback) {
  // Dirty workaround to make sure requirejs does not try to load
  // the `fs` package. Will be fixed after rewrite of the package.
  var r = require;
  var fs = r('fs');
  options = options || {}
  options.filename = options.filename || filename
  options.cache = options.hasOwnProperty('cache') ? options.cache : true

  if (HAML.cache[filename]) {
    process.nextTick(function() {
      callback(null, HAML.render(null, options))
    });
  } else {
    fs.readFile(filename, encoding, function(err, str) {
      if (err) {
        callback(err)
      } else {
        callback(null, HAML.render(str, options))
      }
    });
  }
}

module.exports = HAML;
