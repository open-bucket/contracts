const ConsumerActivator = artifacts.require('./ConsumerActivator.sol');
const {calledOnce} = require('../utils');

contract('ConsumerActivator', accounts => {

    let activatorInstance;
    const account = accounts[0];
    const tracker = accounts[2];
    const minAmount = web3.toWei(2, 'gwei');
    const gasPrice = web3.toWei(2, 'gwei');

    beforeEach(async () => {
        activatorInstance = await ConsumerActivator.new(minAmount, {
            from: tracker,
            gasPrice
        });
    });

    //https://github.com/vitiko/solidity-test-example/blob/master/test/Congress.js
    it('should be able to receive value on creation & have correct balance, tracker & minAmount', async () => {

        const actualMinAmount = await activatorInstance.minAmount.call();
        const actualTracker = await activatorInstance.tracker.call();

        assert.equal(actualMinAmount, minAmount);
        assert.equal(actualTracker, tracker);
    });

    it('should be able to create activation & emit onCreateConsumerActivation correctly', async () => {
        // GIVEN
        const expectedConsumerId = 0;
        const expectedValue = web3.toWei(2, 'finney');

        // WHEN
        await activatorInstance.createActivation(expectedConsumerId, {value: expectedValue, gasPrice});
        const [actualUser, actualValue] = await activatorInstance.getActivation.call(expectedConsumerId);
        const event = await calledOnce(activatorInstance, {
            event: 'onActivationCreated',
            args: {consumeId: expectedConsumerId}
        });

        // THEN
        assert.equal(actualUser, account);
        assert.equal(actualValue.toString(10), expectedValue);
        assert.equal(event.args.consumerId.toString(10), expectedConsumerId);
    });

    it('should NOT able to create duplicate activation', async () => {
        // GIVEN
        const expectedConsumerId = 0;
        const expectedValue = web3.toWei(2, 'finney');
        await activatorInstance.createActivation(expectedConsumerId, {
            value: expectedValue,
            gasPrice
        });

        // WHEN
        activatorInstance.createActivation(expectedConsumerId)
        // THEN
            .then(() => assert(false, 'should revert'))
            .catch(() => {
                assert(true, 'should revert');
            });
    });

    it('should NOT able to create activation with value lower than min amount', async () => {
        // GIVEN
        const expectedConsumerId = 0;
        const valueLowerThanMinAmount = web3.toWei(1, 'gwei');

        // WHEN
        await activatorInstance.createActivation(expectedConsumerId, {
            value: valueLowerThanMinAmount,
            gasPrice
        })
        // THEN
            .then(() => assert(false, 'should revert'))
            .catch(() => {
                assert(true, 'should revert');
            });
    });

    it('should able to withdraw from existing activation & correct owner', async () => {
        // GIVEN
        const CONSUMER_ID = 0;
        const expectedValue = web3.toWei(2, 'finney');
        await activatorInstance.createActivation(CONSUMER_ID, {value: expectedValue});

        let beforeWithdraw = web3.eth.getBalance(account);
        await activatorInstance.withdraw(CONSUMER_ID, {gasPrice});
        let afterWithdraw = web3.eth.getBalance(account);

        const valueWithdraw = afterWithdraw - beforeWithdraw;

        assert.isAbove(valueWithdraw, 0);
    });


    it('should not able to withdraw from not existing activation', async () => {
        // GIVEN
        const NOT_EXISTING_CONSUMER_ID = 0;

        // WHEN
        return activatorInstance.withdraw(NOT_EXISTING_CONSUMER_ID, {gasPrice})
        // THEN
            .then(() => assert(false, 'should revert'))
            .catch(() => {
                assert(true, 'should revert');
            });
    });

    it('should not able to withdraw from activation of different owner', async () => {
        // GIVEN
        const CONSUMER_ID = 0;
        const expectedValue = web3.toWei(2, 'finney');
        await activatorInstance.createActivation(CONSUMER_ID, {from: accounts[0], value: expectedValue});

        await activatorInstance.withdraw(CONSUMER_ID, {from: accounts[1], gasPrice})
        // THEN
            .then(() => assert(false, 'should revert'))
            .catch(() => {
                assert(true, 'should revert');
            });
    });

    it('should create new ConsumerContract & return its address when Tracker call confirmActivation of existing activation', async () => {
        // GIVEN
        const consumerId = 0;
        const value = web3.toWei(10, 'finney');

        await activatorInstance.createActivation(consumerId, {
            from: account,
            value,
            gasPrice
        });

        // WHEN
        const trackerBalanceBefore = web3.eth.getBalance(tracker);
        const activatorBalanceBefore = web3.eth.getBalance(activatorInstance.address);

        await activatorInstance.confirmActivation(consumerId, {from: tracker, gasPrice});
        const event = await calledOnce(activatorInstance, {
            event: 'onActivationConfirmed',
            args: {consumeId: consumerId}
        });

        const trackerBalanceAfter = web3.eth.getBalance(tracker);
        const activatorBalanceAfter = web3.eth.getBalance(activatorInstance.address);

        // Get new ConsumerContract Balance
        const consumerBalance = web3.eth.getBalance(event.args.consumerContract);

        // Get Tracker cost
        const trackerCost = trackerBalanceAfter.sub(trackerBalanceBefore);
        const valueActivatorTransferred = activatorBalanceBefore.sub(activatorBalanceAfter);

        // THEN

        // User Activation is deleted in ConsumerActivator
        const [actualUser, actualValue] = await activatorInstance.getActivation.call(consumerId);
        assert.equal(actualUser.toString(10), 0);
        assert.equal(actualValue.toString(10), 0);

        // Can create consumer contract
        assert.isNotNull(event.args.consumerContract);

        // Created consumer contract with correct consumerId
        assert.equal(event.args.consumerId.toString(10), consumerId);

        // Consumer balance has correct the value that the user send to
        assert.equal(consumerBalance, value);

        // ConsumerActivator transfer its received money to Consumer
        assert.equal(valueActivatorTransferred.toString(10), value);

        // Tracker pays the gas for the operation
        assert.isBelow(trackerCost.toString(10), 0);
    });
});
