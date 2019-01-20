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
    <v-layout row wrap style="margin-bottom: 75px">
      <v-flex xs12 sm6 md4 lg3 v-for="(dogAdoption, index) in dogAdoptions" :key="index">
        <v-card class="ma-2" :color="isInActive(dogAdoption) ? 'indigo lighten-5': 'white'">
          <v-responsive class="headline text-xs-center pt-2">
            <v-avatar size="200" class="grey lighten-2">
              <img :src="dogAdoption.image">
            </v-avatar>
          </v-responsive>
          <v-card-text style="line-height:1.7em">
            <div
              class="headline text-xs-center text-truncate"
              :title="dogAdoption.name"
            >{{dogAdoption.name }}</div>
            <div class="grey--text text-truncate" :title="dogAdoption.name">
              <span class="black--text">Owner:</span>
              {{ dogAdoption.owner }}
            </div>
            <div class="grey--text text-truncate" :title="dogAdoption.name">
              <span class="black--text">Owner Name:</span>
              {{ dogAdoption.ownerName }}
            </div>
            <div class="grey--text text-truncate" :title="dogAdoption.phone">
              <span class="black--text">Owner Phone:</span>
              {{ dogAdoption.phone }}
            </div>
            <v-divider></v-divider>
            <div class="grey--text">
              <span class="black--text">Winner Selected:</span>
              <span v-show="dogAdoption.approved">
                <span class="black--text">
                  <b>Yes</b>
                </span>
              </span>
              <span v-show="!dogAdoption.approved">No</span>
            </div>
            <div class="grey--text">
              <span class="black--text">Canceled:</span>
              <span v-show="dogAdoption.canceled">
                <span class="black--text">
                  <b>Yes</b>
                </span>
              </span>
              <span v-show="!dogAdoption.canceled">
                No
                <a
                  v-show="isActive(dogAdoption) && isOwner(dogAdoption.owner) 
                   && currentBlock !== ''"
                  class="font-weight-medium ml-2"
                  style="color:#3f51b5"
                  @click="cancel(dogAdoption)"
                >Cancel</a>
              </span>
            </div>
            <div class="grey--text">
              <span class="black--text">End Block:</span>
              <span v-show="currentBlock < dogAdoption.endBlock">{{dogAdoption.endBlock }}</span>
              <span v-show="currentBlock >= dogAdoption.endBlock">
                <span class="black--text">
                  <b>{{dogAdoption.endBlock }}</b>
                </span>
              </span>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-layout row wrap>
              <dog-adopter-dialog
                v-show="isActive(dogAdoption) && isNotOwner(dogAdoption.owner) 
                && currentBlock !== '' && networkReady"
                btn-color="indigo"
                :index="dogAdoption.index"
              />
              <v-btn
                small
                class="text-capitalize"
                color="indigo"
                :to="`/adopters/${dogAdoption.index}`"
                outline
              >View Participants
                <v-icon right dark>remove_red_eye</v-icon>
              </v-btn>
            </v-layout>
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
              {{dogAdoption.info }}
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
import DogAdopterDialog from "@/components/DogAdopterDialog";
import { ADDNETWORKADDRESS, FETCHCURRENTACCOUNT } from "@/store/types";
import {
  CANCELDOGADOPTION,
  FETCHDOGADOPTIONS
} from "@/store/dogAdoption/types";
import { mapState, mapGetters, mapActions } from "vuex";

export default {
  name: "DogAdoptions",
  mixins: [pagesMixin],
  async fetch({ store }) {
    let networkId = store.state.networkId;

    if (!networkId) {
      networkId = await web3.eth.net.getId();
      await store.dispatch(ADDNETWORKADDRESS, networkId);
      store.dispatch(FETCHCURRENTACCOUNT);

      store.dispatch(`dogAdoption/${FETCHDOGADOPTIONS}`);
    } else {
      store.dispatch(`dogAdoption/${FETCHDOGADOPTIONS}`);
    }
  },
  computed: {
    ...mapGetters(["networkReady"]),
    ...mapState("dogAdoption", ["dogAdoptions"])
  },
  methods: {
    ...mapActions("dogAdoption", {
      cancelDogAdoption: CANCELDOGADOPTION
    }),
    async cancel({ name, index }) {
      let res = await this.$confirm(
        `Do you really want to cancel dog adoption '${name}'?`,
        {
          title: "Warning"
        }
      );
      if (res) {
        this.cancelDogAdoption(index);
      }
    }
  },
  components: {
    DogAdopterDialog
  }
};
</script>