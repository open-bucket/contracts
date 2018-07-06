pragma solidity ^0.4.23;

import "./Consumer.sol";
import "./Activator.sol";

contract ConsumerActivator is Activator {

    event onActivationConfirmed(uint consumerId, address consumer, address consumerContract);

    constructor(uint _minAmount) Activator(_minAmount) public {}

    function confirmActivation(uint consumerId)
    public
    onlyTracker
    activationExists(consumerId)
    {
        uint prepaidPayment = activations[consumerId].value;
        address consumer = activations[consumerId].user;

        Consumer consumerContract = (new Consumer).value(prepaidPayment)(consumer, tracker);

        emit onActivationConfirmed(consumerId, consumer, address(consumerContract));

        delete activations[consumerId];
    }
}
