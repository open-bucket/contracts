/**
 * Lib imports
 */
const {compile} = require('solc');
const {readFileSync} = require('fs');
const {resolve} = require('path');

const ActivatorContractSource = readFileSync(resolve(__dirname, 'Activator.sol'), 'UTF-8');
const ConsumerContractSource = readFileSync(resolve(__dirname, 'Consumer.sol'), 'UTF-8');

class CompilationService {
    constructor() {
        if (!CompilationService.instance) {
            this._compiledActivatorContract = null;
            this._compiledConsumerContract = null;
            CompilationService.instance = this;
        }
        return CompilationService.instance;
    }

    _compileContracts() {
        const output = compile({
            sources: {
                'Consumer.sol': ConsumerContractSource,
                'Activator.sol': ActivatorContractSource,
            }
        }, 1);
        this._compiledActivatorContract = output.contracts['Activator.sol:Activator'];
        this._compiledConsumerContract = output.contracts['Consumer.sol:Consumer'];
    }

    get compiledActivatorContract() {
        if (!this._compiledActivatorContract) {
            this._compileContracts();
        }
        return this._compiledActivatorContract;
    }

    get compiledConsumerContract() {
        if (!this._compiledConsumerContract) {
            this._compileContracts();
        }
        return this._compiledConsumerContract;
    }
}

const CompilationServiceInstance = new CompilationService();

module.exports = CompilationServiceInstance;
