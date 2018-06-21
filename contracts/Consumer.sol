pragma solidity ^0.4.23;

contract Consumer {
    uint public consumerId;

    constructor(uint _consumerId) public payable {
        consumerId = _consumerId;
    }
}
