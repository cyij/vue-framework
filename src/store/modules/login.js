import Http from '../../libs/http'
import * as types from '../types'

const SEP = String.fromCharCode(1);

const userKeys = ['suid', 'token', 'name', 'expire']

const user = {
}

for (let i=0; i<userKeys.length; i++) {
  user[userKeys[i]] = ''
}

user.suid = 0
user.expire = 0

user.requestKeys = ['suid', 'token']

const userKeyName = 'user'

// mutations
const mutations = {
  [types.LOGIN_INIT] (state) {
    // todo check browser or native
    let user = localStorage.getItem(userKeyName)
    if (!user) {
      return
    }
    let vals = user.split(SEP)
    if (vals.length != userKeys.length) {
      localStorage.removeItem(userKeyName)
    }
    for(let i=0; i<userKeys.length; i++) {
      state[userKeys[i]] = vals[i]
    }
  },
  [types.LOGIN_SUCCESS] (state, user) {
    for (let k in user) {
      if (typeof state[k] !== 'undefined') {
        state[k] = user[k]
      }
    }
    // todo check browser or native
    let v = []
    for(let i=0; i<userKeys.length; i++) {
      v.push(state[userKeys[i]])
    }
    localStorage.setItem(userKeyName, v.join(SEP))
  }
}

const actions = {
  [types.LOGIN_LOGIN] ( {commit}, params) {
    let context = params[0]
    let data = null
    if (params.length > 1) {
      data = params[1]
    }
    Http.getJsonp(context, '/shipper/account/login', data, 
      function(status, result) {
        commit(types.LOGIN_SUCCESS, result)
        if (params.length > 2 && typeof params[2] === 'function') {
          params[2].call(context, result)
        }
      },
      function(status, code, msgs) {
        if (params.length > 3 && typeof params[3] === 'function') {
          params[3].call(context, code, msgs)
        }
      }
    );
  },
  [types.LOGIN_VCODE] ({commit}, params) {
    let context = params[0]
    let data = null
    if (params.length > 1) {
      data = params[1]
    }
    Http.getJsonp(context, '/common/common/sendVerifyMsg', data, function (status, result) {
      if (params.length > 2 && typeof params[2] === 'function') {
        params[2].call(context, result)
      }
    }, function (status, code, msgs) {
      if (params.length > 3 && typeof params[3] === 'function') {
        params[3].call(context, code, msgs)
      }
    })
  },
  [types.LOGIN_CHECK] ({commit, state}, params) {
    let context = params[0]
    let status = true
    if (!state.token || state.token.length < 1 || 
      !state.expire || state.expire < 100) {
      status = false
    } else {
      let ts = +new Date()
      if (ts > (state.expire - 0)*1000) {
        status = false
      }
    }
    if (params.length > 1 && typeof params[1] === 'function') {
      params[1].call(context, status)
    }
  }
}

const state = user
export default {
  state,
  mutations,
  actions
}
