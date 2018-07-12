/**
 * Lib imports
 */
const { readFileSync } = require('fs');
const { resolve } = require('path');


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

    _loadCompiledContracts() {
        const output = require('./constracts.json');
        this._compiledConsumerActivatorContract = output.contracts['ConsumerActivator.sol:ConsumerActivator'];
        this._compiledProducerActivatorContract = output.contracts['ProducerActivator.sol:ProducerActivator'];
        this._compiledConsumerContract = output.contracts['Consumer.sol:Consumer'];
    }

    get compiledConsumerActivatorContract() {
        if (!this._compiledConsumerActivatorContract) {
            this._loadCompiledContracts();
        }
        return this._compiledConsumerActivatorContract;
    }

    get compiledProducerActivatorContract() {
        if (!this._compiledProducerActivatorContract) {
            this._loadCompiledContracts();
        }
        return this._compiledProducerActivatorContract;
    }

    get compiledConsumerContract() {
        if (!this._compiledConsumerContract) {
            this._loadCompiledContracts();
        }
        return this._compiledConsumerContract;
    }
}

const CompilationServiceInstance = new CompilationService();

module.exports = CompilationServiceInstance;
