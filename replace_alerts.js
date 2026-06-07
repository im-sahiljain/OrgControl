const fs = require('fs');
const path = require('path');

const dir = '/home/sahil/Desktop/Prep/redux_toolkit/src/app';
const exclude = '/home/sahil/Desktop/Prep/redux_toolkit/src/app/[companyId]/[jobId]/application/page.tsx';

function walk(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function(name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            callback(filePath, stat);
        } else if (stat.isDirectory()) {
            walk(filePath, callback);
        }
    });
}

walk(dir, function(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    if (filePath === exclude) return;

    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('alert(')) {
        console.log(`Processing: ${filePath}`);
        
        let newContent = content.replace(/alert\((.*?)\)/g, (match, p1) => {
            const lowerP1 = p1.toLowerCase();
            if (lowerP1.includes('success') || lowerP1.includes('saved') || lowerP1.includes('completed') || lowerP1.includes('added')) {
                return `toast.success(${p1})`;
            } else if (lowerP1.includes('fail') || lowerP1.includes('error') || lowerP1.includes('please ') || lowerP1.includes('blank') || lowerP1.includes('required')) {
                return `toast.error(${p1})`;
            } else {
                return `toast(${p1})`;
            }
        });

        if (!newContent.includes("import toast")) {
            // Find the last import
            const lines = newContent.split('\n');
            let lastImportIndex = -1;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].startsWith('import ')) {
                    lastImportIndex = i;
                }
            }
            if (lastImportIndex !== -1) {
                lines.splice(lastImportIndex + 1, 0, "import toast from 'react-hot-toast';");
            } else {
                lines.unshift("import toast from 'react-hot-toast';");
            }
            newContent = lines.join('\n');
        }

        fs.writeFileSync(filePath, newContent, 'utf8');
    }
});
