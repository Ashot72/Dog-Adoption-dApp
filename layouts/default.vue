<template>
  <v-app class="grey lighten-4">
    <Navbar/>
    <v-content class="ma-1">
      <nuxt/>
    </v-content>
    <Footer/>
  </v-app>
</template>

<script>
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default {
  components: {
    Navbar,
    Footer
  }
};
</script>

<style>
.responsive {
  max-width: 100%;
  height: auto;
}
.small {
  max-width: 280px;
}
a {
  color: #3f51b5;
}
</style>
