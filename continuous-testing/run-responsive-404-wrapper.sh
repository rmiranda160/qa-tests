#!/usr/bin/env bash
export LD_LIBRARY_PATH=/tmp/libextracted/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH
cd /home/node/.openclaw/workspace-tester/continuous-testing
node run-responsive-404.js 2>&1