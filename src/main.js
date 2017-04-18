// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import store from './store'

import AppUtil from './plugins/app'
import Page from './plugins/page'
Vue.use(Page, store)
Vue.use(AppUtil)

import { AlertPlugin, ToastPlugin, ConfirmPlugin, LoadingPlugin } from 'vux-local'

Vue.use(AlertPlugin)
Vue.use(ToastPlugin)
Vue.use(ConfirmPlugin)
Vue.use(LoadingPlugin)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  template: '<App/>',
  components: { App }
})
