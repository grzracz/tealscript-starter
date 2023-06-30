import algosdk from 'algosdk';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const creator_mnemonic = process.env.DEPLOYER_MNEMONIC.trim();
const algod_address = process.env.ALGOD_SERVER;
const algod_token = process.env.ALGOD_TOKEN;
const algod_port = process.env.ALGOD_PORT;

const algodClient = new algosdk.Algodv2(algod_token, algod_address, algod_port);

const buildDir = path.join(__dirname, '../build');
const files = fs.readdirSync(buildDir);

const approvalFile = files.find(file => file.endsWith('approval.teal'));
const clearFile = files.find(file => file.endsWith('clear.teal'));

if (!approvalFile || !clearFile) {
  throw new Error('Could not find build files. Did you run yarn compile?');
}

const approvalProgram = fs.readFileSync(
  path.join(buildDir, approvalFile),
  'utf8',
);
const clearProgram = fs.readFileSync(path.join(buildDir, clearFile), 'utf8');

const approvalCompileResp = await algodClient
  .compile(Buffer.from(approvalProgram))
  .do();

const compiledApprovalProgram = new Uint8Array(
  Buffer.from(approvalCompileResp.result, 'base64'),
);

console.log('Compiled approval program.');

const clearCompileResp = await algodClient
  .compile(Buffer.from(clearProgram))
  .do();

const compiledClearProgram = new Uint8Array(
  Buffer.from(clearCompileResp.result, 'base64'),
);

console.log('Compiled clear program.');

console.log(`Deploying to ${process.env.NETWORK}...`);

const creator = algosdk.mnemonicToSecretKey(creator_mnemonic);

const numGlobalByteSlices = parseInt(process.argv[2] || '0');
const numGlobalInts = parseInt(process.argv[3] || '0');
const numLocalByteSlices = parseInt(process.argv[4] || '0');
const numLocalInts = parseInt(process.argv[5] || '0');

async function deploy() {
  const suggestedParams = await algodClient.getTransactionParams().do();

  const appCreateTxn = algosdk.makeApplicationCreateTxnFromObject({
    from: creator.addr,
    approvalProgram: compiledApprovalProgram,
    clearProgram: compiledClearProgram,
    numGlobalByteSlices,
    numGlobalInts,
    numLocalByteSlices,
    numLocalInts,
    suggestedParams,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
  });

  // Sign and send
  await algodClient.sendRawTransaction(appCreateTxn.signTxn(creator.sk)).do();
  const result = await algosdk.waitForConfirmation(
    algodClient,
    appCreateTxn.txID().toString(),
    3,
  );

  const appId = result['application-index'];
  console.log(
    `App deployed successfully. App ID: 
    ${appId.toString()} ${
      process.env.NETWORK.trim() === 'local'
        ? ''
        : `(${
            process.env.NETWORK.trim() === 'testnet'
              ? `https://testnet.algoscan.app/app/${appId}`
              : `https://algoscan.app/app/${appId}`
          })`
    }`,
  );
}

deploy().catch(e => {
  console.error(e);
  process.exit(1);
});
