/**
 * Lib imports
 */
const Web3 = require('web3');
const BPromise = require('bluebird');

/**
 * Project imports
 */
const {
    ETHEREUM_NODE_URL,
    CONSUMER_ACTIVATOR_ADDRESS,
    PRODUCER_ACTIVATOR_ADDRESS,
    CONSUMER_ACTIVATOR_MIN_AMOUNT,
    PRODUCER_ACTIVATOR_ACTIVATION_FEE,
    GAS_PRICE,
    GAS_LIMIT,
    TRACKER_ADDRESS
} = require('./config');
const CompilationService = require('./contracts');

class ContractService {
    constructor() {
        if (!ContractService.instance) {
            this._web3 = null;
            ContractService.instance = this;
        }
        return ContractService.instance;
    }

    async _deployConsumerActivatorContractP(minAmount) {
        this._consumerActivatorContractInstance = await this._consumerActivatorContractInstance
            .deploy({
                data: CompilationService.compiledConsumerActivatorContract.bytecode,
                arguments: [minAmount]
            })
            .send({
                from: TRACKER_ADDRESS,
                gasPrice: GAS_PRICE,
                gas: GAS_LIMIT
            });
        return this._consumerActivatorContractInstance;
    }

    async _deployProducerActivatorContractP(activationFee) {
        this._producerActivatorContractInstance = await this._producerActivatorContractInstance
            .deploy({
                data: CompilationService.compiledProducerActivatorContract.bytecode,
                arguments: [activationFee]
            })
            .send({
                from: TRACKER_ADDRESS,
                gasPrice: GAS_PRICE,
                gas: GAS_LIMIT
            });
        return this._producerActivatorContractInstance;
    }

    async createConsumerActivationP({accountIndex, value, consumerId}) {
        const accounts = await this.getAccountsP();
        const activatorInstance = await this.getConsumerActivatorContractInstanceP();
        return activatorInstance.methods
            .createActivation(consumerId)
            .send({
                from: accounts[accountIndex].address,
                value,
                gasPrice: GAS_PRICE,
                gas: GAS_LIMIT
            });
    }

    async createProducerActivationP({accountIndex, value, producerId}) {
        const accounts = await this.getAccountsP();
        const activatorInstance = await this.getProducerActivatorContractInstanceP();
        return activatorInstance.methods
            .createActivation(producerId)
            .send({
                from: accounts[accountIndex].address,
                value: PRODUCER_ACTIVATOR_ACTIVATION_FEE,
                gasPrice: GAS_PRICE,
                gas: GAS_LIMIT
            });
    }

    async getConsumerActivatorContractInstanceP() {
        if (!this._consumerActivatorContractInstance) {
            this._consumerActivatorContractInstance = new this.web3.eth.Contract(
                JSON.parse(CompilationService.compiledConsumerActivatorContract.interface),
                CONSUMER_ACTIVATOR_ADDRESS
            );
        }
        if (!this._consumerActivatorContractInstance.options.address) {
            return this._deployConsumerActivatorContractP(CONSUMER_ACTIVATOR_MIN_AMOUNT);
        }
        return this._consumerActivatorContractInstance;
    }

    async getProducerActivatorContractInstanceP() {
        if (!this._producerActivatorContractInstance) {
            this._producerActivatorContractInstance = new this.web3.eth.Contract(
                JSON.parse(CompilationService.compiledProducerActivatorContract.interface),
                PRODUCER_ACTIVATOR_ADDRESS
            );
        }
        if (!this._producerActivatorContractInstance.options.address) {
            return this._deployProducerActivatorContractP(PRODUCER_ACTIVATOR_ACTIVATION_FEE);
        }
        return this._producerActivatorContractInstance;
    }

    async getAccountsP() {
        if (!this._accounts) {
            const accountAddresses = await this.web3.eth.getAccounts();
            const accountBalances = await BPromise.all(accountAddresses
                .map(account => this.web3.eth.getBalance(account)));
            this._accounts = accountAddresses.map((address, index) => ({address, balance: accountBalances[index]}));
        }
        return this._accounts;
    }

    get configs() {
        return require('./config');
    }

    get web3() {
        if (!this._web3) {
            this._web3 = new Web3(ETHEREUM_NODE_URL);
        }
        return this._web3;
    }

    async confirmConsumerActivationP(consumerId) {
        const activatorInstance = await this.getConsumerActivatorContractInstanceP();
        return activatorInstance.methods
            .confirmActivation(consumerId)
            .send({
                from: TRACKER_ADDRESS,
                gasPrice: GAS_PRICE,
                gas: GAS_LIMIT
            });
    }

    async confirmProducerActivationP(producerId) {
        const activatorInstance = await this.getProducerActivatorContractInstanceP();
        return activatorInstance.methods
            .confirmActivation(producerId)
            .send({
                from: TRACKER_ADDRESS,
                gasPrice: GAS_PRICE,
                gas: GAS_LIMIT
            });
    }
}

const ContractServiceInstance = new ContractService();

module.exports = ContractServiceInstance;
