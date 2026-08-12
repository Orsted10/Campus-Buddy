const fs = require('fs');
const cheerio = require('cheerio');
const readline = require('readline');

const BASE_URL = 'https://student.culko.in';
const USER_AGENT = 'Mozilla/5.0';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function extractASPState(html) {
  const $ = cheerio.load(html);
  return {
    viewstate: $('#__VIEWSTATE').val() || '',
    eventvalidation: $('#__EVENTVALIDATION').val() || '',
    viewstategenerator: $('#__VIEWSTATEGENERATOR').val() || ''
  };
}

function extractCookies(response) {
  const setCookie = response.headers.get('set-cookie');
  if (!setCookie) return {};
  const jar = {};
  const cookies = setCookie.split(/,(?=[^;]*=)/);
  cookies.forEach(c => {
    const pair = c.split(';')[0].trim().split('=');
    if (pair.length >= 2) {
      jar[pair[0]] = pair.slice(1).join('=');
    }
  });
  return jar;
}

function serializeCookies(jar) {
  return Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; ');
}

async function run() {
  rl.question('Enter UID: ', async (uid) => {
    rl.question('Enter Password: ', async (password) => {
      rl.close();
      let jar = {};
      
      console.log('Initiating login...');
      const res1 = await fetch(`${BASE_URL}/Login.aspx`, { headers: { 'User-Agent': USER_AGENT } });
      jar = { ...jar, ...extractCookies(res1) };
      const html1 = await res1.text();
      const state1 = extractASPState(html1);
      
      const formData = new URLSearchParams();
      formData.append('__VIEWSTATE', state1.viewstate);
      formData.append('__EVENTVALIDATION', state1.eventvalidation);
      formData.append('__VIEWSTATEGENERATOR', state1.viewstategenerator);
      formData.append('txtUserId', uid);
      formData.append('btnNext', 'Next');
      
      const res2 = await fetch(`${BASE_URL}/Login.aspx`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': serializeCookies(jar),
          'User-Agent': USER_AGENT
        },
        redirect: 'manual'
      });
      
      const redirectUrl = res2.headers.get('location');
      if (!redirectUrl) return console.log('Failed to get redirect. Wrong UID?');
      jar = { ...jar, ...extractCookies(res2) };
      
      const finalUrl = redirectUrl.startsWith('http') ? redirectUrl : `${BASE_URL}/${redirectUrl}`;
      const res3 = await fetch(finalUrl, {
        method: 'GET',
        headers: {
          'Cookie': serializeCookies(jar),
          'User-Agent': USER_AGENT
        }
      });
      
      const html3 = await res3.text();
      const $ = cheerio.load(html3);
      
      const captchaImgTag = $('img').filter((i, el) => {
        const src = $(el).attr('src');
        return src ? src.toLowerCase().includes('generatecaptcha.aspx') : false;
      });
      
      if(captchaImgTag.length > 0) {
        console.log("Found captcha. We need to handle password login step which is more complex in a simple script.");
        console.log("Instead of logging in via script, please log in to the portal in your browser, open Developer Tools (F12) -> Console, and run this:");
        console.log(`Array.from(document.querySelectorAll('a')).map(a => a.href).filter(h => h.toLowerCase().includes('time')).forEach(h => console.log(h))`);
      }
    });
  });
}

run().catch(console.error);
