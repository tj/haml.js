"use strict";

module.exports = function(grunt) {

  grunt.initConfig({
    urequire: {
      dist: {
        path: "lib",
        main: "haml",
        dstPath: "haml.js",
        template: "combined"
      }
    }
  });

  grunt.loadNpmTasks("grunt-urequire");
  grunt.registerTask("default", ["urequire"]);

};
