/* eslint-disable no-undef */
/**
 * Lib imports
 */
const bytes = require('bytes');
const BPromise = require('bluebird');

/**
 * Project imports
 */
const Consumer = artifacts.require('./Consumer.sol');

contract('Consumer', accounts => {

    let consumerInstance;
    const activator = accounts[0];
    const consumer = accounts[1];
    const tracker = accounts[2];
    const gasPrice = web3.toWei(2, 'gwei');
    const baseBalance = web3.toWei(2, 'finney');

    const servers = [
        {producer: accounts[3], servedBytes: bytes.parse('1GB')},
        {producer: accounts[5], servedBytes: bytes.parse('2GB')},
        {producer: accounts[6], servedBytes: bytes.parse('1GB')}
    ];
    const producerArr = servers.map(s => s.producer);
    const servedBytesArr = servers.map(s => s.servedBytes);

    function getConsumerBalance() {
        return consumerInstance.getBalance.call(consumer);
    }

    function getProducerBalances() {
        return BPromise.all(producerArr.map(address => consumerInstance.getBalance.call(address)));
    }

    beforeEach(async () => {
        consumerInstance = await Consumer.new(consumer, tracker, {
            from: activator,
            gasPrice,
            value: baseBalance
        });
    });

    it('should created with correct consumer address & tracker address', async () => {
        const [
            consumerAddress,
            trackerAddress,
            consumerBalance,
            contractBalance
        ] = await BPromise.all([
            consumerInstance.consumer.call(),
            consumerInstance.tracker.call(),
            getConsumerBalance(),
            web3.eth.getBalance(consumerInstance.address)
        ]);

        assert.equal(consumerAddress, consumer);
        assert.equal(trackerAddress, tracker);
        assert(consumerBalance.eq(baseBalance));
        assert(contractBalance.eq(baseBalance));
    });

    it('should has correct balances when serves', async () => {
        // GIVEN
        const weiPerByteServedBN = await consumerInstance.weiPerByteServed.call();
        const consumerBalanceBefore = await getConsumerBalance();

        // WHEN
        await consumerInstance.serves(producerArr, servedBytesArr, {
            from: tracker,
            gasPrice
        });

        // THEN
        const actualProducerBalances = await getProducerBalances();
        const expectedProducerBalances = servedBytesArr.map(bytes => weiPerByteServedBN.times(bytes));

        const totalExpectedPayment = expectedProducerBalances.reduce((acc, curr) => acc.plus(curr));
        const expectedConsumerBalance = consumerBalanceBefore.minus(totalExpectedPayment);
        const actualConsumerBalance = await getConsumerBalance();

        // All producer balance has correct value after serving
        for (let i = 0; i < actualProducerBalances.length; i += 1) {
            assert(actualProducerBalances[i].eq(expectedProducerBalances[i]));
        }

        // consumer balance has correct value after serving
        assert(actualConsumerBalance.eq(expectedConsumerBalance));
    });

    it('should has correct balances when stores', async () => {
        // GIVEN
        const weiPerByteServedBN = await consumerInstance.weiPerByteStored.call();
        const consumerBalanceBefore = await getConsumerBalance();

        // WHEN
        await consumerInstance.stores(producerArr, servedBytesArr, {
            from: tracker,
            gasPrice
        });

        // THEN
        const actualProducerBalances = await getProducerBalances();
        const expectedProducerBalances = servedBytesArr.map(bytes => weiPerByteServedBN.times(bytes));

        const totalExpectedPayment = expectedProducerBalances.reduce((acc, curr) => acc.plus(curr));
        const expectedConsumerBalance = consumerBalanceBefore.minus(totalExpectedPayment);
        const actualConsumerBalance = await getConsumerBalance();

        // All producer balance has correct value after serving
        for (let i = 0; i < actualProducerBalances.length; i += 1) {
            assert(actualProducerBalances[i].eq(expectedProducerBalances[i]));
        }

        // Consumer balance has correct value after serving
        assert(actualConsumerBalance.eq(expectedConsumerBalance));
    });

    it('should allow served producer to withdraw', async () => {
        // GIVEN
        await consumerInstance.serves(producerArr, servedBytesArr, {from: tracker, gasPrice});

        // WHEN
        const contractBalanceBefore = await web3.eth.getBalance(consumerInstance.address);
        const producerBalanceBefore = await web3.eth.getBalance(producerArr[0]);

        await consumerInstance.withdraw({from: producerArr[0], gasPrice});

        const producerBalanceAfter = await web3.eth.getBalance(producerArr[0]);
        const contractBalanceAfter = await web3.eth.getBalance(consumerInstance.address);

        // THEN
        assert(producerBalanceAfter.gt(producerBalanceBefore));
        assert(contractBalanceBefore.gt(contractBalanceAfter));
    });


    it('should allow consumer to withdraw', async () => {
        // GIVEN
        await consumerInstance.serves(producerArr, servedBytesArr, {from: tracker, gasPrice});

        // WHEN
        const contractBalanceBefore = await web3.eth.getBalance(consumerInstance.address);
        const producerBalanceBefore = await web3.eth.getBalance(consumer);

        await consumerInstance.withdraw({from: consumer, gasPrice});

        const producerBalanceAfter = await web3.eth.getBalance(consumer);
        const contractBalanceAfter = await web3.eth.getBalance(consumerInstance.address);

        // THEN
        assert(producerBalanceAfter.gt(producerBalanceBefore));
        assert(contractBalanceBefore.gt(contractBalanceAfter));
    });

    it('should NOT allow random user to withdraw', async () => {
        // GIVEN
        await consumerInstance.serves(producerArr, servedBytesArr, {from: tracker, gasPrice});

        // WHEN
        const contractBalanceBefore = await web3.eth.getBalance(consumerInstance.address);

        await consumerInstance.withdraw({from: accounts[9], gasPrice})
        // THEN
            .then(() => assert(false))
            .catch(() => assert(true));

        const contractBalanceAfter = await web3.eth.getBalance(consumerInstance.address);
        assert(contractBalanceBefore.eq(contractBalanceAfter));
    });

    it('should allow consumer to topUp', async () => {

        // WHEN
        const consumerBalanceBefore = await getConsumerBalance();
        const contractBalanceBefore = await web3.eth.getBalance(consumerInstance.address);

        await consumerInstance.topUp({from: consumer, gasPrice, value: web3.toWei(1, 'ether')});

        const contractBalanceAfter = await web3.eth.getBalance(consumerInstance.address);
        const consumerBalanceAfter = await getConsumerBalance();

        // THEN
        // assert consumer balance in consumer contract
        assert.isTrue(contractBalanceAfter
            .minus(contractBalanceBefore)
            .eq(web3.toWei(1, 'ether')));

        // assert consumer balance in consumer contract
        assert.isTrue(consumerBalanceAfter
            .minus(consumerBalanceBefore)
            .eq(web3.toWei(1, 'ether')));
    });


    it('should NOT allow other than consumer to topUp', async () => {
        await consumerInstance.topUp({from: tracker, gasPrice, value: web3.toWei(1, 'ether')})
        // THEN
            .catch(() => {
                assert.isTrue(true);
            });
    });
});
