pragma solidity ^0.4.23;

contract Consumer {

    mapping(address => uint) balances;
    address public consumer;
    address public tracker;
    uint public weiPerByteServed = 100000; // 1 GB = 100 Szabo = $0.05 - Based on current Ether price: ~ $500/Ether
    uint public weiPerByteStored = 30000;  // 1 GB = 30 Szabo = $0.015 - Based on current Ether price: ~ $500/Ether

    constructor(address _consumer, address _tracker) public payable {
        consumer = _consumer;
        tracker = _tracker;
        balances[consumer] = msg.value;
    }

    modifier onlyTracker() {
        require(msg.sender == tracker, "Only Tracker can call this.");
        _;
    }

    modifier onlyConsumer() {
        require(msg.sender == consumer, "Only Consumer can call this.");
        _;
    }

    modifier balanceExistsOrNotEmpty() {
        require(balances[msg.sender] != 0, "Balance is not exists or is empty.");
        _;
    }

    function transfer(address producer, uint servedBytes, uint weiPerByte) internal
    {
        // Assuming current contract's balance is sufficient
        uint paymentAmount = weiPerByte * servedBytes;
        balances[producer] += paymentAmount;
        balances[consumer] -= paymentAmount;
    }

    function transferMany(address[] producerArr, uint[] servedBytesArr, uint weiPerByte) internal
    {
        for (uint i = 0; i < producerArr.length; i++) {
            transfer(producerArr[i], servedBytesArr[i], weiPerByte);
        }
    }

    function serves(address[] producerArr, uint[] servedBytesArr) public onlyTracker {
        transferMany(producerArr, servedBytesArr, weiPerByteServed);
    }

    function stores(address[] producerArr, uint[] servedBytesArr) public onlyTracker {
        transferMany(producerArr, servedBytesArr, weiPerByteStored);
    }

    function topUp()
    public
    payable
    onlyConsumer
    {
        balances[msg.sender] += msg.value;
    }


    function withdraw()
    public
    balanceExistsOrNotEmpty
    {
        uint returnValue = balances[msg.sender];
        delete balances[msg.sender];

        msg.sender.transfer(returnValue);
    }

    function getBalance(address user)
    public
    view
    returns (uint)
    {
        return balances[user];
    }
}
