const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/Main.ts'],
  bundle: true,
  outfile: 'dist/code.js',
  platform: 'browser',
  target: 'es2015',
  format: 'cjs',
  charset: 'utf8', 
  treeShaking: false
});