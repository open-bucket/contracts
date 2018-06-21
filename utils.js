const Promise = require("bluebird");

function calledOnce(contract, filter) {
    return new Promise((resolve, reject) => {
        const event = contract[filter.event](filter);
        event.watch((error, result) => {
            if (error) {
                reject(error)
            }
            resolve(result)
        });
    });
}


module.exports = {
    calledOnce
};
