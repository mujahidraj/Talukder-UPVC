const ExcelJS = require('exceljs');
const fs = require('fs');

async function run() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('c:/Users/TALUKDER IT/Desktop/UPVC Site/Files/Talukder_uPVC_Product_Catalog (version 1).xlsx');
  const worksheet = workbook.worksheets[0];
  
  const dbProducts = JSON.parse(fs.readFileSync('products.json', 'utf8'));
  const dbProductCodes = new Set(dbProducts.map(p => p.productCode));

  let missing = [];
  
  for(let i=2; i<=worksheet.rowCount; i++) {
    const row = worksheet.getRow(i);
    const productCode = row.getCell(4).text;
    const productName = row.getCell(5).text;
    
    if (productCode && productName && !dbProductCodes.has(productCode)) {
      missing.push({ row: i, productCode, productName });
    }
  }
  
  console.log('Total missing products:', missing.length);
  console.log('First 10 missing:', missing.slice(0, 10));
}

run().catch(console.error);
