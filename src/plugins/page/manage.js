import Vue from 'vue'
import Util from '../../libs/util'
import GEvent from '../../libs/gevent'

let pages = {}, stacks0 = [], stacks1 = {}, __gid = 0, gidPreKey = 'g_'
let _currentPageVM
let _c = +new Date()
let store

let __$pageContainer, __indexPageName
let currentLayerIns

var initPages = function (pages0) {
  Object.keys(pages0).forEach(function (name) {
    let pageConfig = pages0[name]
    if (typeof pageConfig !== 'object') {
      return true
    }
    name = name.toLowerCase()
    if (typeof pageConfig._Ctor === 'undefined') {
      if (typeof pageConfig.page === 'undefined') {
        return true
      }
      pages[name] = pageConfig
    } else {
      pages[name] = {
        page: pageConfig
      }
    }
  })
}

let lifecycles = {
  onCreate: '',
  onResume: '',
  onStop: '',
  onDestroy: '',
  onBackPress: ''
}

Util.each(lifecycles, function (key) {
  lifecycles[key] = function (target, ...params) {
    if (target.$options && typeof target.$options[key] === 'function') {
      target.$options[key].apply(target, params)
    }
  }
})

var goto = function (pageName, params, fromTabbar) {
  if (!pageName || (this && (!this.__isPage || this.$children.length < 1 || !this.$children[0].$refs.content))) {
    return
  }
  pageName = pageName.toLowerCase()
  if (!pages[pageName] || 
    (fromTabbar && (!this.$children[0].hasTabbar || !this.$children[0].$refs.content))) {
    return
  }
  let currentStack0Page, currentStack1Page, newStack0Page, newStack1Page
  if (fromTabbar) {
    currentStack0Page = this
    newStack0Page = this
    if (_currentPageVM.__isTabPage) {
      currentStack1Page = _currentPageVM
    }
    let gid = currentStack0Page.__gid, gidKey = gidPreKey + gid
    if (stacks1[gidKey]) {
      for (let i=0; i<stacks1[gidKey].length; i++) {
        if (stacks1[gidKey][i][1] === pageName) {
          newStack1Page = stacks1[gidKey][i][2]
        }
      }
    }
    if (!newStack1Page) {
      newStack1Page = createPage(gid, pageName, pages[pageName].page, params, this.$children[0].$refs.content, true)
      if (!stacks1[gidKey]) {
        stacks1[gidKey] = []
      }
      stacks1[gidKey].push([gid, pageName, newStack1Page, false, true])
    }
    for (let i=0; i<stacks1[gidKey].length; i++) {
      // 返回时，回到最后跳出的页面
      stacks1[gidKey][i][4] = stacks1[gidKey][i][1] === pageName
    }
  } else {
    if (this) {
      for (let i=0; i<stacks0.length; i++) {
        if (stacks0[i][0] === this.__gid) {
          currentStack0Page = stacks0[i][2]
          break
        }
      }
      if (this.__isTabPage) {
        currentStack1Page = this
      }
    }
    newStack0Page = createPage(++__gid, pageName, pages[pageName].page, params, null, false)
    if (newStack0Page.$children.length < 1) {
      return
    }
    let tabbarsName = []
    if (newStack0Page.$children[0].hasTabbar) {
      let tabbarsPageName = newStack0Page.$children[0].pageNames
      for (let i=0; i<tabbarsPageName.length; i++) {
        tabbarsName.push(tabbarsPageName[i].toLowerCase())
      }
    } else {
      tabbarsName = true
    }
    stacks0.push([newStack0Page.__gid, pageName, newStack0Page, tabbarsName.length>0, tabbarsName])
  }
  if (newStack0Page) {
    _currentPageVM = newStack0Page
  }
  if (newStack1Page) {
    _currentPageVM = newStack1Page
  }
  transition(currentStack0Page, currentStack1Page, newStack0Page, newStack1Page, true)
}

var finish = function () {
  let pageStack = getCurrentAndPrePageVMs()
  if (!pageStack) {
    confirmToExist()
    return
  }
  if (!pageStack[0]) {
    confirmToExist()
    return
  }

  let preStack0Page = pageStack[0]
  let preStack1Page = pageStack[1]
  let currentStack0Page = pageStack[2]
  let currentStack1Page = pageStack[3]

  if (preStack1Page) {
    _currentPageVM = preStack1Page
  } else {
    _currentPageVM = preStack0Page
  }

  transition(currentStack0Page, currentStack1Page, preStack0Page, preStack1Page)
}

