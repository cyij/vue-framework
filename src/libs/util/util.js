var emptyArray = [], concat = emptyArray.concat, filter = emptyArray.filter, slice = emptyArray.slice,
  class2type = {}, toString = class2type.toString,
  isArray = Array.isArray || function(object) { return object instanceof Array };

let trim = function (str) {
  if (!str) {
    return str
  }
  str = str.replace(/^\s\s*/, '')
  let ws = /\s/, i = str.length, rs = str
  while (ws.test(str.charAt(--i))) {
    rs = str.slice(0, i)
  }
  return rs
}

var type = function (obj) {
  return obj === null ? String(obj) :
    class2type[toString.call(obj)] || "object"
}

var isFunction = function (value) { return type(value) == "function" }
var isWindow = function (obj) { return obj !== null && obj == obj.window }
var isDocument = function (obj) { return obj !== null && obj.nodeType == obj.DOCUMENT_NODE }
var isObject = function (obj) { return type(obj) == "object" }
var isPlainObject = function (obj) {
  return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
}

var likeArray = function (obj) {
  var length = !!obj && 'length' in obj && obj.length,
    type = type(obj)

  return 'function' != type && !isWindow(obj) && (
    'array' == type || length === 0 ||
    (typeof length == 'number' && length > 0 && (length - 1) in obj)
  )
}

var requestAnimationFrame = function (callback) {
  if (window.requestAnimationFrame) return window.requestAnimationFrame(callback);
  else if (window.webkitRequestAnimationFrame) return window.webkitRequestAnimationFrame(callback);
  else {
    return window.setTimeout(callback, 1000 / 60);
  }
}

var cancelAnimationFrame = function (id) {
  if (window.cancelAnimationFrame) return window.cancelAnimationFrame(id);
  else if (window.webkitCancelAnimationFrame) return window.webkitCancelAnimationFrame(id);
  else {
    return window.clearTimeout(id);
  }
}

var each = function (obj, callback) {
  if (typeof obj !== 'object' || typeof callback !== 'function') {
    return
  }
  if (typeof obj.length === 'number') {
    var i;
    for (i=0; i<obj.length; i++) {
      if (callback(i, obj[i]) === false) {
        return;
      }
    }
  } else {
    var prop;
    for (prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        if (callback(prop, obj[prop]) === false) {
          return;
        }
      }
    }
  }
}

var extend = function (target, source, deep) {
  var key
  target = target || {}
  for (key in source) {
    if (typeof target[key] !== 'undefined') {
      continue
    }
    if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
      if (isPlainObject(source[key]) && !isPlainObject(target[key])) {
        target[key] = {}
      }
      if (isArray(source[key]) && !isArray(target[key])) {
        target[key] = []
      }
      extend(target[key], source[key], deep)
    } else if (source[key] !== undefined) {
      target[key] = source[key]
    }
  }
  return target
}

var serializeObject = function (obj, parents) {
  if (typeof obj === 'string') return obj;
  var resultArray = [];
  var separator = '&';
  parents = parents || [];
  var newParents;
  function var_name(name) {
    if (parents.length > 0) {
      var _parents = '';
      for (var j = 0; j < parents.length; j++) {
        if (j === 0) _parents += parents[j];
        else _parents += '[' + encodeURIComponent(parents[j]) + ']';
      }
      return _parents + '[' + encodeURIComponent(name) + ']';
    } else {
      return encodeURIComponent(name);
    }
  }
  function var_value(value) {
    return encodeURIComponent(value);
  }
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      var toPush;
      if (Array.isArray(obj[prop])) {
        toPush = [];
        for (var i = 0; i < obj[prop].length; i ++) {
          if (!Array.isArray(obj[prop][i]) && typeof obj[prop][i] === 'object') {
            newParents = parents.slice();
            newParents.push(prop);
            newParents.push(i + '');
            toPush.push(serializeObject(obj[prop][i], newParents));
          } else {
            toPush.push(var_name(prop) + '[]=' + var_value(obj[prop][i]));
          }

        }
        if (toPush.length > 0) resultArray.push(toPush.join(separator));
      } else if (obj[prop] === null) {
        resultArray.push(var_name(prop) + '=');
      } else if (typeof obj[prop] === 'object') {
        // Object, convert to named array
        newParents = parents.slice();
        newParents.push(prop);
        toPush = serializeObject(obj[prop], newParents);
        if (toPush !== '') resultArray.push(toPush);
      } else if (typeof obj[prop] !== 'undefined' && obj[prop] !== '') {
        // Should be string or plain value
        resultArray.push(var_name(prop) + '=' + var_value(obj[prop]));
      } else if (obj[prop] === '') {
        resultArray.push(var_name(prop));
      }
    }
  }
  return resultArray.join(separator)
}

var on = function (dom, event, listener) {
  var events = event.split(' ');
  for (let j = 0; j < events.length; j++) {
    dom.addEventListener(events[j], listener, false);
  }
}

var off = function (dom, event, listener) {
  var events = event.split(' ');
  for (let j = 0; j < events.length; j++) {
    dom.removeEventListener(events[j], listener, false);
  }
}

var once = function (dom, event, listener) {
  function proxy(e) {
    listener(e);
    off(dom, event, proxy);
  }
  on(dom, event, proxy)
}

let transitionEndEvent = 'transitionend'
if (window.ontransitionend === undefined &&
  window.onwebkittransitionend !== undefined) {
  transitionEndEvent = 'webkitTransitionEnd'
}

var transitionEnd = function (dom, listener, once) {
  if (once) {
    once(dom, transitionEndEvent, listener)
  } else {
    on(dom, transitionEndEvent, listener)
  }
}

let animationEndEvent = 'animationend'
if (window.onanimationend === undefined &&
  window.onwebkitanimationend !== undefined) {
  animationEndEvent = 'webkitAnimationEnd'
}

var animationEnd = function (dom, listener, once) {
  if (once) {
    once(dom, animationEndEvent, listener)
  } else {
    on(dom, animationEndEvent, listener)
  }
}

var transitionOff = function (dom, listener) {
  off(dom, transitionEndEvent, listener)
}

var animationOff = function (dom, listener) {
  off(dom, animationEndEvent, listener)
}

export default {
  trim: trim,
  type: type,
  isArray: isArray,
  isFunction: isFunction,
  isWindow: isWindow,
  isDocument: isDocument,
  isObject: isObject,
  isPlainObject: isPlainObject,
  likeArray: likeArray,
  each: each,
  extend: extend,
  serializeObject: serializeObject,
  requestAnimationFrame: requestAnimationFrame,
  cancelAnimationFrame: cancelAnimationFrame,
  on: on,
  off: off,
  once: once,
  transitionEnd: transitionEnd,
  animationEnd: animationEnd,
  transitionOff: transitionOff,
  animationOff: animationOff
}
