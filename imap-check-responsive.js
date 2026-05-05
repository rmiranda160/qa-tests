const Imap = require('imap');
const { simpleParser } = require('mailparser');

// Check test7, test8, test25 - look for recent emails, template quality, translations
const ACCOUNTS = [
  { email: 'test7@zonacnc.com', pass: '77G7YmLXuOae', host: 'zonacnc.com' },
  { email: 'test8@zonacnc.com', pass: 'FCtyMNYkhoCh', host: 'zonacnc.com' },
  { email: 'test25@zonacnc.com', pass: 'S0CDQRmwzTp8', host: 'zonacnc.com' },
];

async function checkAccount(account) {
  return new Promise((resolve) => {
    const result = { email: account.email, ok: false, recentEmails: [], issues: [] };
    try {
      const imap = new Imap({
        user: account.email,
        password: account.pass,
        host: account.host,
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false }
      });
      let done = false;
      imap.once('ready', () => {
        imap.openBox('INBOX', false, (err, box) => {
          if (err) { result.error = err.message; imap.end(); return; }
          result.totalMessages = box.messages.total;
          if (box.messages.total === 0) { result.ok = true; imap.end(); return; }
          
          const fetch = imap.seq.fetch(`${Math.max(1, box.messages.total - 2)}:${box.messages.total}`, { bodies: '' });
          fetch.on('message', (msg) => {
            msg.on('body', (stream) => {
              simpleParser(stream, (err, parsed) => {
                if (err) { result.issues.push('parse error: ' + err.message); return; }
                const emailData = {
                  subject: parsed.subject,
                  from: parsed.from ? parsed.from.text : 'unknown',
                  date: parsed.date,
                  textPreview: (parsed.text || '').substring(0, 300),
                };
                // Check for template/i18n issues
                const fullText = (parsed.text || '') + (parsed.html || '');
                const i18nIssues = [];
                if (fullText.includes('{') && fullText.includes('}') && (fullText.includes('{$') || fullText.includes('{shop') || fullText.includes('{url'))) {
                  i18nIssues.push('untranslated template variables detected');
                }
                if (/[a-zA-Z]\(s\)/i.test(fullText)) {
                  i18nIssues.push('parentheses pluralization pattern found');
                }
                if (i18nIssues.length > 0) emailData.i18nIssues = i18nIssues;
                result.recentEmails.push(emailData);
              });
            });
          });
          fetch.once('end', () => {
            result.ok = true;
            imap.end();
          });
        });
      });
      imap.once('error', (err) => {
        if (!done) { done = true; result.error = err.message; resolve(result); }
      });
      imap.once('end', () => {
        if (!done) { done = true; resolve(result); }
      });
      setTimeout(() => {
        if (!done) { done = true; result.error = 'timeout'; resolve(result); }
      }, 15000);
    } catch(e) {
      result.error = e.message;
      resolve(result);
    }
  });
}

(async () => {
  const results = [];
  for (const acc of ACCOUNTS) {
    const r = await checkAccount(acc);
    results.push(r);
    console.log(`${acc.email}: ${r.ok ? 'OK' : 'FAIL'} - messages: ${r.totalMessages ?? '?'}`);
    if (r.recentEmails.length > 0) {
      r.recentEmails.forEach(e => {
        console.log(`  Subject: ${e.subject}`);
        console.log(`  Date: ${e.date}`);
        console.log(`  From: ${e.from}`);
        if (e.i18nIssues) console.log(`  ⚠️ i18n issues: ${e.i18nIssues.join(', ')}`);
        console.log(`  Text: ${e.textPreview.substring(0, 150)}...`);
      });
    }
    if (r.error) console.log(`  Error: ${r.error}`);
  }
  // Summary
  const allIssues = results.filter(r => r.issues?.length > 0 || r.recentEmails?.some(e => e.i18nIssues));
  console.log('\n=== SUMMARY ===');
  if (allIssues.length === 0) {
    console.log('✅ No email template/i18n issues detected');
  } else {
    console.log('⚠️ Issues found in emails - see above');
  }
})().catch(e => console.error(e));
