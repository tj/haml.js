
var sys = require('sys'),
    fs = require('fs'),
    haml = require('../lib/haml'),
    times = 2000

function bm(label, fn) {
  var start = +new Date
  fn()
  var duration = ((+new Date) - start) / 1000
  sys.puts(label + ': ' + duration + ' seconds')
}

sys.puts(times + ' times')

var ours = fs.readFileSync('benchmarks/ours.haml')

bm('null', function(){
  var n = times
  while (n--) ;
})

bm('ours', function(){
  var n = times
  while (n--) haml.render(ours)
})