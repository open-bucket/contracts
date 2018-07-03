module.exports = {
    ETHEREUM_NODE_URL: process.env.OBN_ETHEREUM_NODE_URL || 'ws://127.0.0.1:7545', // Ganache
    CONSUMER_ACTIVATOR_ADDRESS: process.env.OBN_CONSUMER_ACTIVATOR_ADDRESS || '',
    PRODUCER_ACTIVATOR_ADDRESS: process.env.OBN_PRODUCER_ACTIVATOR_ADDRESS || '',
    // Ganache accounts[9] with MNEMONIC: salmon reopen news visual estate such shell struggle where attend educate express
    TRACKER_ADDRESS: process.env.OBN_TRACKER_ADDRESS || '0x143Ade676D33F648Beb5097F6f3606b45249c34c',
    CONSUMER_ACTIVATOR_MIN_AMOUNT: process.env.OBN_CONSUMER_ACTIVATOR_MIN_AMOUNT || '1000000000000', // 1 finney -> wei
    PRODUCER_ACTIVATOR_ACTIVATION_FEE: process.env.OBN_PRODUCER_ACTIVATOR_ACTIVATION_FEE || '1000000000000', // 1 finney -> wei
    GAS_PRICE: process.env.OBN_GAS_PRICE || '2000000000', // 2 Gwei -> wei,
    GAS_LIMIT: process.env.OBN_GAS_LIMIT || '4712388'
};
