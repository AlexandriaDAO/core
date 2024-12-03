#!/bin/bash

# Function to check if port 4943 is in use
check_port() {
    netstat -tuln | grep -q ":4943 "
    return $?
}

# Function to kill processes more aggressively
kill_process() {
    local pid=$1
    echo "Attempting to kill process $pid"
    sudo kill -15 $pid 2>/dev/null
    sleep 2
    if kill -0 $pid 2>/dev/null; then
        echo "Process $pid still running, forcing kill..."
        sudo kill -9 $pid 2>/dev/null
        sleep 1
    fi
}

echo "Cleaning up dfx processes..."

# Kill dfx processes first
sudo pkill -f dfx
sleep 2

# Kill any existing replica processes more thoroughly
for pid in $(ps aux | grep -E "[r]eplica|[d]fx" | awk '{print $2}'); do
    kill_process $pid
done

# Try to kill processes using port 4943 multiple ways
if check_port; then
    echo "Port 4943 is in use. Attempting to free it..."
    
    # Method 1: Using lsof
    sudo lsof -ti:4943 | while read pid; do
        kill_process $pid
    done
    
    # Method 2: Using fuser
    sudo fuser -k -n tcp 4943 2>/dev/null
    
    # Method 3: Using netstat and kill
    sudo netstat -tlnp | grep ":4943 " | awk '{print $7}' | cut -d'/' -f1 | while read pid; do
        [ ! -z "$pid" ] && kill_process $pid
    done
    
    sleep 3
fi

# Final verification with more detailed output
if check_port; then
    echo "ERROR: Port 4943 is still in use. Running diagnostics..."
    echo "Current processes using port 4943:"
    sudo lsof -i:4943
    echo "Network status for port 4943:"
    sudo netstat -tlnp | grep ":4943 "
    echo "You may need to try one of the following:"
    echo "1. Wait a few moments and run this script again"
    echo "2. Manually run: sudo fuser -k 4943/tcp"
    echo "3. Reboot your system"
    exit 1
fi

echo "Cleanup complete - port 4943 is now free"