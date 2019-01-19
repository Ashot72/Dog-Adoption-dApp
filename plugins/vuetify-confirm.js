import Vue from 'vue'
import VuetifyConfirm from 'vuetify-confirm'

Vue.use(VuetifyConfirm, {
  buttonTrueText: 'Yes',
  buttonFalseText: 'No',
  color: 'orange',
  icon: 'warning',
  title: 'Warning',
  width: 350,
  property: '$confirm'
})
