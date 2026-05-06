import socket, ssl, re, quopri

ctx = ssl.create_default_context()

def get_email_body(user, passwd, eid):
    s = ctx.wrap_socket(socket.socket(socket.AF_INET), server_hostname='zonacnc.com')
    s.settimeout(10)
    s.connect(('zonacnc.com', 993))
    s.recv(4096)
    s.send(f'A001 LOGIN {user} {passwd}\r\n'.encode())
    s.recv(8192)
    s.send(b'A002 SELECT INBOX\r\n')
    s.recv(8192)
    s.send(f'A{eid} FETCH {eid} (BODY[])\r\n'.encode())
    d = b''
    while True:
        c = s.recv(16384)
        d += c
        if f'A{eid} OK'.encode() in d: break
    s.send(b'A999 LOGOUT\r\n')
    s.recv(4096)
    s.close()
    return d

def parse_email(raw):
    txt = raw.decode('utf-8', errors='replace')
    result = {}
    
    hdr_end = txt.find('\r\n\r\n')
    headers = txt[:hdr_end] if hdr_end > 0 else txt
    for line in headers.split('\n'):
        if line.startswith('Subject: ') and all(x not in line for x in ['Date:', 'From:', 'To:', 'Sender:']):
            result['subject'] = line[9:].strip()
            break
    
    ctp_idx = txt.find('Content-Type: text/plain')
    if ctp_idx > 0:
        after_ct = txt[ctp_idx:]
        body_start = after_ct.find('\r\n\r\n')
        if body_start > 0:
            body_raw = after_ct[body_start+4:]
            boundary_end = body_raw.find('\r\n--')
            if boundary_end > 0:
                body_raw = body_raw[:boundary_end]
            clean = body_raw.replace('=\r\n', '')
            try:
                dec = quopri.decodestring(clean.encode('latin-1')).decode('utf-8', errors='replace')
            except:
                dec = clean
            result['body'] = dec
    
    cth_idx = txt.find('Content-Type: text/html')
    if cth_idx > 0:
        after_cth = txt[cth_idx:]
        tm = re.search(r'<title>(.+?)</title>', after_cth)
        if tm:
            result['title'] = tm.group(1).strip()
    
    return result

def check_issues(body, subj):
    issues = []
    if 'myads_url' in body or '{myads_url}' in body:
        issues.append('UNRESOLVED_PLACEHOLDER_{myads_url}')
    if 'prorrateado por Stripe' in body:
        issues.append('UNRESOLVED_PRORATE')
    if body.startswith('Hello') and 'Hola' not in body:
        issues.append('ENGLISH_BODY_FOR_ES_ACCT')
    if 'Your tu plan' in body or 'your tu plan' in body.lower():
        issues.append('BROKEN_ES_EN_MIX')
    if 'Anuncios incluidos: 1' in body:
        issues.append('WRONG_AD_COUNT_1_SHOULD_BE_3')
    if 'decontraseña' in subj or ('decontraseña' in body and 'Confirmación' in body):
        issues.append('MISSING_SPACE_decontraseña')
    return issues

targets = [
    ('test21@zonacnc.com', 'TDJFJjQNybV7', [(7,'Welcome'), (8,'Starter active'), (9,'Onboarding'), (10,'Invoice paid')]),
    ('test22@zonacnc.com', 'a2QYlGpy7YbK', [(10,'New password'), (11,'Cancellation')]),
    ('test16@zonacnc.com', 'l1wFPQQmwRc0', [(12,'Invoice paid'), (13,'Onboarding')]),
    ('test10@zonacnc.com', '28aP06IHZgvP', [(14,'Onboarding'), (15,'Invoice paid')]),
    ('test26@zonacnc.com', 'Ttc5ZxPltimz', [(8,'Onboarding EN'), (10,'Cancellation'), (14,'Onboarding ES'), (15,'Starter welcome')]),
    ('test8@zonacnc.com', 'FCtyMNYkhoCh', [(20,'Onboarding EN'), (22,'Cancellation')]),
]

for user, pw, emails in targets:
    for eid, desc in emails:
        try:
            raw = get_email_body(user, pw, eid)
            r = parse_email(raw)
            body = r.get('body', '')
            subj = r.get('subject', '')
            title = r.get('title', '')
            issues = check_issues(body, subj)
            if issues:
                aname = user.split('@')[0]
                print(f"[{aname} #{eid} {desc}] Subj: {subj[:100]}")
                if title: print(f"  HTML title: {title}")
                print(f"  Body: {body[:400]}")
                print(f"  ISSUES: {issues}")
                print()
        except Exception as e:
            print(f"ERROR {user} #{eid}: {e}")

print("SCAN COMPLETE")