var transition = function (currentStack0Page, currentStack1Page, newStack0Page, newStack1Page, forward) {
  let currentStack0PageClass, currentStack1PageClass, newStack0PageClass, newStack1PageClass
  let hasTransition = true
  if (!currentStack0Page) {
    newStack0PageClass = 'page-on-center'
    if (newStack1Page) {
      newStack1PageClass = 'page-on-center'
    }
    hasTransition = false
  } else {
    let currentPageInd = -1, newPageInd = -1
    for (let i=0; i<stacks0.length; i++) {
      if (currentStack0Page.__gid === stacks0[i][0]) {
        currentPageInd = i
      }
      if (newStack0Page.__gid === stacks0[i][0]) {
        newPageInd = i
      }
      if (currentPageInd >= 0 && newPageInd >= 0) {
        break
      }
    }
    if (currentStack0Page.__gid === newStack0Page.__gid) {
      let tabPageNames = stacks0[newPageInd][4]
      let i0 = -1, i1 = -1, leftPages={}, rightPages={}
      for (let i=0; i<tabPageNames.length; i++) {
        if (currentStack1Page && currentStack1Page.pageName === tabPageNames[i]) {
          i0 = i
        }
        if (newStack1Page && newStack1Page.pageName === tabPageNames[i]) {
          i1 = i
        }
        if (!currentStack1Page || currentStack1Page.pageName !== tabPageNames[i]) {
          if (i < i1) {
            leftPages[tabPageNames[i]] = 1
          } else if (i > i1) {
            rightPages[tabPageNames[i]] = 1
          }
        }
      }
      if (i0 < i1) {
        currentStack1PageClass = 'page-from-center-to-left'
        newStack1PageClass = 'page-from-right-to-center'
      } else {
        currentStack1PageClass = 'page-from-center-to-right'
        newStack1PageClass = 'page-from-left-to-center'
      }
      if (!newStack1Page || !currentStack1Page ||
        newStack1Page.$el.getAttribute('transition') === null || currentStack1Page.$el.getAttribute('transition') === null) {
        currentStack1PageClass = currentStack1PageClass.replace(/from-right-to|from-left-to|from-center-to/, 'on')
        newStack1PageClass = newStack1PageClass.replace(/from-right-to|from-left-to|from-center-to/, 'on')
        hasTransition = false
      }

      let gidKey = gidPreKey + newStack0Page.__gid
      for (let i=0; i<stacks1[gidKey].length; i++) {
        if (leftPages[stacks1[gidKey][i][1]]) {
          stacks1[gidKey][i][2].$el.parentNode.className = 'page-outter page-on-left'
        }
        if (rightPages[stacks1[gidKey][i][1]]) {
          stacks1[gidKey][i][2].$el.parentNode.className = 'page-outter page-on-right'
        }
      }
    } else {
      if (forward) {
        currentStack0PageClass = 'page-from-center-to-left'
        newStack0PageClass = 'page-from-right-to-center'
      } else {
        currentStack0PageClass = 'page-from-center-to-right'
        newStack0PageClass = 'page-from-left-to-center'
        currentStack0Page.$el.parentNode.setAttribute('destroy', 1)
      }
      if (newStack0Page.$el.getAttribute('transition') === null || currentStack0Page.$el.getAttribute('transition') === null) {
        currentStack0PageClass = currentStack0PageClass.replace(/from-right-to|from-left-to|from-center-to/, 'on')
        newStack0PageClass = newStack0PageClass.replace(/from-right-to|from-left-to|from-center-to/, 'on')
        hasTransition = false
      }
    }
  }
  if (currentStack0PageClass && currentStack0Page) {
    currentStack0Page.$el.parentNode.className = 'page-outter ' + currentStack0PageClass
  }
  if (currentStack1PageClass && currentStack1Page) {
    currentStack1Page.$el.parentNode.className = 'page-outter ' + currentStack1PageClass
  }
  if (newStack0PageClass && newStack0Page) {
    newStack0Page.$el.parentNode.className = 'page-outter ' + newStack0PageClass
  }
  if (newStack1PageClass && newStack1Page) {
    newStack1Page.$el.parentNode.className = 'page-outter ' + newStack1PageClass
  }

  if (!forward && newStack1Page && newStack0Page && newStack0Page.tabChange) {
    newStack0Page.tabChange(newStack1Page.pageName, true)
  }

  if (!hasTransition) {
    setTimeout(function () {
      if (!currentStack0Page || currentStack0Page.__gid !== newStack0Page.__gid) {
        lifecycles.onResume(newStack0Page)
      }
      if (newStack1Page) {
        lifecycles.onResume(newStack1Page)
      }
    }, 0)
    setTimeout(function () {
      if (currentStack0Page && currentStack0Page.__gid !== newStack0Page.__gid) {
        lifecycles.onStop(currentStack0Page)
      }
      if (currentStack1Page) {
        lifecycles.onStop(currentStack1Page)
      }
      resetStacks()
    }, 0)
  }
}

var confirmToExist = function () {
  confirm("确定退出？")
}

