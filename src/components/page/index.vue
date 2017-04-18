<template>
  <div class="page" :class="pageClass" transition>
    <div class="navbar" v-if="hasNavbar" ref="navbar">
      <div class="navbar-inner">
        <div class="left">
          <a class="back link" @click="back" v-if="!noBack">
            <i class="icon icon-back"></i>
            <span>返回</span>
          </a>
          <span v-else>&nbsp;</span>
        </div>

        <div class="center">{{title}}</div>

        <div class="right">
          <a class="link" @click="rightClick" v-if="showMenu">
            <i class="icon"></i>
            <span>{{right}}</span>
          </a>
          <span v-else>&nbsp;</span>
        </div>
      </div>
    </div>
    <div class="page-content" ref="content">
      <slot></slot>
    </div>
    <div class="toolbar tabbar tabbar-labels" v-if="hasTabbar" ref="tabbar">
      <div class="toolbar-inner">
        <a class="tab-link" @click="goto(tabbar[0])" v-bind:data-page="tabbar[0]" v-for="tabbar in tabbars">
          <span :class="defaultIcon"></span>
          <span class="tabbar-label">{{ tabbar[1] }}</span>
        </a>
      </div>
    </div>
  </div>
</template>
<script>
import GEvent from '../../libs/gevent'
export default {
  props: {
    hasNavbar: {
      type: Boolean,
      default: false
    },
    hasTabbar: {
      type: Boolean,
      default: false
    },
    title: String,
    right: String | Object,
    noBack: {
      type: Boolean,
      default: false
    },
    tabbars: Array,
    indexPage: String
  },
  data () {
    return {
      pageNode: true,
      defaultIcon: 'icon f7-icons',
      pageNames: [],
      currentPage: '',
      icons: {}
    }
  },
  computed: {
    showMenu () {
      return !!this.right
    },
    pageClass () {
      return {
        'navbar-through': this.hasNavbar,
        'toolbar-through': this.hasTabbar
      }
    }
  },
  created () {
    if (!this.tabbars) {
      return
    }
    for (let i=0; i<this.tabbars.length; i++) {
      this.pageNames.push(this.tabbars[i][0])
      this.icons[this.tabbars[i][0]] = this.tabbars[i][2]
    }
    this.$nextTick(function() {
      this.goto(this.indexPage, {}, true)
    })
  },
  methods: {
    back () {
      GEvent.emit('navbarback')
    },
    rightClick () {
      this.$emit('on-right-click')
    },
    goto (pageName) {
      if (!this.$parent || this.currentPage === pageName) {
        return
      }
      this.currentPage = pageName
      this.$emit('tab-change', pageName)
      this.setActive(pageName)
    },
    setActive (newPage) {
      let pageName = newPage.toLowerCase()
      let tabbarNodes = this.$refs.tabbar.childNodes[0]
      for (let i=0; i<tabbarNodes.childNodes.length; i++) {
        let node = tabbarNodes.childNodes[i]
        let page = node.getAttribute('data-page')
        let className0 = node.className.replace(/active/g, '').split(' ')
        let isActive = page && page.toLowerCase() === pageName
        if (isActive) {
          className0.push('active')
        }
        let className = []
        for (let j=0; j<className0.length; j++) {
          if (className0[j]) {
            className.push(className0[j])
          }
        }
        node.className = className.join(' ')

        let icon = node.querySelector('.icon')
        if (isActive) {
          icon.className = this.defaultIcon + ' ' + this.icons[page]
        } else {
          icon.className = this.defaultIcon + ' ' + this.icons[page] + '-o'
        }
      }
    }
  }
}
</script>
<style lang="less">
@import '../../styles/index.less';
</style>
