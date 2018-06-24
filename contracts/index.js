/**
 * Lib imports
 */
const {compile} = require('solc');
const {readFileSync} = require('fs');
const {resolve} = require('path');

const ActivatorContractSource = readFileSync(resolve(__dirname, 'Activator.sol'), 'UTF-8');
const ConsumerContractSource = readFileSync(resolve(__dirname, 'Consumer.sol'), 'UTF-8');

const output = compile({
    sources: {
        'Consumer.sol': ConsumerContractSource,
        'Activator.sol': ActivatorContractSource,
    }
}, 1);

module.exports = {
    ActivatorContract: output.contracts['Activator.sol:Activator'],
    ConsumerContract: output.contracts['Consumer.sol:Consumer']
};
