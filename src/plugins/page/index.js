import PageManager from './manage'
import GEvent from '../../libs/gevent'

const plugin = {
  install (Vue, store) {
    PageManager.init(Vue, PageConfigs, store)
    Vue.$app = Vue.$app || {}
    Vue.$app.pm = PageManager
    if (typeof Vue.$app.gevent === 'undefined') {
      Vue.$app.gevent = GEvent
    }

    let setCurrentIns = function (target) {
      if (target && target.__isPage) {
        PageManager.setCurrentLayer(target)
      }
    }

    GEvent.on('navbarback', function () {
      /*
            let currentLayer = PageManager.pageManage.getCurrentLayer()
            if (currentLayer && typeof currentLayer.onBackPress === 'function' &&
                !currentLayer.onBackPress()) {
                return
            }
            if (currentLayer && currentLayer.isPopLayer && typeof currentLayer.hide === 'function') {
                currentLayer.hide()
            } else if (currentLayer && currentLayer.__isPage) {
                PageManager.pageManage.finish()
            }
            */
      PageManager.finish()
    })

    Vue.mixin({
      props: {
        __gid: Number,
        pageName: String,
        __isPage: Boolean,
        __isTabPage: Boolean,
        transition: String
      },
      computed: {
        loginUser () {
          return this.$store.state.login
        }
      },
      created () {
        this.$app = Vue.$app
        let that = this
      },
      mounted () {
        setCurrentIns(this)
        let that = this
        if (this.__isPage) {
          this.goto = function (...params) {
              PageManager.goto.apply(that, params)
          }
          this.finish = function () {
            PageManager.finish.apply(that)
          }

          PageManager.lifecycles.onCreate(this)
        }
      },
      updated () {
        setCurrentIns(this)
      },
      activated () {
        setCurrentIns(this)
      },
      destroyed () {
        if (this.__isPage) {
          PageManager.lifecycles.onDestroy(this)
        }
      }
    })
  }
}

export default plugin
