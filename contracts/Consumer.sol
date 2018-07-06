pragma solidity ^0.4.23;

contract Consumer {

    struct Serve {
        address producer;
        uint servedBytes;
    }

    mapping(address => uint) balances;
    address public consumer;
    address public tracker;

    // consumer only has consumerId here.
    // balance of consumer
    // this don't need consumerId
    constructor(address _consumer, address _tracker) public payable {
        consumer = _consumer;
        tracker = _tracker;
    }

    modifier onlyTracker() {
        require(msg.sender == tracker, "Only Tracker can call this.");
        _;
    }

//    function transfer(Serve serve, uint priceEachByte) internal
//    returns (bool success) {
//        // 100000 wei for each served byte
//        uint payment = priceEachByte * serve.servedBytes;
//        balances[address(serve.producer)] += payment;
//        // User can send money to the contract by any address
//        // But can only withdraw from 1 address ?
//        // TODO: save the address that activate the consumer to DB -> add field address to Consumers
//
//        // must be the address
//        // Don't let consumer withdraw Either
//        // money withdraw = address(this).balance
//        // client must registerAddress() to the consumer contract to withdraw the money from that address only
//        // Client must call a function to destroy the contract when they want to withdraw the money ?
//        // can't loop through the mapping
//        //        balances[consumerId];
//        // subtract consumer balance
//    }

    // TODO: can't user Serve[] in param
//    function served(Serve[] serves) public onlyTracker {
//        for (uint i = 0; i < serves.length; i++) {
//            // 100000 wei for each served byte
//            uint payment = 100000 * serves[i].servedBytes;
//            balances[address(serves[i].producer)] += payment;
//        }
//        // let client withdraw will let they pay the gas. Send to user let us pay the gas
//    }
//
//    function stored(Serve[] serves) public onlyTracker {
//        for (uint i = 0; i < serves.length; i++) {
//            // 100000 wei for each served byte
//            uint payment = 30000 * serves[i].servedBytes;
//            balances[address(serves[i].producer)] += payment;
//        }
//        // price of stored 1 byte = 30000 wei
//        //        producerAddress.transfer(storedBytes * 30000);
//    }


    // we know which producer serve which part & size of the shard
    // When client downloaded the file, assemble the shard & decrypt the file
    // Then Client calculate the md5 hash of the file,
    // -> client send request downloaded with the hash of downloaded file.
    // Tracker check the hash & pay
    //  If the hash is valid: Tracker call to Consumer contract to pay all the producer based on
    // total size of the shards of the file they keep
    // {producerAddress: 0x121111, servedBytes: totalShardsSize}
    // we don't need tier in this contract, since when many producer serves it,consumer must pay for as many producers
    // consider do withdraw instead of transfer



    // this contract doesn't need to store the producers
    // since they change constantly
    // value will be calculated by GB Downloaded. 1 GB = $0.05 = 100 szabo => 1 byte = 100000 Wei = 100 kwei

    //     value = byteServed * 100 kwei
    // to keep it simple, tracker will call function served(producerAddress, byteServed)
    // Office price: 1 byte = 100 kwei

    //     served(producerAddress, byte) onlyTracker {
    //         producerAddress.transfer(byte * 100000 wei)
    //    }

    // stored(producerAddress, byte) onlyTracker {
    //     producerAddress.transfer(byte * 30000 wei)
    //}

    // withdraw() onlyOwner {
    //     msg.sender.transfer(address(this).balance)
    //}

    // destroy the contract ?
}
