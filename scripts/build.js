const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const filesToCopy = [
  {
    from: 'appsscript.json',
    to: 'dist/appsscript.json'
  }
];

esbuild.build({
  entryPoints: ['src/Main.ts'],
  bundle: true,
  outfile: 'dist/code.gs',
  platform: 'browser',
  target: 'es2015',
  format: 'cjs',
  charset: 'utf8',
  treeShaking: false
}).then(() => {
  filesToCopy.forEach(f => {
    if (f.folder) {
      copyFolderSync(f.from, f.to);
    } 
    else {
      fs.copyFileSync(f.from, f.to);
    }
  });
});

function copyFolderSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  for (const item of fs.readdirSync(src)) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);

    if (fs.lstatSync(srcPath).isDirectory()) {
      copyFolderSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}