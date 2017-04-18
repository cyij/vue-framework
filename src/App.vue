<template>
<div style="height:100%;">
  <div class="views" ref='pageContainer'>
    <div class="view view-main">
      <div class="pages"></div>
    </div>
  </div>
</div>
</template>

<script>
export default {
  mounted () {
    this.$store.commit(this.$app.storeTypes.STORE_INIT)
    this.$store.dispatch(this, this.$app.storeTypes.LOGIN_CHECK, function (isLogin, isNew) {
      isLogin = true
      if (!isLogin) {
        this.$app.pm.appStart(this.$refs.pageContainer, 'home', 'login')
      } else {
        this.$app.pm.appStart(this.$refs.pageContainer, 'home')
      }
    })
  }
}
</script>