var getCurrentAndPrePageVMs = function () {
  if (!_currentPageVM) {
    return null
  }
  let currentStack0Page, currentStack1Page, preStack0Page, preStack1Page
  let currentStack0Ind = -1
  if (!_currentPageVM.__isTabPage) {
    currentStack0Page = _currentPageVM
    for (let i=0; i<stacks0.length; i++) {
      if (stacks0[i][0] === currentStack0Page.__gid) {
        currentStack0Ind = i      
        break
      }
    }
    if (currentStack0Ind < 1) {
      return [null, null, currentStack0Page, null]
    }
    preStack0Page = stacks0[currentStack0Ind-1][2]
    if (stacks0[currentStack0Ind-1][3]) {
      let gidKey = preStack0Page.__gid
      if (stacks1[gidKey]) {
        for (let i=0; i<stacks1[gidKey].length; i++) {
          if (stacks1[gidKey][i][4]) {
            preStack1Page = stacks1[gidKey][i][2]
            break
          }
        }
      }
    }
  } else {
    let currentGid = _currentPageVM.__gid
    let indexTabPageName
    for (let i=0; i<stacks0.length; i++) {
      if (stacks0[i][0] === currentGid) {
        currentStack0Page = stacks0[i][2]
        indexTabPageName = stacks0[i][4][0]
        currentStack0Ind = i
        break
      }
    }
    currentStack1Page = _currentPageVM
    if (currentStack0Page.$refs.toolbar) {
      indexTabPageName = currentStack0Page.$refs.toolbar.indexPage
    }
    if (currentStack1Page.pageName !== indexTabPageName) {
      let gidKey = gidPreKey + currentGid
      if (stacks1[gidKey]) {
        for (let i=0; i<stacks1[gidKey].length; i++) {
          if (stacks1[gidKey][i][1] === indexTabPageName) {
            preStack1Page = stacks1[gidKey][i][2]
            preStack0Page = currentStack0Page
            break
          }
        }
      }
    }
    if (!preStack0Page) {
      if (currentStack0Ind < 1) {
        return [null, null, currentStack0Page, currentStack1Page]
      }
      preStack0Page = stacks0[currentStack0Ind-1][2]
      if (stacks0[currentStack0Ind-1][3]) {
        let gidKey = gidPreKey + stacks0[currentStack0Ind-1][0]
        if (stacks1[gidKey]) {
          for (let i=0; i<stacks1[gidKey].length; i++) {
            if (stacks1[gidKey][i][4]) {
              preStack1Page = stacks1[gidKey][i][2]
              break
            }
          }
        }
      }
    }
  }
  return [preStack0Page, preStack1Page, currentStack0Page, currentStack1Page]
}
var pageAnimationEndListener = function (e) {
  let page = e.target
  let uid = page.id.replace(/p_/, '')
  let pageClass = page.className
  if (pageClass.indexOf('page-on-') >= 0) {
    return
  }
  let gid = page.getAttribute('data-gid')
  let pageName = page.getAttribute('data-page')
  pageClass = pageClass.replace(/page-from-center-to-|page-from-right-to-|page-from-left-to-/g, 'page-on-')
  page.className = pageClass
  let page0, page1, page2
  let currentInd0 = -1
  for (let i=0; i<stacks0.length; i++) {
    if (stacks0[i][0] == gid) {
      currentInd0 = i
      page0 = stacks0[i][2]
      if (page0.$children[0].hasTabbar && !page0.__isTabPage) {
        let gidKey = gidPreKey + gid
        if (stacks1[gidKey]) {
          for (let j=0; j<stacks1[gidKey].length; j++) {
            if (stacks1[gidKey][j][4]) {
              page1 = stacks1[gidKey][j][2]
            }
            if (stacks1[gidKey][j][1] === pageName) {
              page2 = stacks1[gidKey][j][2]
            }
          }
        }
      }
    }
  }
  if (pageClass.indexOf('page-on-center') >= 0) {
    setTimeout(function () {
      if (page0 && page1) {
        if (currentInd0 < stacks0.length -1) {
          lifecycles.onResume(page0)
        }
        lifecycles.onResume(page1)
      } else if (page0 && !page1) {
        lifecycles.onResume(page0)
      }
    }, 0)
  } else {
    setTimeout(function () {
      if (page0 && page0.__gid !== _currentPageVM.__gid) {
        lifecycles.onStop(page0)
        if (page1) {
          lifecycles.onStop(page1)
        }
      } else {
        if (page2) {
          lifecycles.onStop(page2)
        }
      }
    }, 0)
  }

  if (pageClass.indexOf('page-on-center') >= 0) {
    resetStacks()
  }
}

