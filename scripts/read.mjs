import algosdk from 'algosdk';
import process from 'process';

console.log("Reading environment variables and arguments...");
const server = process.env.SERVER;
const token = { 'X-API-Key': process.env.TOKEN };
const port = process.env.PORT;
const appId = process.argv[2];

console.log(`Server: ${server}, Token: ${token['X-API-Key']}, Port: ${port}, App ID: ${appId}`);

console.log("Initializing Algorand client...");
const algodClient = new algosdk.Algodv2(token, server, port);

function decodeBase64(str) {
    return Buffer.from(str, 'base64').toString('ascii');
}

async function readGlobalState(client, appId) {
    console.log(`Fetching global state for app ID: ${appId}`);
    const appInfo = await client.getApplicationByID(appId).do();
    return appInfo.params['global-state'];
}

async function main() {
    try {
        const globalState = await readGlobalState(algodClient, appId);
        const decodedState = globalState.map(entry => ({
            ...entry,
            key: decodeBase64(entry.key)
        }));
        console.log("Global State:", JSON.stringify(decodedState, null, 2));
    } catch (error) {
        console.error("Failed to read global state:", error);
    }
}


main();
