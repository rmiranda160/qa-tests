#!/usr/bin/env python3
import os
import sys
import shutil
import time
from datetime import datetime, timedelta

RESULTS_DIR = os.path.join(os.path.dirname(__file__), 'playwright-tester', 'results')
SCREENSHOTS_ARCHIVE = os.path.join(os.path.dirname(__file__), 'screenshots')

def clean_old_screenshots(days=7):
    """Delete screenshot files older than `days` days."""
    cutoff = time.time() - days * 86400
    deleted = 0
    for root, dirs, files in os.walk(RESULTS_DIR):
        for file in files:
            if file.endswith('.png'):
                path = os.path.join(root, file)
                if os.path.getmtime(path) < cutoff:
                    os.remove(path)
                    deleted += 1
                    print(f"Deleted old screenshot: {file}")
    return deleted

def organize_by_date():
    """Move screenshots into date-based subdirectories."""
    if not os.path.exists(SCREENSHOTS_ARCHIVE):
        os.makedirs(SCREENSHOTS_ARCHIVE)
    moved = 0
    for root, dirs, files in os.walk(RESULTS_DIR):
        for file in files:
            if file.endswith('.png'):
                src = os.path.join(root, file)
                mtime = os.path.getmtime(src)
                date_dir = datetime.fromtimestamp(mtime).strftime('%Y-%m-%d')
                dest_dir = os.path.join(SCREENSHOTS_ARCHIVE, date_dir)
                if not os.path.exists(dest_dir):
                    os.makedirs(dest_dir)
                dest = os.path.join(dest_dir, file)
                # Avoid overwriting
                if os.path.exists(dest):
                    base, ext = os.path.splitext(file)
                    i = 1
                    while os.path.exists(dest):
                        dest = os.path.join(dest_dir, f"{base}_{i}{ext}")
                        i += 1
                shutil.move(src, dest)
                moved += 1
                print(f"Moved {file} -> {dest_dir}/")
    return moved

def main():
    print("Managing screenshots...")
    deleted = clean_old_screenshots(7)
    print(f"Deleted {deleted} old screenshots.")
    moved = organize_by_date()
    print(f"Moved {moved} screenshots to archive.")
    # Optionally create a collage report (placeholder)
    # generate_collage()
    print("Done.")

if __name__ == '__main__':
    main()