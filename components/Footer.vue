<template>
  <v-footer fixed height="auto" class="grey lighten-3">
    <v-layout row wrap class="pl-2">
      <v-flex xs12 sm4>
        <div v-if="isMetaMask">
          <v-icon class="icon" color="teal">check_circle</v-icon>Metamask installed
        </div>
        <div v-else>
          <v-icon class="icon" color="red">error</v-icon>Metamask not installed
        </div>
      </v-flex>
      <v-flex xs12 sm4>
        <div v-if="networkId === ''">
          <v-icon class="icon" color="red">error</v-icon>Select a network
        </div>
        <div v-else>
          <v-icon class="icon" color="teal">check_circle</v-icon>
          Connect to network: {{network }} - {{networkId}}
        </div>
      </v-flex>
      <v-flex xs12 sm4>
        <div v-if="currentAccount === ''">
          <v-icon class="icon" color="red">error</v-icon>Select metamask account
        </div>
        <div v-else>
          <v-icon class="icon" color="teal">check_circle</v-icon>Account:
          <span class="breakWord">{{currentAccount}}</span>
        </div>
      </v-flex>
    </v-layout>
  </v-footer>
</template>

<script>
import web3 from "@/ethereum/web3";
import { mapState } from "vuex";

const networks = {
  0: "Olympic",
  1: "Main",
  2: "Morden",
  3: "Ropsten",
  4: "Rinkeby",
  42: "Kovan",
  77: "Sokol",
  99: "POA",
  5777: "Ganache"
};

export default {
  name: "Footer",
  data() {
    return {
      isMetaMask: web3.currentProvider.isMetaMask
    };
  },
  computed: {
    ...mapState(["networkId", "currentAccount"]),
    network() {
      return networks[this.networkId];
    }
  }
};
</script>

<style scoped>
.icon {
  position: relative;
  top: 3px;
  right: 2px;
}
.breakWord {
  word-wrap: break-word;
}
</style>