const Activator = artifacts.require('./Activator.sol');
const {calledOnce} = require('../utils');

contract('Activator', accounts => {

    //https://github.com/vitiko/solidity-test-example/blob/master/test/Congress.js
    it('should be able to receive value on creation & have correct balance, tracker & minAmount', async () => {
        const account = accounts[0];
        const minAmount = web3.toWei(0.001, 'ether');
        const baseValue = web3.toWei(1, 'ether');

        const beforeCreate = web3.eth.getBalance(account);
        const activatorInstance = await Activator.new(minAmount, {
            from: account,
            value: baseValue,
            gasPrice: web3.toWei(2, 'gwei')
        });
        const afterCreate = web3.eth.getBalance(account);

        console.log('Ether paid by Tracker: ', beforeCreate - afterCreate - baseValue);

        const actualBalance = await web3.eth.getBalance(activatorInstance.address);
        const actualMinAmount = await activatorInstance.minAmount.call();
        const actualTracker = await activatorInstance.tracker.call();

        assert.equal(actualBalance, baseValue);
        assert.equal(actualMinAmount, minAmount);
        assert.equal(actualTracker, account);
    });

    it('should be able to create activation & emit onCreateConsumerActivation correctly', async () => {
        const expectedConsumerId = 0;
        const expectedValue = web3.toWei(2, 'finney');
        const expectedAccount = accounts[0];

        const activatorInstance = await Activator.deployed();
        await activatorInstance.createActivation(expectedConsumerId, {
            from: expectedAccount,
            value: expectedValue
        });

        const [actualUser, actualValue] = await activatorInstance.getActivation.call(expectedConsumerId);

        const event = await calledOnce(activatorInstance, {event: 'onCreateConsumerActivation', args: {consumeId: 0}});

        assert.equal(actualUser, expectedAccount);
        assert.equal(actualValue.toString(10), expectedValue);
        assert.equal(event.args.consumerId.toString(10), expectedConsumerId)
    })
});
