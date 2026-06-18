const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('debug_attendance_ajax.html', 'utf8');
const $ = cheerio.load(html);
const scripts = [];
$('script').each((i, el) => {
    const src = $(el).attr('src');
    if (src) scripts.push(src);
});
console.log(scripts);
