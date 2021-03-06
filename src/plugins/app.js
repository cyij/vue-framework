import Http from '../libs/http'
import Util from '../libs/util'
import GEvent from '../libs/gevent'
import Validator from '../libs/util/validate'

const plugin = {
  install (Vue, options) {
    options = options || {}
    Vue.$app = Util.extend(Vue.$app, options) 
    window.$app = options
    Vue.$app.http = Http
    Vue.$app.util = Util
    if (typeof Vue.$app.gevent === 'undefined') {
      Vue.$app.gevent = GEvent
    }

    Vue.mixin({
      props: {
        validator: String,
        title: ''
      },
      data () {
        return {
          currentValue: '',
          validators: [],
          error: ''
        }
      },
      created: function () {
        this.$app = Vue.$app
        if (this.validator) {
          let vs = this.validator.split(';')
          for (let i=0; i<vs.length; i++) {
            vs[i] = Util.trim(vs[i])
            if (!vs[i]) {
              continue
            }
            let func, params=[], error
            vs[i] = vs[i].split('|')
            let tmp = Util.trim(vs[i][0])
            if (vs[i].length > 1) {
              error = Util.trim(vs[i][1])
            }
            let pos = tmp.indexOf('(')
            if (pos >= 0) {
              func = Util.trim(tmp.substr(0, pos))
              tmp = tmp.substr(pos+1, tmp.length-pos-2).split(',')
              for (let j=0; j<tmp.length; j++) {
                tmp[j] = Util.trim(tmp[j])
                if (tmp[j]) {
                  params.push(tmp[j])
                }
              }
            } else {
              func = tmp
            }
            this.validators.push([func, params, error])
          }
        }
      },
      methods: {
        getError () {
          return this.error
        },
        validate (ignoreEmpty) {
          if (this.validators.length < 1) {
            return true
          }
          let status = true, error
          let value = this.currentValue
          if (typeof value === 'object') {
            if (typeof value.length === 'undefined') {
              return true
            } else {
              if (value.length > 0) {
                value = value[value.length-1]
              } else {
                value = ''
              }
            }
          }
          for (let i=0; i<this.validators.length; i++) {
            let validate = this.validators[i]
            if (!Validator(validate[0], value, validate[1], ignoreEmpty)) {
              status = false
              error = validate[2]
              break
            }
          }
          if (!status) {
            if (!error) {
              error = this.title + '不正确'
            }
            this.error = error
          } else {
            this.error = ''
          }
          return status
        },
        validates () {
          let status = true, errors = [], indexs = []
          for (let i=0; i<this.$children.length; i++) {
            if (typeof this.$children[i].validate === 'function') {
              if(!this.$children[i].validate(false)) {
                status = false
                if (typeof this.$children[i].getError === 'function') {
                  errors.push(this.$children[i].getError())
                  indexs.push(i)
                }
              }
            }
          }
          return [status, indexs, errors]
        }
      }
    })
  }
}

export default plugin
