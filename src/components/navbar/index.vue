<template>
<div class="navbar">
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
</template>

<script>
import GEvent from '../../libs/gevent'
export default {

  props: {
    title: String,
    right: String | Object,
    noBack: {
      type: Boolean,
      default: false
    }
  },
  computed : {
    showMenu () {
      return !!this.right
    }
  },
  methods: {
    back () {
      GEvent.emit('navbarback')
    },
    rightClick () {
      this.$emit('on-right-click')
    }
  }

}
</script>
<style lang="less">
@import '../../styles/index.less';
</style>
