const fs = require('fs');
const cheerio = require('cheerio');

// Load HTML
const files = [
  'Chandigarh University Management System _ Unnao Campus.html',
  'attendance_structure.html',
  'debug_attendance.html',
  'debug_attendance_ajax.html'
];

const norm = (s) => s.toLowerCase().replace(/[^a-z]/g, '');

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  const $ = cheerio.load(html);

  console.log(`\n=== TESTING FILE: ${file} ===`);
  console.log('Tables count:', $('table').length);

  const candidateTables = [];
  $('table').each((_, t) => {
    const tableText = $(t).text();
    if (/\d{2}[A-Z]{2,4}-\d{2,3}/.test(tableText)) {
      candidateTables.push($(t));
    }
  });

  console.log('Candidate tables count:', candidateTables.length);

  const records = [];
  for (const $table of candidateTables) {
    let headerMap = {};
    let headerRowFound = false;
    
    $table.find('tr').each((_, tr) => {
      if (headerRowFound) return;
      const cells = $(tr).find('th, td');
      if (cells.length < 8) return;
      
      const rowText = $(tr).text().toLowerCase();
      const isHeaderRow = rowText.includes('eligible') && (rowText.includes('delivered') || rowText.includes('attended'));
      
      if (!isHeaderRow) return;
      
      const headerTexts = [];
      cells.each((i, c) => {
        const raw = $(c).text().trim();
        headerTexts.push(`${i}:"${raw}"`);
        const n = norm(raw);
        
        if (n.includes('eligibledelivered')) headerMap['eligDelv'] = i;
        else if (n.includes('eligibleattended')) headerMap['eligAttd'] = i;
        else if (n.includes('eligiblepercentage')) headerMap['eligPerc'] = i;
        else if (n.includes('totaldelv') || n.includes('totaldelivered')) headerMap['totalDelv'] = i;
        else if (n.includes('totalattd') || n.includes('totalattended')) headerMap['totalAttd'] = i;
        else if (n.includes('coursecode')) headerMap['code'] = i;
        else if (n === 'title' || n.includes('subjectname') || n.includes('coursename')) headerMap['title'] = i;
        else if (n.includes('medicalleave')) headerMap['ml'] = i;
        else if (n === 'idl' || n.includes('dutyleaveidl') || n.includes('dutyleaven')) headerMap['idl'] = i;
        else if (n === 'adl' || n.includes('dutyleaveadl')) headerMap['adl'] = i;
        else if (n === 'vdl' || n.includes('dutyleaveother') || n.includes('dutyleavevdl')) headerMap['vdl'] = i;
      });
      
      headerRowFound = true;
      console.log('HEADER ROW FOUND:', headerTexts.join(' | '));
      console.log('HEADER MAP:', headerMap);
    });
    
    $table.find('tr').each((_, row) => {
      const cells = $(row).find('td');
      if (cells.length < 8) return;
      
      const codeIdx = headerMap['code'] ?? 0;
      const code = cells.eq(codeIdx).text().trim();
      if (!/^\d{2}[A-Z]{2,4}-\d{2,3}$/.test(code) && !/^[A-Z0-9]{3,}-[A-Z0-9]+$/.test(code)) return;
      
      const get = (key, fallbackIdx) => {
        const idx = headerMap[key] ?? fallbackIdx;
        return cells.eq(idx).text().trim() || '0';
      };
      
      const title = get('title', 1);
      const totalDelv = get('totalDelv', 2);
      const totalAttd = get('totalAttd', 3);
      const eligDelv = get('eligDelv', 8);
      const eligAttd = get('eligAttd', 9);
      const eligPerc = get('eligPerc', 10);
      
      records.push({
        code,
        title,
        totalDelv,
        totalAttd,
        eligDelv,
        eligAttd,
        eligPerc
      });
    });
  }

  console.log('Parsed records count:', records.length);
  if (records.length > 0) {
    console.log('First record:', records[0]);
  }
}
