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
    ACTIVATOR_ADDRESS,
    ACTIVATOR_MIN_AMOUNT,
    GAS_PRICE,
    TRACKER_ADDRESS
} = require('./config');
const CompilationService = require('./contracts');

class ContractService {
    constructor() {
        if (!ContractService.instance) {
            this._web3 = new Web3(ETHEREUM_NODE_URL);
            this._activatorContractInstance = new this._web3.eth.Contract(
                JSON.parse(CompilationService.compiledActivatorContract.interface),
                ACTIVATOR_ADDRESS
            );
            ContractService.instance = this;
        }
        return ContractService.instance;
    }

    async _deployActivatorContractP(minAmount) {
        const accounts = await this.getAccountsP();
        this._activatorContractInstance = await this._activatorContractInstance
            .deploy({
                data: CompilationService.compiledActivatorContract.bytecode,
                arguments: [minAmount]
            })
            .send({
                from: TRACKER_ADDRESS,
                gasPrice: GAS_PRICE,
                gas: '4712388'
            });
        return this._activatorContractInstance;
    }

    async createActivationP({accountIndex, value, consumerId}) {
        const accounts = await this.getAccountsP();
        return this._activatorContractInstance.methods
            .createActivation(consumerId)
            .send({
                from: accounts[accountIndex].address,
                value,
                gasPrice: GAS_PRICE
            });
    }

    async getActivatorContractInstanceP() {
        if (!this._activatorContractInstance.options.address) {
            return this._deployActivatorContractP(ACTIVATOR_MIN_AMOUNT);
        }
        return this._activatorContractInstance;
    }

    async getAccountsP() {
        if (!this._accounts) {
            const accountAddresses = await this._web3.eth.getAccounts();
            const accountBalances = await BPromise.all(accountAddresses
                .map(account => this._web3.eth.getBalance(account)));
            this._accounts = accountAddresses.map((address, index) => ({address, balance: accountBalances[index]}));
        }
        return this._accounts;
    }

    get configs() {
        return require('./config');
    }

    async confirmActivationP(consumerId) {
        return this._activatorContractInstance.methods
            .confirmActivation(consumerId)
            .send({
                from: TRACKER_ADDRESS,
                gasPrice: GAS_PRICE,
                gas: '4712388'
            });
    }
}

const ContractServiceInstance = new ContractService();

module.exports = ContractServiceInstance;
