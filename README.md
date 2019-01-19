This is a dog adoption dApp (decentralized application) based on my Dog Adoption Smart Contract. A dog owner (someone from animal rescue organization) posts a dog for an adoption (dog owner info and dog picture) via Ethereum smart contract. A dog owner should be certain that a possible dog adopter already owned a dog (dog adopter info and dog picture) before bringing a new dog home. 

 The frond end of the app is built with [Nuxt.js](https://nuxtjs.org/) (framework for Vue.js apps)  and will make use of [Vuetify.js](https://vuetifyjs.com/en/) component framework for Vue.js. 
 
 [Truffle](https://truffleframework.com/) is chosen as a development environment to make smart contracts compilation, development, testing easier. 
 
A dog owner info and picture will be stored on  [IPFS](https://ipfs.infura.io/ipfs/) (Interplanetary File System) as Ethereum is too heavy/expensive to store large blobs like images, video etc.

[Ganache](https://truffleframework.com/ganache) is chosen to make DApp development faster

App will be deployed to [Rinkeby](https://rinkeby.etherscan.io/) test network. 

We will not install a Geth or Parity node on our computer as it is not that easy and is time consuming. Instead, we will use [Infura](https://infura.io/) which is a Hosted Ethereum node cluster that lets your users run your application without requiring them to set up their own Ethereum node or wallet. 

The app will make use of  [Metamask](https://metamask.io/) browser extension which turns Google Chrome into an Ethereum browser, letting websites retrieve data from the blockchain, and letting users securely manage identities and sign transactions.

Dog Adoption Application (dApp) is hosted on Firebase - [https://dog-adoption-faf7b.firebaseapp.com/](https://dog-adoption-faf7b.firebaseapp.com/)

To get started.
```
       Clone the repository
   
       git clone https://github.com/Ashot72/Nuxt2Forum
       cd Nuxt2Forum
       
       # install dependencies
       npm install OR yarn install
       
       # serve with hot reload at localhost:3000
       npm run dev OR yarn run dev
       
       # build for production and launch server
        npm run build OR yarn run build
        npm start OR yarn start
```   

  Note, you should create mnemonic.js file in ethereum folder 
     [https://github.com/Ashot72/Dog-Adoption-dApp/tree/master/ethereum](https://github.com/Ashot72/Dog-Adoption-dApp/tree/master/ethereum) and specify your 12-word mnemonic (More in the description link below).
     
     module.exports = 'beach machine supply simple analyst trophy dirt naive blur alcohol essence hundred'
Go to [Dog Adoption Smart Contract GitHub](https://github.com/Ashot72/solidity-ERC-721--dogadoption-contract) page

Go to [Dog Adoption dApp with Ganache Video](https://youtu.be/NAeeolO4D38) page

Go to [Dog Adoption dApp on Rinkeby Test Nentwork Video](https://youtu.be/tFCLK55-UQw) page

Go to [How to run Dog Adoption dApp](https://ashot72.github.io/Dog-Adoption-dApp/index.html) page 

Go to [Dog Adoption dApp description ](https://ashot72.github.io/Dog-Adoption-dApp/description/index.html) page 


