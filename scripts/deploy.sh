#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]
then
    while IFS='=' read -r key value
    do
    if [ -n "$value" ]; then
        export "$key"="$value"
    fi
    done < <(grep -v '^#' .env | sed 's/^ *//;s/ *$//')
fi

if [ -z "$1" ]
then
  echo "Please specify the network (local, testnet, mainnet):"
  read network
else
  network=$1
fi

if [[ $network != "local" && $network != "testnet" && $network != "mainnet" ]]
then
  echo "Invalid network. Please choose between local, testnet, or mainnet."
  exit 1
fi

# Set the network details based on the chosen network
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
esac

# Prompt for arguments if not provided
if [ -z "$2" ]
then
  echo "Please provide number of global state byte variables (numGlobalByteSlices):"
  read numGlobalByteSlices
else
  numGlobalByteSlices=$2
fi

if [ -z "$3" ]
then
  echo "Please provide number of global state int variables (numGlobalInts):"
  read numGlobalInts
else
  numGlobalInts=$3
fi

if [ -z "$4" ]
then
  echo "Please provide number of local state byte variables (numLocalByteSlices):"
  read numLocalByteSlices
else
  numLocalByteSlices=$4
fi

if [ -z "$5" ]
then
  echo "Please provide number of local state int variables (numLocalInts):"
  read numLocalInts
else
  numLocalInts=$5
fi

NODE_OPTIONS="--unhandled-rejections=strict" \
ALGOD_SERVER=$server \
ALGOD_TOKEN=$token \
ALGOD_PORT=$port \
DEPLOYER_MNEMONIC="$DEPLOYER_MNEMONIC" \
NETWORK=$network \
node scripts/deploy.mjs $numGlobalByteSlices $numGlobalInts $numLocalByteSlices $numLocalInts
