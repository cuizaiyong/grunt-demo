#!/usr/bin/env node
process.argv.push('--gruntfile');
process.argv.push(require.resolve('..'));

require('grunt/bin/grunt');
