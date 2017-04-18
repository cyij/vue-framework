import Http from '../../libs/http'
import * as types from '../types'

const state = {}

const mutations = {
  [types.ORDER_RESET] (state) {
    state = {}
  },
  [types.ORDER_SET] (state, order) {
    for (let k in order) {
      state[k] = order[k]
    }
  }
}

const actions = {
  [types.ORDER_SUBMIT] ( {commit}, params) {
    let context = params[0]
    Http.getJsonp(context, '/common/common/areas', null, 
      function(status, result) {
        if (params.length > 1 && typeof params[1] === 'function') {
          params[1].call(context, result)
        }
      },
      function(status, code, msgs) {
        if (params.length > 2 && typeof params[2] === 'function') {
          params[2].call(context, code, msgs)
        }
      }
    );
  }
}

export default {
  state,
  mutations,
  actions
}
