<template>
<div class="toolbar tabbar tabbar-labels">
  <div class="toolbar-inner" ref="toolbar">
    <a class="tab-link" @click="goto" v-bind:data-page="tabbar[0]" v-for="tabbar in tabbars">
      <span :class="defaultIcon"></span>
      <span class="tabbar-label">{{ tabbar[1] }}</span>
    </a>
  </div>
</div>
</template>
<script>
export default {
  props: {
    tabbars: Array,
    currentPage: String,
    indexPage: String
  },
  data () {
    return {
      defaultIcon: 'icon f7-icons',
      pageNames: [],
      icons: {}
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
  },
  mounted () {
    this.setActive(this.indexPage)
  },
  methods: {
    goto (e) {
      if (!e || !e.target) {
        return
      }
      let node = e.target
      for (let i=0; i<10; i++) {
        if (node.className.indexOf('tab-link') >= 0) {
          break
        } else {
          node = node.parentNode
        }
      }
      this.$emit('tab-change', node.getAttribute('data-page'))
    },
    setActive (newPage) {
      let pageName = newPage.toLowerCase()
      for (let i=0; i<this.$refs.toolbar.childNodes.length; i++) {
        let node = this.$refs.toolbar.childNodes[i]
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
  },
  watch: {
    currentPage: function(newPage) {
      this.setActive(newPage)
    }
  }
}
</script>
<style lang="less">
@import '../../styles/index.less';
</style>
