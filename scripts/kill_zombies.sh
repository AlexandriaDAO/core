#!/bin/bash

# Function to check if port 4943 is in use
check_port() {
    lsof -i:4943 >/dev/null 2>&1
    return $?
}

# Function to kill processes more aggressively
kill_process() {
    local pid=$1
    sudo kill -15 $pid 2>/dev/null
    sleep 1
    if kill -0 $pid 2>/dev/null; then
        sudo kill -9 $pid 2>/dev/null
    fi
}

echo "Cleaning up dfx processes..."

# Kill dfx processes first
sudo pkill -f dfx
sleep 1

# Kill any existing replica processes
sudo ps aux | grep "[r]eplica" | awk '{print $2}' | while read pid; do
    kill_process $pid
done

# Try to kill processes using port 4943
if check_port; then
    echo "Port 4943 is in use. Freeing it..."
    sudo lsof -ti:4943 | while read pid; do
        kill_process $pid
    done
    sudo fuser -k 4943/tcp 2>/dev/null
fi

sleep 2

# Final verification
if check_port; then
    echo "ERROR: Port 4943 is still in use. You may need to reboot."
    exit 1
fi

echo "Cleanup complete"