var mnemonic = require('./mnemonic')
var HDWalletProvider = require('truffle-hdwallet-provider')

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 7545,
      network_id: '*',
      gas: 3000000
    },
    rinkeby: {
      provider: function () {
        return new HDWalletProvider(
          mnemonic,
          'https://rinkeby.infura.io/ksRbMGUc83UtaEKNn5px'
        )
      },
      network_id: 4
    }
  }
}
