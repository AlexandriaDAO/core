#!/bin/bash

# Function to check if port 4943 is in use
check_port() {
    lsof -i:4943 >/dev/null 2>&1
    return $?
}

# Function to display detailed port information
show_port_info() {
    echo "Detailed port 4943 information:"
    echo "--- lsof output ---"
    sudo lsof -i:4943 || echo "No lsof results"
    echo "--- netstat output ---"
    sudo netstat -tulpn | grep :4943 || echo "No netstat results"
    echo "--- ss output ---"
    sudo ss -lptn sport = :4943 || echo "No ss results"
}

echo "Cleaning up dfx processes..."

# Kill dfx processes first
sudo pkill -f dfx
sleep 1

# Kill any existing replica processes
sudo ps aux | grep "[r]eplica" | awk '{print $2}' | xargs -r sudo kill -9

# Try to kill processes using port 4943 multiple ways
if check_port; then
    echo "Port 4943 is in use. Attempting to free it..."
    
    # Method 1: Using lsof with sudo
    sudo lsof -ti:4943 | xargs -r sudo kill -9
    
    # Method 2: Using fuser with sudo
    sudo fuser -k 4943/tcp 2>/dev/null
    
    # Method 3: Using netstat with sudo
    sudo netstat -tulpn 2>/dev/null | grep ':4943' | awk '{print $7}' | cut -d'/' -f1 | xargs -r sudo kill -9
    
    # Method 4: Using ss command
    sudo ss -lptn sport = :4943 | grep -v "LISTEN" | awk 'NR>1 {print $6}' | cut -d',' -f2 | xargs -r sudo kill -9
fi

# Wait longer for processes to fully terminate
sleep 3

# Verify port is free
if check_port; then
    echo "ERROR: Port 4943 is still in use."
    show_port_info
    echo "You may need to reboot your system if the port cannot be freed."
    exit 1
else
    echo "Port 4943 is now free"
fi

# Final check for replica processes
if ps aux | grep -q "[r]eplica"; then
    echo "Warning: Some replica processes may still be running. Listing them:"
    ps aux | grep "[r]eplica"
    exit 1
else
    echo "All replica processes successfully terminated"
fi

# Check for any remaining dfx processes
if pgrep -f dfx > /dev/null; then
    echo "Warning: Some dfx processes may still be running. Listing them:"
    ps aux | grep "[d]fx"
    exit 1
else
    echo "All dfx processes successfully terminated"
fi

echo "Cleanup complete"