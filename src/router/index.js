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

// 所有的路由在被访问时，都会先经过全局的前置守卫，只有前置守卫方行了，才能匹配到路由
// from 从哪来
// to  到哪去
// next() 方行    next（'/login'） 拦截到登录
router.beforeEach((to, from, next) => {
  // console.log(to)
  const token = localStorage.getItem('token')
  if (to.path === '/login' || token) {
    next()
  } else {
    next('/login')
  }
})
export default router
