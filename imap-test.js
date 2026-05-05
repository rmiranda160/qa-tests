const Imap = require('imap');
const EMAIL = 'test8@zonacnc.com';
const PASSWORD = 'FCtyMNYkhoCh';

try {
  const imap = new Imap({
    user: EMAIL,
    password: PASSWORD,
    host: 'mail.zonacnc.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
  });

  let done = false;

  imap.once('ready', () => {
    imap.openBox('INBOX', false, (err, box) => {
      if (err) { console.log('FAIL openBox: ' + err.message); imap.end(); return; }
      console.log('OK inbox ' + box.messages.total);
      imap.end();
    });
  });
  
  imap.once('error', err => {
    if (!done) { done = true; console.log('FAIL imap: ' + err.message); process.exit(1); }
  });
  
  imap.once('end', () => {
    if (!done) { done = true; process.exit(0); }
  });
  
  setTimeout(() => {
    if (!done) { done = true; console.log('FAIL timeout'); process.exit(1); }
  }, 15000);
} catch(e) {
  console.log('FAIL: ' + e.message);
  process.exit(1);
}
