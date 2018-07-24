/* eslint-disable no-console */
/**
 * Lib imports
 */
const Ganache = require('ganache-core');
const BPromise = require('bluebird');

/**
 * Project imports
 */
const GANACHE_PORT = process.env.OBN_GANACHE_PORT || 8545;
const GANACHE_MNEMONIC = process.env.OBN_GANACHE_MNEMONIC || 'salmon reopen news visual estate such shell struggle where attend educate express';

function startGanacheServerP(port) {
    const server = Ganache.server({
        mnemonic: GANACHE_MNEMONIC,
        port
    });
    return BPromise.promisify(server.listen.bind(server))(port);
}

startGanacheServerP(GANACHE_PORT)
    .then(() => console.log('Ganache server is listening on port', GANACHE_PORT))
    .catch(err => console.log('Ganache failed to start', err));
