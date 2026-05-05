const Imap = require('imap');

const EMAIL = 'test25@zonacnc.com';
const PASSWORD = 'S0CDQRmwzTp8';

const imap = new Imap({
  user: EMAIL,
  password: PASSWORD,
  host: 'mail.zonacnc.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
  debug: null
});

let done = false;
const finish = (msg, code) => { if (!done) { done = true; console.log(msg); process.exit(code); } };

imap.once('ready', () => {
  console.log('READY');
  imap.openBox('INBOX', true, (err, box) => {
    if (err) { finish('FAIL openBox: ' + err.message, 1); return; }
    console.log('INBOX total:', box.messages.total);
    
    if (box.messages.total === 0) {
      finish('NO_MESSAGES', 0);
      return;
    }
    
    const start = Math.max(1, box.messages.total - 9);
    const f = imap.seq.fetch(`${start}:${box.messages.total}`, {
      bodies: ['HEADER.FIELDS (SUBJECT FROM DATE)', 'TEXT'],
      struct: true,
      markSeen: false
    });
    
    const messages = [];
    f.on('message', (msg, seqno) => {
      let msgData = { seqno, headers: '', body: '' };
      
      msg.on('body', (stream, info) => {
        const isText = info.which === 'TEXT';
        stream.on('data', chunk => {
          if (isText) msgData.body += chunk.toString('utf8');
          else msgData.headers += chunk.toString('utf8');
        });
      });
      
      msg.on('end', () => { messages.push(msgData); });
    });
    
    f.once('error', err => { finish('FETCH error: ' + err.message, 1); });
    f.once('end', () => {
      console.log('MESSAGES:', messages.length);
      messages.sort((a,b) => a.seqno - b.seqno);
      messages.forEach(m => {
        console.log('=== MSG', m.seqno, '===');
        console.log('HEADERS:', m.headers.substring(0, 500));
        const cleanBody = m.body.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').substring(0, 2000);
        // Extract reset URL if any
        const urlMatch = m.body.match(/https?:\/\/[^\s"]*recuperar[^\s"]*/i);
        if (urlMatch) console.log('RESET URL:', urlMatch[0]);
        const tokenMatch = m.body.match(/token=([a-zA-Z0-9_\-]+)/);
        if (tokenMatch) console.log('TOKEN:', tokenMatch[0]);
        console.log('BODY:', cleanBody);
      });
      finish('DONE', 0);
    });
  });
});

imap.once('error', err => { finish('FAIL imap: ' + err.message, 1); });
imap.once('end', () => { if (!done) finish('END', 0); });

setTimeout(() => { finish('TIMEOUT', 1); }, 20000);
