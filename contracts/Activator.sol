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

    mapping(uint => Activation) activations;
    address public tracker;
    uint public minAmount;

    event onConsumerActivationCreated(uint consumerId);
    event onActivationConfirmed(uint consumerId, address consumerContract);

    constructor(uint _minAmount) public {
        // Tracker creates this contract
        tracker = address(msg.sender);
        // Min amount. Default is 0.01 KWei.
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
        require(activations[consumerId].user != address(0), "Activation is not exits");
        _;
    }

    modifier activationNotExists(uint consumerId){
        require(activations[consumerId].user == address(0), "Activation is already exists");
        _;
    }

    modifier valueHigherThanMinAmount(){
        require(msg.value >= minAmount, "You need to send more Ether to activate this contract");
        _;
    }

    function createActivation(uint consumerId)
    public
    payable
    activationNotExists(consumerId)
    valueHigherThanMinAmount
    {
        activations[consumerId].user = msg.sender;
        activations[consumerId].value = msg.value;

        emit onConsumerActivationCreated(consumerId);
    }

    // User MUST manually call this function to get back their Ether when:
    //  - They send Ether to activate a activated consumer or a non exists consumer
    // Since Tracker will DO NOTHING if the target consumer is not exists in database or is activated
    function withdraw(uint consumerId)
    public
    activationExists(consumerId)
    onlyActivationOwner(consumerId)
    {

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
    function confirmActivation(uint consumerId)
    public
    onlyTracker
    activationExists(consumerId)
    {
        uint prepaidPayment = activations[consumerId].value;

        // Activator use its money to send to consumer. But Tracker pays the gas for that.
        Consumer consumerContract = (new Consumer).value(prepaidPayment)(consumerId);

        delete activations[consumerId];

        emit onActivationConfirmed(consumerId, address(consumerContract));
    }

    function getActivation(uint consumerId)
    public
    view
    returns (address, uint)
    {
        return (activations[consumerId].user, activations[consumerId].value);
    }
}
