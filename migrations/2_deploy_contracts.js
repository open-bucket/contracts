/* eslint-disable no-undef */


module.exports = function (deployer) {
    const minAmount = web3.fromWei(2, 'kwei');
    deployer.deploy(ConsumerActivator, minAmount);
};
