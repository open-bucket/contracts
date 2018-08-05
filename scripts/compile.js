const {compile} = require('solc');
const {readFileSync, writeFileSync} = require('fs');
const {resolve} = require('path');

const CONTRACT_PATH = resolve(__dirname, '../contracts');

const output = compile({
    sources: {
        'Consumer.sol': readFileSync(`${CONTRACT_PATH}/Consumer.sol`, 'UTF-8'),
        'Activator.sol': readFileSync(`${CONTRACT_PATH}/Activator.sol`, 'UTF-8'),
        'ConsumerActivator.sol': readFileSync(`${CONTRACT_PATH}/ConsumerActivator.sol`, 'UTF-8'),
        'ProducerActivator.sol': readFileSync(`${CONTRACT_PATH}/ProducerActivator.sol`, 'UTF-8'),
    }
}, 1);

if (!output.errors) {
    writeFileSync(`${CONTRACT_PATH}/contracts.json`, JSON.stringify(output));
} else {
    // eslint-disable-next-line no-console
    console.log('Error while compile contracts', output.errors);
}

