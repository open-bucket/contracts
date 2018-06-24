module.exports = {
    ETHEREUM_NODE_URL: process.env.OBN_ETHEREUM_NODE_URL || 'http://127.0.0.1:7545', // Ganache
    ACTIVATOR_ADDRESS: process.env.OBN_ACTIVATOR_ADDRESS || '',
    TRACKER_ADDRESS: process.env.OBN_TRACKER_ADDRESS || '',
    ACTIVATOR_MIN_AMOUNT: process.env.OBN_ACTIVATOR_MIN_AMOUNT || '1000000000000' // 1 finney -> wei
};
