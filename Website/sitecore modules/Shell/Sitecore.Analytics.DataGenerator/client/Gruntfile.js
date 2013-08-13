/* jshint node: true */
module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    jshint: {
      all: [
        "Gruntfile.js",
        "js/**/*.js"
      ],
      options: {
        jshintrc: ".jshintrc",
        force: true,
        ignores: ["js/vendor/**/*.js"]
      }
    }
  });

  grunt.loadNpmTasks('grunt-docco');
  grunt.loadNpmTasks("grunt-contrib-jshint");

  grunt.registerTask("default", ["jshint"]);
};