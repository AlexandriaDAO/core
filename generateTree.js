const fs = require('fs');
const path = require('path');

const ignoreDirs = ['.next', 'node_modules', '.git', 'public', 'data', '.dfx', 'out', 'dist'];
const ignoreFilePrefixes = ['public', 'declarations', 'target', '.env', '.git', '.nvmrc', '.prettierrc', '.eslintrc', 'LICENSE', 'package', 'READ', 'filtered', 'generate', 'tree'];

const essentialFiles = {
  backend: ['helper', 'model', 'service'],
  pages: ['_app.js', 'index.js'],
  ui: ['components', 'declarations', 'hooks', 'service', 'styles', 'utils']
};

const createTree = (dir, indent = '') => {
  let tree = '';
  const files = fs.readdirSync(dir);
  const parentDir = path.basename(dir);

  files
    .filter(file => !ignoreDirs.includes(file))
    .filter(file => !ignoreFilePrefixes.some(prefix => file.startsWith(prefix)))
    .forEach((file, index) => {
      const fullPath = path.join(dir, file);
      const isLastFile = index === files.length - 1;
      const stats = fs.statSync(fullPath);
      const shouldInclude = essentialFiles[parentDir] ? essentialFiles[parentDir].includes(file) : true;

      if (shouldInclude) {
        const lineEnd = isLastFile ? '└── ' : '├── ';
        tree += `${indent}${lineEnd}${file}${stats.isDirectory() ? '/' : ''}\n`;

        if (stats.isDirectory()) {
          tree += createTree(fullPath, `${indent}${isLastFile ? '    ' : '│   '}`);
        }
      }
    });

  return tree;
};

const tree = createTree('.');
fs.writeFileSync('tree.txt', tree);
console.log('Essential file tree generated successfully.');
