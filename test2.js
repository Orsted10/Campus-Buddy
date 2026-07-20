const fs = require('fs');
fetch('https://student.culko.in/Login.aspx')
  .then(res => res.text())
  .then(html => {
    const cheerio = require('cheerio');
    const $ = cheerio.load(html);
    $('img').each((i, el) => {
      console.log($(el).attr('src'));
    });
  })
  .catch(err => console.error(err));
