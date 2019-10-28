import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Index from '../components/Index.vue'
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/index' },
  { path: '/index', component: Index, name: 'index' },
  { path: '/login', component: Login }
]

const router = new VueRouter({
  routes
})

export default router
