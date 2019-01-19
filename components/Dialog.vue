<template>
  <v-layout row wrap>
    <v-dialog v-model="dialog" persistent max-width="290">
      <v-card>
        <v-card-title class="headline indigo white--text">
          <slot name="title"></slot>
        </v-card-title>
        <v-card-text class="pa-2">
          <slot name="content"></slot>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="indigo" flat @click="close">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
export default {
  name: "Dialog",
  props: {
    dialog: {
      default: false
    }
  },
  methods: {
    close() {
      this.$emit("update:dialog", false);
    }
  }
};
</script>