var createPage = function (gid, pageName, vnode, props, container, fromTabbar) {
  if (!container) {
    container = __$pageContainer.querySelector('.pages')
  }
  let div1 = document.createElement('div')
  div1.className = 'page-outter'
  let div2 = document.createElement('div')
  let gidKey = gidPreKey + gid
  let nextEl
  if (fromTabbar && stacks1[gidKey] && stacks1[gidKey].length > 0) {
    let tabs
    for (let i=0; i<stacks0.length; i++) {
      if (stacks0[i][0] === gid) {
        tabs = stacks0[i][4]
        break
      }
    }
    if (tabs) {
      let nextPageName
      for (let i=0; i<tabs.length; i++) {
        if (tabs[i] === pageName) {
          if (i<tabs.length-1) {
            nextPageName = tabs[i+1]
          }
          break
        }
      }
      if (nextPageName) {
        for (let i=0; i<stacks1[gidKey].length; i++) {
          if (stacks1[gidKey][i][1] === nextPageName) {
            nextEl = stacks1[gidKey][i][2].$el.parentNode
            break
          }
        }
      }
    }
  }
  if (nextEl) {
    container.insertBefore(div1, nextEl)                    
  } else {
    container.appendChild(div1)                    
  }
  let component = Vue.extend(vnode)
  let options = {}
  if (store) {
    options = {store}
  }
  let vm = new component(options)
  props = props || {}
  props.__isPage = true
  props.__isTabPage = fromTabbar
  props.pageName = pageName
  props.__gid = gid
  props.uuid = vm._uid
  for (let k in props) {
    vm.$set(vm._props, k, props[k])
  }

  Util.animationEnd(div1, pageAnimationEndListener)
  div1.setAttribute('id', 'p_'+vm._uid)
  div1.setAttribute('data-page', pageName)
  div1.setAttribute('data-gid', gid)
  div1.appendChild(div2)
  vm.$mount(div2)
  return vm
}

var doPageDestroy = function (stackItem) {
  let pageVM = stackItem[2]
  let page = pageVM.$el.parentNode
  Util.animationOff(page, pageAnimationEndListener)
  page.remove()
  pageVM.$destroy()
}

var pageDestroy = function () {
  let gid = _currentPageVM.__gid
  let ind = 0
  for (let i=0; i<stacks0.length; i++) {
    if (gid === stacks0[i][0]) {
      ind = i
      break
    }
  }
  let isCurrentPageInIndexGroup = false
  if (stacks0[ind].length === 3) {
    let pageName1 = _currentPageVM.pageName.toLowerCase()
    for (let i=0; i<stacks0[ind][2].length; i++) {
      if (stacks0[ind][2][i] === pageName1) {
        isCurrentPageInIndexGroup = true
        break
      }
    }
  } else {
    if (_currentPageVM.pageName === __indexPageName) {
      isCurrentPageInIndexGroup = true
    }
  }
  let newStacks0 = []
  let leftGids = {}
  if (isCurrentPageInIndexGroup) {
    newStacks0.push(stacks0[ind])
    leftGids[gidPreKey + stacks0[ind][0]] = 1
  } else {
    for (let i=0; i<=ind; i++) {
      newStacks0.push(stacks0[i])
      leftGids[gidPreKey+stacks0[i][0]] = 1
    }
  }
  for (let i=0; i<stacks0.length; i++) {
    if (leftGids[gidPreKey+stacks0[i][0]]) {
      continue
    }
    if (stacks0[i].length === 2) {
      let gidKey = gidPreKey+stacks0[i][0]
      for (let j=0; j<stacks1[gidKey].length; j++) {
        doPageDestroy(stacks1[gidKey][j])
      }
      delete stacks1[gidKey]
    } else {
      doPageDestroy(stacks0[i])
    }
  }

  stacks0 = newStacks0
  window.stacks0 = stacks0
  window.stacks1 = stacks1
}

var resetStacks = function () {
  if (!_currentPageVM) {
    return
  }
  setTimeout(pageDestroy, 50)
}

let pageManage = {
  init (Vue, pageConfig, store0) {
    store = store0
    pageConfig = pageConfig || {}
    initPages(pageConfig)
    window.addEventListener("popstate", function(e) {
      window.history.pushState({_t: _c++}, '')
      if (typeof Vue.$app !== 'undefined' && Vue.$app.gevent) {
        Vue.$app.gevent.emit('navbarback')
      }
    });
    window.history.pushState({_t: _c++}, '')
  },
  lifecycles: lifecycles,
  appStart ($pageContainer, indexPageName, pageName, params) {
    __$pageContainer = $pageContainer
    __indexPageName = indexPageName
    if (!pageName) {
      pageName = __indexPageName
    }
    goto.call(null, pageName, params)
  },
  appEnd () {
  },
  setCurrentLayer (target) {
    currentLayerIns = target
  },
  getCurrentLayer () {
    return currentLayerIns
  },
  finish: finish,
  goto: goto
}

export default pageManage
