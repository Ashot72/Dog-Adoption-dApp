<template>
  <nav>
    <v-toolbar flat app class="grey lighten-3">
      <v-toolbar-side-icon class="grey--text" @click="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title class="grey--text">
        <span class="font-weight-light">Dog</span>
        <span>Adoption</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <div class="grey--text subheading hidden-xs-only mr-2" v-show="currentBlock && !drawer">
        Latest Block:
        <span class="grey--text headline">{{ currentBlock }}</span>
      </div>
      <v-btn
        flat
        class="grey--text hidden-xs-only"
        v-show="!drawer && $route.name === 'adopters-id'"
        :to="'/'"
      >
        <v-icon left dark>home</v-icon>Home
      </v-btn>
      <dog-adoption-dialog
        v-show="!drawer && $route.name === 'index'"
        btn-class="grey--text hidden-xs-only"
      />
    </v-toolbar>
    <v-navigation-drawer v-model="drawer" app class="indigo">
      <v-layout column align-center>
        <v-flex class="mt-5">
          <v-avatar size="100">
            <img src="~/assets/dog.jpg">
          </v-avatar>
          <p class="white--text subheading mt-1">Dog Adoption</p>
        </v-flex>
        <v-flex v-show="$route.name === 'index'">
          <dog-adoption-dialog btn-color="white"/>
        </v-flex>
        <v-flex>
          <v-list v-show="$route.name === 'adopters-id'">
            <v-list-tile :to="'/'">
              <v-list-tile-action>
                <v-icon class="white--text">home</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title class="white--text">Home</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-flex>
        <v-flex>
          <div v-show="currentBlock" class="white--text subheading">
            Latest Block:
            <span class="white--text headline">{{ currentBlock }}</span>
          </div>
        </v-flex>
      </v-layout>
    </v-navigation-drawer>
  </nav>
</template>

<script>
import DogAdoptionDialog from "@/components/DogAdoptionDialog";
import { FETCHCURRENTBLOCK } from "@/store/types";

export default {
  name: "Navbar",
  data() {
    return {
      drawer: false
    };
  },
  computed: {
    currentBlock() {
      return this.$store.state.currentBlock;
    }
  },
  components: {
    DogAdoptionDialog
  },
  mounted() {
    setInterval(() => {
      return this.$store.dispatch(FETCHCURRENTBLOCK);
    }, 2000);
  }
};
</script>
