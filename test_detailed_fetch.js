const keys = ['CourseCode', 'Title', 'Total_Delv', 'Total_Attd', 'Eligible_Delivered', 'Eligible_Attended', 'Eligible_Percentage', 'EncryptCode'];
const record = {
  'CourseCode': '25CSH-102',
  'Title': 'Computer Eco-System',
  'Total_Delv': '94',
  'Total_Attd': '74',
  'Eligible_Delivered': '90',
  'Eligible_Attended': '74',
  'Eligible_Percentage': '82.22',
  'EncryptCode': 'mhzuK+SCx4KBPrfGqpzTj2Fr64uT3+qWeRW9X3qOoSE='
};

const getVal = (possibleKeys) => {
  for (const pk of possibleKeys) {
    const normPK = pk.toLowerCase().replace(/[^a-z0-9]/g, '');
    const exactKey = keys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === normPK);
    if (exactKey && record[exactKey] !== null && record[exactKey] !== undefined) {
      return String(record[exactKey]).trim();
    }
  }
  for (const pk of possibleKeys) {
    const normPK = pk.toLowerCase().replace(/[^a-z0-9]/g, '');
    const partialKey = keys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '').includes(normPK));
    if (partialKey && record[partialKey] !== null && record[partialKey] !== undefined) {
      return String(record[partialKey]).trim();
    }
  }
  return null;
};

const code = getVal(['coursecode', 'code']) || '';
const title = getVal(['title', 'coursename', 'subject', 'subjectname']) || 'Unknown';
const total = getVal(['totaldelv', 'totaldelivered', 'delivered', 'totalclasses']) || '0';
const attended = getVal(['totalattd', 'totalattended', 'attended', 'totalpresent']) || '0';
const eligDelv = getVal(['eligibledelivered', 'eligibledelv', 'eligdelv', 'serveddelivered']) || total;
const eligAttd = getVal(['eligibleattended', 'eligibleattd', 'eligattd', 'servedattended']) || attended;
const eligPerc = getVal(['eligiblepercentage', 'eligibleperc', 'eligperc', 'servedpercentage']) || '0%';
const chk = getVal(['encryptcode', 'chk']) || '';

console.log('--- TEST RESULTS ---');
console.log('Code:', code);
console.log('Title:', title);
console.log('Total Delivered:', total);
console.log('Total Attended:', attended);
console.log('Eligible Delivered:', eligDelv);
console.log('Eligible Attended:', eligAttd);
console.log('Eligible Percentage:', eligPerc);
console.log('EncryptCode (chk):', chk);

if (eligDelv === '90' && eligPerc === '82.22' && chk === 'mhzuK+SCx4KBPrfGqpzTj2Fr64uT3+qWeRW9X3qOoSE=') {
  console.log('\n✅ SUCCESS: All metrics parsed perfectly with zero collisions!');
} else {
  console.log('\n❌ FAILURE: Mismatch in parsed metrics.');
}
