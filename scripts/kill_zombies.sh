#!/bin/bash

# Kill any existing replica processes
ps aux | grep "[r]eplica" | awk '{print $2}' | xargs -r kill -9

# Kill any process using dfx port
fuser -k 4943/tcp 2>/dev/null

# Verify no processes are left
sleep 1
if ps aux | grep -q "[r]eplica"; then
    echo "Warning: Some replica processes may still be running"
else
    echo "All replica processes successfully terminated"
fi