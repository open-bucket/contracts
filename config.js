module.exports = {
    // Daemon uses HTTP. Tracker uses WS (since it needs subscription)
    // so Tracker environment variable must include: OBN_ETHEREUM_NODE_URL='ws://127.0.0.1:7545'
    ETHEREUM_NODE_URL: process.env.OBN_ETHEREUM_NODE_URL || 'http://127.0.0.1:7545',
    CONSUMER_ACTIVATOR_ADDRESS: process.env.OBN_CONSUMER_ACTIVATOR_ADDRESS || '',
    PRODUCER_ACTIVATOR_ADDRESS: process.env.OBN_PRODUCER_ACTIVATOR_ADDRESS || '',
    // Ganache accounts[9] with MNEMONIC: oxygen need era start item party hedgehog more cart almost okay flag
    TRACKER_ADDRESS: process.env.OBN_TRACKER_ADDRESS || '0xeD9E49E82cDa452B355C74eD8a46EE695B64cD7b',
    // CONSUMER_ACTIVATOR_MIN_AMOUNT: process.env.OBN_CONSUMER_ACTIVATOR_MIN_AMOUNT || '1000000000000', // 1 finney -> wei
    CONSUMER_ACTIVATOR_MIN_AMOUNT: process.env.OBN_CONSUMER_ACTIVATOR_MIN_AMOUNT || '1000000000000000000', // 1 ether -> wei
    PRODUCER_ACTIVATOR_ACTIVATION_FEE: process.env.OBN_PRODUCER_ACTIVATOR_ACTIVATION_FEE || '1000000000000', // 1 finney -> wei
    GAS_PRICE: process.env.OBN_GAS_PRICE || '2000000000', // 2 Gwei -> wei,
    GAS_LIMIT: process.env.OBN_GAS_LIMIT || '4712388'
};
