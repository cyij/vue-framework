import Vue from 'vue'
import Vuex from 'vuex'
import common from './modules/common'
import login from './modules/login'
import order from './modules/order'
import * as types from './types'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

let store = new Vuex.Store({
  mutations: {
    [types.STORE_INIT] (state) {
      store.commit(types.LOGIN_INIT)
    }
  },
  modules: {
    common,
    login,
    order
  },
  strict: debug
})


let dispatch = store.dispatch

store.dispatch = function (context, type, ...payload) {
  let payload2
  if (payload) {
    payload2 = [context].concat(payload)
  } else {
    payload2 = [context]
  }
  dispatch(type, payload2)
}

export default store
