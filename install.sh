#!/bin/bash

# Debug output
echo "Current directory: $(pwd)"
echo "Contents of current directory:"
ls -la

# Ensure we're in the correct directory
cd "$(dirname "$0")"

# More debug output
echo "After cd, current directory: $(pwd)"
echo "Contents of current directory after cd:"
ls -la

# Source the constants file
source ./constants.sh

set -euo pipefail

# Create the bin directory if it doesn't exist
mkdir -p "$REPO_ROOT/bin"

pushd "$REPO_ROOT/bin"

curl --fail -L "https://download.dfinity.systems/ic/${IC_COMMIT}/binaries/x86_64-${OS}/ic-admin.gz" -o ic-admin.gz
gzip -fd ic-admin.gz
chmod +x ic-admin

curl --fail -L "https://download.dfinity.systems/ic/${IC_COMMIT}/binaries/x86_64-${OS}/ic-nns-init.gz" -o ic-nns-init.gz
gzip -fd ic-nns-init.gz
chmod +x ic-nns-init

curl --fail -L "https://download.dfinity.systems/ic/${IC_COMMIT}/binaries/x86_64-${OS}/ic-regedit.gz" -o ic-regedit.gz
gzip -fd ic-regedit.gz
chmod +x ic-regedit

if [ "${CANISTER_TEST}" == "_test" ]
then
  curl --fail -L "https://download.dfinity.systems/ic/${IC_COMMIT}/binaries/x86_64-${OS}/sns-test-feature.gz" -o sns.gz
else
  curl --fail -L "https://download.dfinity.systems/ic/${IC_COMMIT}/binaries/x86_64-${OS}/sns.gz" -o sns.gz
fi
gzip -fd sns.gz
chmod +x sns

curl --fail -L "https://github.com/dfinity/sdk/releases/download/${DFX_VERSION}/dfx-${DFX_VERSION}-x86_64-${OS}.tar.gz" -o dfx.tar.gz
tar -xzf dfx.tar.gz
rm dfx.tar.gz
chmod +x dfx

if [[ "${OS}" == "linux" ]]
then
  export QUILL="linux"
elif [[ "${OS}" == "darwin" ]]
then
  export QUILL="macos"
else
  echo "Unknown OS!"
  exit 1
fi

curl --fail -L "https://github.com/dfinity/quill/releases/download/v0.4.2/quill-${QUILL}-x86_64" -o quill
chmod +x quill

if [[ "${OS}" == "linux" ]]
then
  export DIDC="linux64"
elif [[ "${OS}" == "darwin" ]]
then
  export DIDC="macos"
else
  echo "Unknown OS!"
  exit 1
fi

curl --fail -L "https://github.com/dfinity/candid/releases/download/2022-11-17/didc-${DIDC}" -o didc
chmod +x didc

if [[ "${OS}" == "linux" ]]
then
  curl --fail -L "https://github.com/dfinity/idl2json/releases/download/v0.8.8/idl2json_cli-x86_64-unknown-linux-musl.tar.gz" -o idl2json.tar.gz
  tar -xzf idl2json.tar.gz
  rm idl2json.tar.gz
  chmod +x idl2json
else
  curl --fail -L "https://github.com/dfinity/idl2json/releases/download/v0.8.8/idl2json_cli-x86_64-apple-darwin.zip" -o idl2json.zip
  unzip idl2json.zip
  rm idl2json.zip
  chmod +x idl2json
fi

# Add $REPO_ROOT/bin to path
export PATH="$(readlink -f .):${PATH}"

popd
