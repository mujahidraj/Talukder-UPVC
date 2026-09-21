const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Replace bg-slate-50, bg-gray-50, bg-white with bg-transparent when they are with min-h-screen or similar layout classes
            const regexes = [
                /className="([^"]*)(min-h-screen|h-screen)([^"]*)(bg-slate-50|bg-gray-50|bg-white)([^"]*)"/g,
                /className="([^"]*)(bg-slate-50|bg-gray-50|bg-white)([^"]*)(min-h-screen|h-screen)([^"]*)"/g,
                // also match specific page wrappers that don't have min-h-screen but have bg-slate-50
                /className="bg-slate-50 pt-8 pb-20"/g,
                /className="py-16 md:py-32 bg-slate-50 relative"/g,
                /className="bg-gray-50 min-h-screen py-12 md:py-24"/g,
                /className="bg-slate-50 min-h-screen pt-8 pb-20"/g,
                /className="h-screen flex overflow-hidden bg-slate-50"/g,
                /className="flex-1 relative z-0 overflow-y-auto focus:outline-none bg-slate-50"/g,
                /className="bg-slate-50 min-h-screen"/g
            ];

            for (const regex of regexes) {
                if (content.match(regex)) {
                    content = content.replace(regex, (match) => {
                        return match.replace(/bg-slate-50|bg-gray-50|bg-white/, 'bg-transparent');
                    });
                    modified = true;
                }
            }
            
            // Just specifically for HomePage.tsx bg-slate-50/70
            if (content.includes('bg-slate-50/70')) {
                content = content.replace('bg-slate-50/70', 'bg-transparent');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Modified: ${fullPath}`);
            }
        }
    }
}

processDir(path.join(__dirname, 'src', 'pages'));
processDir(path.join(__dirname, 'src', 'layouts'));
console.log("Done");
