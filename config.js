module.exports = {
    ETHEREUM_NODE_URL: process.env.OBN_ETHEREUM_NODE_URL || 'http://127.0.0.1:7545', // Ganache
    ACTIVATOR_ADDRESS: process.env.OBN_ACTIVATOR_ADDRESS || '',
    // Ganache accounts[9] with MNEMONIC: salmon reopen news visual estate such shell struggle where attend educate express
    TRACKER_ADDRESS: process.env.OBN_TRACKER_ADDRESS || '0x143Ade676D33F648Beb5097F6f3606b45249c34c',
    ACTIVATOR_MIN_AMOUNT: process.env.OBN_ACTIVATOR_MIN_AMOUNT || '1000000000000', // 1 finney -> wei
    GAS_PRICE: process.env.OBN_GAS_PRICE || '2000000000' // 2 Gwei -> wei
};
