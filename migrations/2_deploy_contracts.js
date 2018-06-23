const Activator = artifacts.require("./Activator.sol");

module.exports = function (deployer) {
    const minAmount = web3.fromWei(2, "kwei");
    deployer.deploy(Activator, minAmount);
};
