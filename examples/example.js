
var sys = require('sys'),
    fs = require('fs'),
    haml = require('../lib/haml')
sys.puts(haml.render(fs.readFileSync('examples/page.haml'), { filename: 'examples/page.haml' }))