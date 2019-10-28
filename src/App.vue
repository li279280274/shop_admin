<template>
  <div id="app">

   <router-view></router-view>
  </div>
</template>

<style lang="scss">
/*  组件之间不加任何限制时，是会互相影响的 */
* {
  padding: 0;
  margin: 0;
}
html,body,#app {
  width: 100%;
  height: 100%;
}
</style>
