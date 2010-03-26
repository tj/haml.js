
# Haml.js

  High performance JavaScript [Haml](http://haml-lang.com) implementation for [nodejs](http://nodejs.org)
  
## Installation

  Install the [Kiwi package manager for nodejs](http://github.com/visionmedia/kiwi)
  and run:
  
      $ kiwi -v install haml
      
## About

  Haml.js attempts to comply with the original [Haml](http://haml-lang.com/docs/yardoc/file.HAML_REFERENCE.html)
  implementation as well as possible. There are no magic "plugins" like
  found in other JavaScript haml implementations, for example the following
  will work just fine:
  
    - if (items)
      %ul
        - for (var i = 0; i < items.length; ++i)
          %li= items[i]
  
  Iteration is the one exception to these magical plugins,
  since this is **ugly** in JavaScript, you may also:
  
    - if (items)
      %ul
        - each item in items
          %li= item
          
## Usage

    var haml = require('haml')
    haml.render('a string of haml', options)
    
## Options

  * context
    - when passed the value of "this" becomes the given "context" object
  * locals
    - when passed all members of this object become available to this template
          
## License 

(The MIT License)

Copyright (c) 2010 TJ Holowaychuk &lt;tj@vision-media.ca&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.