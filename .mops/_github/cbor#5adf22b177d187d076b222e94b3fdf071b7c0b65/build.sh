#!/usr/bin/env bash

dir=build
if [[ ! -e $dir ]]; then
    mkdir -p $dir
fi
for filename in "Decoder" "Encoder" "Errors" "Value"
do
    echo "Building $filename..."
    $(vessel bin)/moc $(mops sources) -wasi-system-api "./src/$filename.mo" -o $dir/$filename.wasm
    echo "Building $filename complete"
done