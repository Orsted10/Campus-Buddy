const fs = require('fs');
fetch('https://student.culko.in/Login.aspx')
  .then(res => res.text())
  .then(html => {
    console.log("HTML length:", html.length);
    const m = html.match(/<img[^>]+src=[\"']([^\"']*captcha[^\"']*)[\"'][^>]*>/i);
    console.log("Found:", m ? m[1] : "not found");
  })
  .catch(err => console.error(err));
