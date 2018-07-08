# OBN Contracts
Open Bucket contracts

For more information about the Open Bucket network, refer to: https://github.com/open-bucket/blueprint


## Development
### Run Ganache server on Docker

#### Available environment variables:
- OBN_GANACHE_PORT - default: `8545`
- OBN_GANACHE_MNEMONIC - default: `salmon reopen news visual estate such shell struggle where attend educate express`

#### Build Docker image
```bash
docker build -t ganache-server .
```

#### Run Docker container
```bash
docker run -e OBN_GANACHE_PORT=8545 ganache-server
```

