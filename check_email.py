#!/usr/bin/env python3
"""Check IMAP inbox for password reset email for test25@zonacnc.com"""
import imaplib
import email
import re
import sys
import ssl
import time

# Credentials for test25
IMAP_HOST = "mail.zonacnc.com"
IMAP_PORT = 993
IMAP_USER = "test25@zonacnc.com"
IMAP_PASS = "S0CDQRmwzTp8"

ssl_context = ssl.create_default_context()
# Don't verify cert in case of issues - REMOVE THIS IF not needed
# ssl_context.check_hostname = False
# ssl_context.verify_mode = ssl.CERT_NONE

try:
    mail = imaplib.IMAP4_SSL(IMAP_HOST, IMAP_PORT, ssl_context=ssl_context)
    mail.login(IMAP_USER, IMAP_PASS)
    mail.select("INBOX")
    
    # Search for ALL emails (newest first if we use UIDs)
    status, messages = mail.search(None, "ALL")
    if status != "OK":
        print("No messages found in search")
        sys.exit(1)
    
    msg_ids = messages[0].split()
    print(f"Total messages in inbox: {len(msg_ids)}")
    
    if not msg_ids:
        print("Inbox is empty")
        sys.exit(0)
    
    # Fetch last 10 emails
    for msg_id in reversed(msg_ids[-10:]):
        status, msg_data = mail.fetch(msg_id, "(RFC822)")
        if status != "OK":
            continue
        
        for response_part in msg_data:
            if isinstance(response_part, tuple):
                msg = email.message_from_bytes(response_part[1])
                subject = email.header.decode_header(msg.get("Subject", ""))
                subject_str = ""
                for part, charset in subject:
                    if isinstance(part, bytes):
                        subject_str += part.decode(charset or "utf-8", errors="replace")
                    else:
                        subject_str += part
                
                date = msg.get("Date", "")
                from_ = msg.get("From", "")
                
                print(f"\n--- Email {msg_id.decode()} ---")
                print(f"Date: {date}")
                print(f"From: {from_}")
                print(f"Subject: {subject_str}")
                
                # Get body
                body = ""
                if msg.is_multipart():
                    for part in msg.walk():
                        content_type = part.get_content_type()
                        if content_type == "text/plain" or content_type == "text/html":
                            try:
                                payload = part.get_payload(decode=True)
                                if payload:
                                    charset = part.get_content_charset() or "utf-8"
                                    body = payload.decode(charset, errors="replace")
                                    if content_type == "text/plain":
                                        break  # Prefer plain text
                            except:
                                pass
                else:
                    try:
                        payload = msg.get_payload(decode=True)
                        if payload:
                            charset = msg.get_content_charset() or "utf-8"
                            body = payload.decode(charset, errors="replace")
                    except:
                        pass
                
                # Look for password reset links
                reset_links = re.findall(r'https?://[^\s<>"]*recuperar[^\s<>"]*token=[^\s<>"]*', body)
                if not reset_links:
                    reset_links = re.findall(r'https?://[^\s<>"]*reset[^\s<>"]*token=[^\s<>"]*', body)
                if not reset_links:
                    reset_links = re.findall(r'https?://[^\s<>"]*password[^\s<>"]*token=[^\s<>"]*', body)
                if not reset_links:
                    reset_links = re.findall(r'https?://[^\s<>"]*contraseña[^\s<>"]*token=[^\s<>"]*', body)
                if not reset_links:
                    # Try any link with token
                    reset_links = re.findall(r'https?://new\.zonacnc\.com[^\s<>"]*token=[^\s<>"]*', body)
                
                if reset_links:
                    print(f"RESET LINK FOUND: {reset_links[0]}")
                
                # Print first 500 chars of body
                print(f"Body preview: {body[:500]}")
    
    mail.close()
    mail.logout()
except imaplib.IMAP4.error as e:
    print(f"IMAP error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
