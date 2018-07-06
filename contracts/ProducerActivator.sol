pragma solidity ^0.4.23;

import "./Activator.sol";

contract ProducerActivator is Activator {

    event onActivationConfirmed(uint producerId, address producer);

    constructor(uint _minAmount) Activator(_minAmount) public {}

    function confirmActivation(uint producerId)
    public
    onlyTracker
    activationExists(producerId)
    {
        emit onActivationConfirmed(producerId, activations[producerId].user);

        delete activations[producerId];
    }
}
