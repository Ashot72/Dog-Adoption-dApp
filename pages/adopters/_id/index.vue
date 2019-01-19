<template>
  <div>
    <v-layout row>
      <v-flex xs12>
        <img src="~/assets/dogadoption.jpg" class="responsive" style="min-height:100px;">
      </v-flex>
    </v-layout>
    <div v-show="loading" class="ma-3">
      <span class="caption black--text">Wait...</span>
      <v-progress-linear color="indigo" indeterminate></v-progress-linear>
    </div>
    <v-layout row wrap class="mb-5">
      <v-flex
        xs12
        sm6
        md4
        lg3
        v-for="(dogAdopter, index) in dogAdoptersByIndex(id)"
        :key="dogAdopter.tokenId"
      >
        <v-card class="ma-2">
          <v-responsive class="headline text-xs-center pt-2">
            <v-avatar size="200" class="grey lighten-2">
              <img :src="dogAdopter.image">
            </v-avatar>
          </v-responsive>
          <v-card-text style="line-height:1.7em">
            <div
              v-if="currentDogAdoption"
              class="headline text-xs-center text-truncate"
              :title="currentDogAdoption.name"
            >{{currentDogAdoption.name }}</div>
            <div class="grey--text text-truncate" :title="dogAdopter.from">
              <span class="black--text">Participant:</span>
              {{ dogAdopter.from }}
            </div>
            <div class="grey--text text-truncate" :title="dogAdopter.name">
              <span class="black--text">Owner Name:</span>
              {{ dogAdopter.name }}
            </div>
            <div class="grey--text text-truncate" :title="dogAdopter.phone">
              <span class="black--text">Owner Phone:</span>
              {{ dogAdopter.phone }}
            </div>
            <div class="grey--text text-truncate" :title="dogAdopter.phone">
              <span class="black--text">Amount:</span>
              {{ convertToEther(dogAdopter.amount) }} ether
            </div>
            <v-divider></v-divider>
            <div class="grey--text">
              <span class="black--text">Winner:</span>
              <span v-show="dogAdopter.winner">
                <span class="black--text">
                  <b>Yes</b>
                </span>
              </span>
              <span v-show="!dogAdopter.winner">No</span>
            </div>
            <div class="grey--text">
              <span class="black--text">Refunded:</span>
              <span v-show="dogAdopter.refunded">
                <span class="black--text">
                  <b>Yes</b>
                </span>
              </span>
              <span v-show="!dogAdopter.refunded">No</span>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn
              v-if="currentDogAdoption && isActive(currentDogAdoption) && isOwner(currentDogAdoption.owner)"
              small
              class="text-capitalize ml-1"
              color="indigo"
              outline
              @click="win(currentDogAdoption.index, dogAdopter.from)"
            >Make Winner
              <v-icon right dark>accessibility_new</v-icon>
            </v-btn>
            <v-btn
              v-if="currentDogAdoption && 
              isInActive(currentDogAdoption) && 
              isNotOwner(currentDogAdoption.owner) && 
              currentAccount !== '' && 
              dogAdopter.refunded === false &&
              dogAdopter.from === currentAccount"
              small
              class="text-capitalize ml-1"
              color="indigo"
              outline
              @click="tokenBackAndWithdraw(dogAdopter.from)"
            >Get Ownership Back and Withdraw</v-btn>
            <v-spacer></v-spacer>
            <v-btn icon @click="showHideInfo(index)">
              <v-icon
                title="Dog Info"
              >{{ index === updatedIndex ? 'keyboard_arrow_down' : 'keyboard_arrow_up' }}</v-icon>
            </v-btn>
          </v-card-actions>
          <v-slide-y-transition>
            <v-card-text v-show="index === updatedIndex">
              <div class="subheading text-xs-center grey--text">Dog Info</div>
              {{dogAdopter.info }}
            </v-card-text>
          </v-slide-y-transition>
        </v-card>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import web3 from "@/ethereum/web3";
import { pagesMixin } from "@/mixins/pagesMixin";
import { ADDNETWORKADDRESS, FETCHCURRENTACCOUNT } from "@/store/types";
import {
  FETCHDOGADOPTERS,
  FETCHDOGADOPTION,
  MAKEWINNER,
  WITHDRAW
} from "@/store/dogAdoption/types";
import { mapState, mapGetters, mapActions } from "vuex";

export default {
  name: "DogAdopters",
  props: ["id"],
  mixins: [pagesMixin],
  async fetch({ store, params: { id } }) {
    const dispatchActions = () => {
      store.dispatch(`dogAdoption/${FETCHDOGADOPTERS}`, id);
      store.dispatch(`dogAdoption/${FETCHDOGADOPTION}`, id);
    };

    let networkId = store.state.networkId;
    if (!networkId) {
      networkId = await web3.eth.net.getId();
      await store.dispatch(ADDNETWORKADDRESS, networkId);
      store.dispatch(FETCHCURRENTACCOUNT);

      dispatchActions();
    } else {
      dispatchActions();
    }
  },
  computed: {
    ...mapState("dogAdoption", ["dogAdopters", "currentDogAdoption"]),
    ...mapGetters("dogAdoption", ["dogAdoptersByIndex"])
  },
  methods: {
    ...mapActions("dogAdoption", {
      makeWinner: MAKEWINNER,
      withdraw: WITHDRAW
    }),
    convertToEther(amount) {
      return web3.utils.fromWei(amount, "ether");
    },
    tokenBackAndWithdraw(adopterAddress) {
      this.withdraw({ dogAdoptionId: this.id, adopterAddress });
    },
    win(dogAdoptionId, adopterAddress) {
      this.makeWinner({ dogAdoptionId, adopterAddress });
    }
  }
};
</script>