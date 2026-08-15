const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const EXCEL_PATH = path.join(__dirname, '../../Files/Talukder_uPVC_Product_Catalog.xlsx');
const OUT_PATH = path.join(__dirname, '../../Files/Talukder_uPVC_Product_Catalog_Updated.xlsx');
const IMG_DIR = path.join(__dirname, '../../Files/Product Image');

async function run() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(EXCEL_PATH);
  const ws = wb.worksheets[0];
  
  // Read available images
  const availableImages = fs.readdirSync(IMG_DIR).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));
  console.log(`Found ${availableImages.length} images in folder.`);
  
  // Clean existing images in workbook (clear media)
  // Unfortunately, exceljs doesn't easily let us clear media and images from worksheet while preserving other structures.
  // Instead, we will create a new file, or just append new images. 
  // Let's remove images from worksheet
  if (ws._media) ws._media = [];
  
  // Actually the safest way to clear images in exceljs is undocumented. We'll just leave them or try to strip them:
  // For now, let's just add new images and tell the import processor to prioritize the newly added images, or we just overwrite `ws.getImages()`
  ws.getImages().splice(0, ws.getImages().length); // clear array

  let matchCount = 0;

  for (let i = 2; i <= ws.rowCount; i++) {
    const row = ws.getRow(i);
    const code = (row.getCell(4).text || '').toString().trim();
    const name = (row.getCell(5).text || '').toString().trim().toLowerCase();
    
    if (!code || !name) continue;
    
    // Find matching image
    // Match by code or loose name match
    let matchedFiles = [];
    
    for (const file of availableImages) {
       const lowerFile = file.toLowerCase();
       // If file contains the code
       if (lowerFile.includes(code)) {
         matchedFiles.push(file);
         continue;
       }
       
       // Loose name match
       // e.g. '1 elbow 90.png' -> product name 'uPVC Elbow 90'
       // We'll strip common words
       const cleanName = name.replace('upvc', '').replace('class-b', '').replace('pipe', '').trim();
       const nameParts = cleanName.split(' ').filter(p => p.length > 2);
       
       let matches = true;
       for (const part of nameParts) {
         if (!lowerFile.includes(part)) {
           matches = false;
           break;
         }
       }
       if (matches && nameParts.length > 0) {
         matchedFiles.push(file);
       }
    }
    
    // Remove duplicates
    matchedFiles = [...new Set(matchedFiles)];
    
    if (matchedFiles.length > 0) {
      matchCount++;
      console.log(`Row ${i} (${code} - ${name}) -> matched: ${matchedFiles.join(', ')}`);
      
      // Insert images into the Excel file!
      // In ExcelJS, we add image to workbook, then add to worksheet
      matchedFiles.forEach((file, index) => {
         const ext = path.extname(file).toLowerCase();
         const imgId = wb.addImage({
           filename: path.join(IMG_DIR, file),
           extension: ext === '.png' ? 'png' : 'jpeg',
         });
         
         // Add to column 18 (R), with slight offset if multiple
         ws.addImage(imgId, {
           tl: { col: 17 + (index * 0.5), row: i - 1 }, // put them side by side
           ext: { width: 100, height: 100 },
           editAs: 'oneCell'
         });
      });
    }
  }
  
  console.log(`Matched images for ${matchCount} products.`);
  
  // Note: we can't easily parse the PDF because it's completely flattened into full page images.
  
  await wb.xlsx.writeFile(OUT_PATH);
  console.log('Saved to', OUT_PATH);
}

run();
