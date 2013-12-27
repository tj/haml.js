'use strict';

requirejs.config({
  paths: {
    haml: '../lib/haml'
  }
});

define(function (require) {
  var HAML = require('haml');
  var text = HAML.render('!!!\n%html');

  console.log(text);
});
