
// require.paths.unshift('spec', './spec/lib', 'lib')
haml = require('../lib/haml')
require('./lib/jspec')
require('./unit/spec.helper')

JSpec
  .exec('spec/unit/spec.js')
  .run({ reporter: JSpec.reporters.Terminal, fixturePath: 'spec/fixtures', failuresOnly: true })
  .report()
