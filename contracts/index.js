/**
 * Lib imports
 */
const {compile} = require('solc');
const {readFileSync} = require('fs');
const {resolve} = require('path');

class CompilationService {
    constructor() {
        if (!CompilationService.instance) {
            this._compiledConsumerActivatorContract = null;
            this._compiledProducerActivatorContract = null;
            this._compiledConsumerContract = null;
            CompilationService.instance = this;
        }
        return CompilationService.instance;
    }

    _compileContracts() {
        const output = compile({
            sources: {
                'Consumer.sol': readFileSync(resolve(__dirname, 'Consumer.sol'), 'UTF-8'),
                'Activator.sol': readFileSync(resolve(__dirname, 'Activator.sol'), 'UTF-8'),
                'ConsumerActivator.sol': readFileSync(resolve(__dirname, 'ConsumerActivator.sol'), 'UTF-8'),
                'ProducerActivator.sol': readFileSync(resolve(__dirname, 'ProducerActivator.sol'), 'UTF-8'),
            }
        }, 1);
        this._compiledConsumerActivatorContract = output.contracts['ConsumerActivator.sol:ConsumerActivator'];
        this._compiledProducerActivatorContract = output.contracts['ProducerActivator.sol:ProducerActivator'];
        this._compiledConsumerContract = output.contracts['Consumer.sol:Consumer'];
    }

    get compiledConsumerActivatorContract() {
        if (!this._compiledConsumerActivatorContract) {
            this._compileContracts();
        }
        return this._compiledConsumerActivatorContract;
    }

    get compiledProducerActivatorContract() {
        if (!this._compiledProducerActivatorContract) {
            this._compileContracts();
        }
        return this._compiledProducerActivatorContract;
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
