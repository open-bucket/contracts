pragma solidity ^0.4.23;

import "./Consumer.sol";

// Users send Ether to this
// 1) When user send Ether to activate, this Contract will save user & amount of Ether to pendingReturns,
//  In activate():
//      - Save user address & Ether to pendingReturns
//      - Fire an event: onConsumerActivate for Tracker
// - If Tracker calls transfer:
//  - minAmount (amount to create ConsumerContract) Ether will be transferred to Tracker address
//  - remaining Ether will be transferred to the new ConsumerContract
// - If not (consumerId is unrecognised by Tracker or the consumerId is already activated),
//  User can withdraw their Ether using withdraw() function.
//  If user withdraw their Ether before the ConsumerContract is created (Tracker will confirm this), the consumer still in INACTIVE state
contract Activator {

    struct Activation {
        address user;
        uint value;
    }

    // Allowed withdrawals of unrecognised consumers
    // When the consumer is activated, delete consumer from this mapping
    mapping(uint => Activation) activations;
    address public tracker;
    // minAmount is the gas amount to create the ConsumerContract
    uint public minAmount;

    event onCreateConsumerActivation(uint consumerId);
    event onActivationConfirmed(uint consumerId);

    // Tracker send an amount of ether to this when create it
    constructor(uint _minAmount) public payable {
        // Tracker creates this contract
        tracker = address(msg.sender);
        // Min amount. Default is 0.01 Ether.
        minAmount = _minAmount;
    }

    modifier onlyTracker() {
        require(msg.sender == tracker, "Only Tracker can call this.");
        _;
    }

    modifier onlyActivationOwner(uint consumerId){
        require(activations[consumerId].user == msg.sender, "Only Activation owner can call this");
        _;
    }

    modifier activationExists(uint consumerId){
        require(activations[consumerId].user != address(0));
        _;
    }

    modifier activationNotExists(uint consumerId){
        require(activations[consumerId].user == address(0));
        _;
    }

    function createActivation(uint consumerId)
    public
    payable
    activationNotExists(consumerId)
    {
        require(
            msg.value >= minAmount,
            "You need to send more Ether to activate this contract"
        );

        activations[consumerId].user = msg.sender;
        activations[consumerId].value = msg.value;

        emit onCreateConsumerActivation(consumerId);
    }

    // User MUST manually call this function to get back their Ether when:
    //  - They send Ether to activate a activated consumer or a non exists consumer
    // Since Tracker will DO NOTHING if the target consumer is not exists in database or is activated
    function withdraw(uint consumerId) public onlyActivationOwner(consumerId) {

        uint returnValue = activations[consumerId].value;
        delete activations[consumerId];

        msg.sender.transfer(returnValue);
        return;
    }

    // Users send Ether to this
    // 1) When user send Ether to activate, this Contract will save user & amount of Ether to activations,
    //  In activate():
    //      - Save user address & Ether to activations
    //      - Fire an event: onConsumerActivate for Tracker
    // - If Tracker calls transfer:
    //  - minAmount (amount to create ConsumerContract) Ether will be transferred to Tracker address
    //  - remaining Ether will be transferred to the new ConsumerContract
    // - If not (consumerId is unrecognised by Tracker or the consumerId is already activated),
    //  User can withdraw their Ether using withdraw() function.
    //  If user withdraw their Ether before the ConsumerContract is created (Tracker will confirm this), the consumer still in INACTIVE state

    // 1) Tracker receives onConsumerActive from ActivatorContract
    // 2) Tracker check if consumer (id) is existed in DB & is INACTIVE
    // If YES:
    //  1) call getPendingReturnByConsumerId to see if the pendingReturns[consumerId] still
    //  2) create the ConsumerContract
    //  3) Mark consumer as ACTIVE
    //  4) call transfer() on ActivatorContract
    // If NO:
    //  1) Tracker return response error & do nothing to the ActivatorContract.

    //If a contract receives Ether (without a function being called), the fallback function is executed
    //If it does not have a fallback function,
    //the Ether will be rejected (by throwing an exception).
    //During the execution of the fallback function, the contract can only rely on the “gas stipend” (2300 gas) being available to it at that time.


    // If Tracker call this, the gas to create the new contract is calculated for this contract or the Tracker?
    function confirmActivation(uint consumerId)
    public
    onlyTracker
    activationExists(consumerId)
    returns (address)
    {
        uint prepaidPayment = activations[consumerId].value - minAmount;
        // TODO: check if tracker paid gas for creating new contract
        Consumer consumerContract = (new Consumer).value(prepaidPayment)(consumerId);
        emit onActivationConfirmed(consumerId);

        delete activations[consumerId];
        return consumerContract;
        // address(consumerContract) ?
    }

    function getActivation(uint consumerId)
    public
    view
    activationExists(consumerId)
    returns (address, uint)
    {
        return (activations[consumerId].user, activations[consumerId].value);
    }
}
