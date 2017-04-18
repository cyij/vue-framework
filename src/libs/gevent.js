let listener = {}
export default {
  on (type, callback, target, once) {
    if (typeof listener[type] === 'undefined') {
      listener[type] = []
    } else {
      if (once) {
        return
      }
    }
    if (target) {
      listener[type].push(function (...data) {
        callback.apply(target, data)
      })
    } else {
      listener[type].push(callback)
    }
  },

  off (type) {
    delete listener[type]
  },

  emit (type, ...data) {
    if (typeof listener[type] === 'undefined') {
      return
    }
    for (let i=0; i<listener[type].length; i++) {
      listener[type][i].apply(window, data)
    }
  }
}
