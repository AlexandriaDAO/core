#!/bin/bash

# Number of times to run the command
n=10

# The command to run
command="dfx canister call icp_swap swap 100000000"

# Function to run the command and capture output
run_command() {
    output=$($command 2>&1)
    echo "Command $1 output:"
    echo "$output"
    echo "------------------------"
}

# Run commands concurrently
for i in $(seq 1 $n)
do
    run_command $i &
done

# Wait for all background processes to finish
wait

echo "All commands completed."