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
    ACTIVATOR_MIN_AMOUNT
} = require('./config');
const {ActivatorContract} = require('./contracts');

class ContractService {
    constructor() {
        if (!ContractService.instance) {
            this._web3 = new Web3(ETHEREUM_NODE_URL);
            this._activatorContractInstance = new this._web3.eth.Contract(
                JSON.parse(ActivatorContract.interface),
                ACTIVATOR_ADDRESS
            );
            ContractService.instance = this;
        }
        return ContractService.instance;
    }

    async _deployActivatorContractP(minAmount) {
        const accounts = await this._web3.eth.getAccounts();
        this._activatorContractInstance = await this._activatorContractInstance
            .deploy({
                data: ActivatorContract.bytecode,
                arguments: [minAmount]
            })
            .send({
                from: accounts[0],
                gasPrice: this._web3.utils.toWei('2', 'gwei'),
                gas: '4712388'
            });
        return this._activatorContractInstance;
    }

    confirmConsumerActivation(consumerId) {
        return consumerId;
    }

    getActivatorContractInstanceP() {
        if (process.env.NODE_ENV === 'production') {
            return BPromise.resolve(this._activatorContractInstance);
        } else {
            if (!this._activatorContractInstance.options.address) {
                return this._deployActivatorContractP(ACTIVATOR_MIN_AMOUNT);
            }
            return BPromise.resolve(this._activatorContractInstance);
        }
    }
}

const ContractServiceInstance = new ContractService();

module.exports = ContractServiceInstance;
