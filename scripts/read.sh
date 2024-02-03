#!/bin/bash

# Directory of the script itself
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
echo "Script directory: $SCRIPT_DIR"

# Load environment variables from .env file located in the parent directory
ENV_FILE="$SCRIPT_DIR/../.env"
echo "Looking for .env file at $ENV_FILE"

if [ -f "$ENV_FILE" ]; then
    echo "Found .env file, loading environment variables..."
    export $(grep -v '^#' "$ENV_FILE" | xargs)
else
    echo "Error: .env file not found in the parent directory."
    exit 1
fi

# Check if the correct number of arguments was provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 network appId"
    exit 1
fi

network=$1
app_id=$2
echo "Network: $network, App ID: $app_id"

# Define network-specific variables using the sourced environment variables
case $network in
  local)
    server=$ALGOD_LOCAL_SERVER
    token=$ALGOD_LOCAL_TOKEN
    port=$ALGOD_LOCAL_PORT
    ;;
  testnet)
    server=$ALGOD_TESTNET_SERVER
    token=$ALGOD_TESTNET_TOKEN
    port=$ALGOD_TESTNET_PORT
    ;;
  mainnet)
    server=$ALGOD_MAINNET_SERVER
    token=$ALGOD_MAINNET_TOKEN
    port=$ALGOD_MAINNET_PORT
    ;;
  *)
    echo "Unsupported network. Please use 'local', 'testnet', or 'mainnet'."
    exit 1
    ;;
esac

echo "Server: $server, Token: $token, Port: $port"

# Call the read.mjs script, passing the necessary environment variables and arguments
NODE_OPTIONS=--experimental-json-modules \
SERVER="$server" \
TOKEN="$token" \
PORT="$port" \
NETWORK="$network" \
node "$SCRIPT_DIR/read.mjs" "$app_id"
