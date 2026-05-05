const dns = require('dns');
dns.resolveMx('zonacnc.com', (err, addresses) => {
  if (err) console.log('MX error:', err.message);
  else console.log('MX records:', JSON.stringify(addresses));
});
dns.resolve('mail.zonacnc.com', (err, addresses) => {
  if (err) console.log('A error:', err.message);
  else console.log('mail.zonacnc.com A:', JSON.stringify(addresses));
});
