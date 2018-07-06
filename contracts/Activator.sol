pragma solidity ^0.4.23;

contract Activator {

    struct Activation {
        address user;
        uint value;
    }

    mapping(uint => Activation) activations;
    address public tracker;
    uint public minAmount;

    event onActivationCreated(uint modelId);

    constructor(uint _minAmount) internal {
        tracker = address(msg.sender);
        minAmount = _minAmount;
    }

    modifier onlyTracker() {
        require(msg.sender == tracker, "Only Tracker can call this.");
        _;
    }

    modifier onlyActivationOwner(uint consumerId) {
        require(activations[consumerId].user == msg.sender, "Only Activation owner can call this");
        _;
    }

    modifier activationExists(uint consumerId) {
        require(activations[consumerId].user != address(0), "Activation is not exits");
        _;
    }

    modifier activationNotExists(uint consumerId) {
        require(activations[consumerId].user == address(0), "Activation is already exists");
        _;
    }

    modifier valueHigherThanOrEqualMinAmount() {
        require(msg.value >= minAmount);
        _;
    }

    function createActivation(uint modelId)
    public
    payable
    activationNotExists(modelId)
    valueHigherThanOrEqualMinAmount
    {
        activations[modelId].user = msg.sender;
        activations[modelId].value = msg.value;

        emit onActivationCreated(modelId);
    }

    function confirmActivation(uint modelId) public;

    function withdraw(uint modelId)
    public
    activationExists(modelId)
    onlyActivationOwner(modelId)
    {

        uint returnValue = activations[modelId].value;
        delete activations[modelId];

        msg.sender.transfer(returnValue);
    }

    function getActivation(uint modelId)
    public
    view
    returns (address, uint)
    {
        return (activations[modelId].user, activations[modelId].value);
    }
}
