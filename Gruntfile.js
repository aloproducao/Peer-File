module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    connect: {
      server: {
        options: {
          port: 8090,
          base: '.'
        }
      }
    },

    open: {
      dev: {
        path: 'http://localhost:8090'
      }
    },

    sass: {
      dist: {
        files: {
          'css/style.css': 'scss/style.scss'
        }
      }
    },

    watch: {
      all: {
        files: ['*.html', 'css/*.css', 'js/*.js'],
        options: {
          livereload: true
        }
      },

      sass: {
        files: 'scss/**/*.scss',
        tasks: ['sass:dist'],
        options: {
          livereload: true
        }
      }
    },

    uglify: {
      dist: {
        files: {
          'dist/js/chop.min.js': ['js/chop.min.js'],
          'dist/js/chop-bundle.js': ['js/chop-bundle.js'],
          'dist/js/main.js': ['js/filereader.js', 'js/FileSaver.js', 'js/main.js']
        }
      }
    },

    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: {
          'dist/index.html': 'index.html',
          'dist/peer-template.html': 'peer-template.html'
        }
      }
    },

    cssmin: {
      dist: {
        files: {
          'dist/css/style.css': ['css/style.css']
        }
      }
    },

    copy: {
      dist: {
        src: 'img/*',
        dest: 'dist/'
      }
    },

    'ftp-deploy': {
      dist: {
        auth: {
          host: 'feifeihang.info',
          port: 21,
          authKey: 'key'
        },
        src: 'dist/',
        dest: '/public_html/file'
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-ftp-deploy');

  grunt.registerTask('serve', ['connect', 'open', 'watch']);
  grunt.registerTask('build', ['uglify', 'htmlmin', 'cssmin', 'copy']);
  grunt.registerTask('deploy', ['ftp-deploy']);

};
