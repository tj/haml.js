
var sys = require('sys'),
    fs = require('fs'),
    haml = require('../lib/haml')
sys.puts(haml.render(fs.readFileSync('examples/page.haml'), { locals: { items: ['foo', 'bar', 'baz'] }, filename: 'examples/page.haml' }))