import Http from '../../libs/http'
import * as types from '../types'

const state = {
  loadAreas: [],
  unloadAreas: [],
  vehicles: [],
  vlengths: []
}

const mutations = {
  [types.COMMON_SETAREAS] (state, areas) {
    state.loadAreas = areas[0]
    state.unloadAreas = areas[1]
  },
  [types.COMMON_SET_VTYPES] (state, vtypes) {
    state.vehicles = vtypes[0]
    state.vlengths = vtypes[1]
  }
}

const actions = {
  [types.COMMON_GET_VTYPES] ( {commit}, params) {
    let context = params[0]
    Http.getJsonp(context, '/common/vtype', null, 
      function (status, result) {
        if (result && result.length > 0) {
          let vtypes = [], vlens = []
          for (let i=0; i<result.length; i++) {
            let item = [result[i].id, result[i].name]
            for (let k in result[i].sub) {
              vlens.push([k, result[i].sub[k]])
            }
            vtypes.push(item)
          }
          commit(types.COMMON_SET_VTYPES, [vtypes, vlens])
        }
        if (params.length > 1 && typeof params[1] === 'function') {
          params[1].call(context)
        }
      },
      function(status, code, msgs) {
        if (params.length > 2 && typeof params[2] === 'function') {
          params[2].call(context, code, msgs)
        }
      }
    )
  },
  [types.COMMON_GETAREAS] ( {commit}, params) {
    let context = params[0]
    Http.getJsonp(context, '/common/areas', {isall: 0}, 
      function(status, result) {
        let loadAreas = [], unloadAreas = []
        if (result && result.length > 0) {
          let area1 = {}, area2 = {}, loadArea3 = [], unloadArea3 = []
          for (let i=0; i<result.length; i++) {
            let item = result[i]
            if (item.type == 3) {
              if (item.loadOpen == 1) {
                loadArea3.push(item)
              }
              if (item.unloadOpen == 1) {
                unloadArea3.push(item)
              }
            } else if (item.type == 2) {
              area2[item.id] = item
            } else if (item.type == 1) {
              area1[item.id] = item
            }
          }
          for (let i=0; i<loadArea3.length; i++) {
            let id2 = loadArea3[i].id.slice(0, loadArea3[i].id.length-2) + '00'
            let id1 = id2.slice(0, id2.length-4) + '0000'
            loadAreas.push({
              name: loadArea3[i].title,
              value: loadArea3[i].id,
              parent: id2
            })
            if (!area2[id2].__load2) {
              area2[id2].__load2 = true
              loadAreas.push({
                name: area2[id2].title,
                value: id2,
                parent: id1
              })
            }
            if (!area1[id1].__load2) {
              area1[id1].__load2 = true
              loadAreas.push({
                name: area1[id1].title,
                value: id1,
                parent: 0
              })
            }
          }
          for (let i=0; i<unloadArea3.length; i++) {
            let id2 = unloadArea3[i].id.slice(0, unloadArea3[i].id.length-2) + '00'
            let id1 = id2.slice(0, id2.length-4) + '0000'
            unloadAreas.push({
              name: unloadArea3[i].title,
              value: unloadArea3[i].id,
              parent: id2
            })
            if (!area2[id2].__load1) {
              area2[id2].__load1 = true
              unloadAreas.push({
                name: area2[id2].title,
                value: id2,
                parent: id1
              })
            }
            if (!area1[id1].__load1) {
              area1[id1].__load1 = true
              unloadAreas.push({
                name: area1[id1].title,
                value: id1,
                parent: 0
              })
            }
          }
          commit(types.COMMON_SETAREAS, [loadAreas, unloadAreas])
        }
        if (params.length > 1 && typeof params[1] === 'function') {
          params[1].call(context, loadAreas, unloadAreas)
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
