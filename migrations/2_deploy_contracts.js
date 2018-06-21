const Activator = artifacts.require("./Activator.sol");

module.exports = function (deployer) {
    deployer.deploy(Activator, web3.fromWei(2, "gwei"));
};
