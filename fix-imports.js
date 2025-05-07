import fs from 'fs';
import path from 'path';

function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath, fileList);
        } else if (filePath.endsWith('.ts') && !filePath.endsWith('.d.ts')) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

function fixImports(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Remove .ts extensions from imports
    const tsExtensionRegex = /import\s+.*\s+from\s+['"](.*)\.ts['"]/g;
    if (tsExtensionRegex.test(content)) {
        console.log(`Removing .ts extensions in ${filePath}`);
        content = content.replace(tsExtensionRegex, (match, importPath) => {
            return match.replace(`${importPath}.ts`, importPath);
        });
        modified = true;
    }

    // Add .js extensions to relative imports (required for ESM)
    const relativeImportRegex = /import\s+.*\s+from\s+['"](\.[^'"]*)['"]/g;
    let match;
    let newContent = content;

    while ((match = relativeImportRegex.exec(content)) !== null) {
        const [fullMatch, importPath] = match;

        // Skip if already has a file extension
        if (importPath.endsWith('.js') || importPath.endsWith('.mjs') || importPath.endsWith('.cjs')) {
            continue;
        }

        const newImport = fullMatch.replace(importPath, `${importPath}.js`);
        newContent = newContent.replace(fullMatch, newImport);
        modified = true;
    }

    if (modified) {
        console.log(`Adding .js extensions to imports in ${filePath}`);
        fs.writeFileSync(filePath, newContent, 'utf8');
    }
}

const allTsFiles = getAllFiles('./src');
allTsFiles.forEach(fixImports);

console.log('All imports fixed!'); 