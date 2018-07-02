pragma solidity ^0.4.23;

contract ProducerActivator {

    struct Activation {
        address user;
        uint value;
    }

    mapping(uint => Activation) activations;
    address public tracker;
    uint public activationFee;

    event onActivationCreated(uint producerId);
    event onActivationConfirmed(uint producerId, address producerAddress);

    constructor(uint _activationFee) public {
        tracker = address(msg.sender);
        activationFee = _activationFee;
    }

    modifier onlyTracker() {
        require(msg.sender == tracker, "Only Tracker can call this.");
        _;
    }

    modifier onlyActivationOwner(uint producerId){
        require(activations[producerId].user == msg.sender, "Only Activation owner can call this");
        _;
    }

    modifier activationExists(uint producerId){
        require(activations[producerId].user != address(0), "Activation is not exits");
        _;
    }

    modifier activationNotExists(uint producerId){
        require(activations[producerId].user == address(0), "Activation is already exists");
        _;
    }

    modifier valueEqualsActivationFee(){
        require(msg.value == activationFee, "You need to send exact activation fee to activate this producer");
        _;
    }

    function createActivation(uint producerId)
    public
    payable
    activationNotExists(producerId)
    valueEqualsActivationFee
    {
        activations[producerId].user = msg.sender;
        activations[producerId].value = msg.value;

        emit onActivationCreated(producerId);
    }

    function withdraw(uint producerId)
    public
    activationExists(producerId)
    onlyActivationOwner(producerId)
    {
        uint returnValue = activations[producerId].value;
        delete activations[producerId];

        msg.sender.transfer(returnValue);
        return;
    }

    function confirmActivation(uint producerId)
    public
    onlyTracker
    activationExists(producerId)
    {
        emit onActivationConfirmed(producerId, activations[producerId].user);

        // Delete Activation to prevent user from withdraw activation fee
        delete activations[producerId];
    }

    function getActivation(uint producerId)
    public
    view
    returns (address, uint)
    {
        return (activations[producerId].user, activations[producerId].value);
    }
}
