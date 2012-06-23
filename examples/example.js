
var util = require('util'),
    fs = require('fs'),
    haml = require('../lib/haml')
    
var options = {
  filename: 'page.haml',
  locals: {
    title: 'Welcome',
    body: 'wahoo',
    usersOnline: 15
  }
}

util.puts(haml.render(fs.readFileSync('examples/page.haml'), options))