import Util from './util'

var appAjax = function (context, url, params, success, error, options) {
  params = params || {}
  if (typeof params.__ob__ !== 'undefined') {
    params = Util.extend({}, params)
  }
  if (url.indexOf('http') < 0 && window.$app && window.$app.apiUrl) {
    url = window.$app.apiUrl + url
    if (context && context.$store && context.$store.state.login && context.$store.state.login.requestKeys) {
      let requestKeys = context.$store.state.login.requestKeys
      if (requestKeys) {
        for (let i=0; i<requestKeys.length; i++) {
          params[requestKeys[i]] = context.$store.state.login[requestKeys[i]]
        }
      }
    }
  }
  options = options || {}
  options.url = url
  options.data = params
  if (typeof success === 'function') {
    options.success = function (content) {
      if (typeof content.status === 'number' && typeof content.result !== 'undefined') {
        if (content.status < 1) {
          if (typeof error === 'function') {
            error.call(context, content.status, content.result, content.msg, content.extra)
          }
        } else {
          success.call(context, content.status, content.result, content.extra)
        }
      } else {
        success.call(context, 1, content)
      }
    }
  }
  if (typeof error === 'function') {
    options.error = function (msg) {
      error.call(context, -1, '网络异常')
    }
  }
  Util.ajax(options)
}

var http = {
  post: function (context, url, params, success, error, options) {
    options = options || {}
    options.type = 'post'
    options.dataType = 'json'
    appAjax(context, url, params, success, error, options)
  },
  get: function (context, url, params, success, error, options) {
    options = options || {}
    if (typeof options.dataType === 'undefined') {
      options.dataType = 'json'
    }
    appAjax(context, url, params, success, error, options)
  },
  getJsonp: function (context, url, params, success, error, options) {
    options = options || {}
    options.dataType = 'json'
    url += '?callback='
    appAjax(context, url, params, success, error, options)
  }
}

export default http
