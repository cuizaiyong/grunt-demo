const fs = require('fs');
const sass = require('sass');
const loadGruntTasks = require('load-grunt-tasks');
const browserSync = require('browser-sync');
const bs = browserSync.create();
const useref = require('useref');
module.exports = grunt => {
  grunt.initConfig({
    pkg: require('./package.json'),
    clean: ['temp', 'dist', 'tmp', '.tmp', 'output'],
    copy: {
      main: {
        files: [
          {
            expand: true,
            flatten: true,
            src: ['public/**'],
            dest: 'dist',
            filter: 'isFile',
          },
        ],
      },
    },
    sass: {
      options: {
        sourceMap: false,
        implementation: sass,
      },
      main: {
        files: {
          'temp/assets/styles/main.css': 'src/assets/styles/main.scss',
        },
      },
    },
    babel: {
      options: {
        sourceMap: false,
        presets: ['@babel/preset-env'],
      },
      dist: {
        files: {
          'temp/assets/scripts/main.js': 'src/assets/scripts/main.js',
        },
      },
    },
    imagemin: {
      dynamic: {
        files: [
          {
            expand: true,
            cwd: 'src/assets/images',
            src: ['**/*.{png,jpg,gif,svg}'],
            dest: 'dist/assets/images',
          },
          {
            expand: true,
            cwd: 'src/assets/fonts',
            src: ['**/*'],
            dest: 'dist/assets/fonts',
          },
        ],
      },
    },
    html_template: {
      build_html: {
        expand: true,
        cwd: 'src',
        src: '*.html',
        dest: 'temp',
      },
    },
    watch: {
      options: {
        livereload: true,
      },
      scripts: {
        files: ['src/assets/scripts/*.js'],
        tasks: ['babel', 'bsReload'],
      },
      styles: {
        files: ['src/assets/styles/*.scss'],
        tasks: ['sass', 'bsReload'],
      },
      pages: {
        files: ['src/*.html'],
        tasks: ['html_template', 'bsReload'],
      },
    },
    uglify: {
      options: {
        sourceMap: true,
      },
      js: {
        files: {
          'dist/assets/scripts/main.js': 'temp/assets/scripts/main.js',
          'dist/assets/scripts/vendor.js': 'temp/assets/scripts/vendor.js',
        },
      },
    },
    cssmin: {
      options: {
        sourceMap: true,
      },
      css: {
        files: {
          'dist/assets/styles/main.css': 'temp/assets/styles/main.css',
          'dist/assets/styles/vendor.css': 'temp/assets/styles/vendor.css',
        },
      },
    },
    htmlmin: {
      html: {
        options: {
          removeComments: true,
          collapseWhiteSpace: true,
        },
        files: {
          'dist/index.html': 'temp/index.html',
          'dist/about.html': 'temp/about.html',
        },
      },
    },
  });
  loadGruntTasks(grunt);
  grunt.registerTask('bsReload', function () {
    bs.reload({ stream: true });
  });
  grunt.registerTask('serve', function () {
    const done = this.async();
    bs.init(
      {
        port: 3000,
        open: false,
        files: [''],
        server: {
          baseDir: ['temp', 'src', 'public'],
          routes: {
            '/node_modules': 'node_modules',
          },
        },
      },
      err => {
        if (err) {
          done(err);
          return;
        }
        done();
      }
    );
  });
  grunt.registerTask('clear', ['clean']);
  grunt.registerTask('compile', ['sass', 'babel', 'html_template']);
  grunt.registerTask('useref', () => {
    const cwd = process.cwd();
    const tmpDir = cwd + '/' + 'temp';
    const tmpFiles = fs.readdirSync(tmpDir);
    tmpFiles.forEach(file => {
      if (file.endsWith('.html')) {
        const plainContent = fs.readFileSync(tmpDir + '/' + file, 'utf-8');
        const result = useref(plainContent);
        fs.writeFileSync(tmpDir + '/' + file, result[0]);
        const assets = result[1];
        Object.keys(assets).forEach(path => {
          Object.keys(assets[path]).forEach(sourcePath => {
            const sourcePaths = assets[path][sourcePath].assets;
            let str = '';
            sourcePaths.forEach(assetPath => {
              if (assetPath.includes('node_modules/')) {
                str += fs.readFileSync(cwd + assetPath, 'utf-8') + '\n';
              } else {
                str +=
                  fs.readFileSync(tmpDir + '/' + assetPath, 'utf-8') + '\n';
              }
            });
            fs.writeFileSync(tmpDir + '/' + sourcePath, str);
          });
        });
      }
    });
  });
  grunt.registerTask('develop', ['clean', 'compile', 'serve', 'watch']);
  grunt.registerTask('build', [
    'clean',
    'compile',
    'useref',
    'imagemin',
    'uglify',
    'cssmin',
    'htmlmin',
    'copy',
  ]);
};
