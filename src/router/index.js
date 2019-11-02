import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Index from '../components/Index.vue'

import Users from '../components/users/Users.vue'

import Roles from '../components/rights/Roles.vue'
import Rights from '../components/rights/Rights.vue'

import Categories from '../components/products/Categories.vue'
import Goods from '../components/products/Goods.vue'
import GoodsAdd from '../components/products/GoodsAdd.vue'

Vue.use(VueRouter)

const originalpush = VueRouter.prototype.push
VueRouter.prototype.push = function push (location) {
  return originalpush.call(this, location).catch(err => err)
}

const routes = [
  { path: '/', redirect: '/index' },
  {
    path: '/index',
    component: Index,
    name: 'index',
    children: [
      { path: '/users', component: Users },
      { path: '/roles', component: Roles },
      { path: '/rights', component: Rights },
      { path: '/categories', component: Categories },
      { path: '/goods', component: Goods },
      { path: '/goods-add', component: GoodsAdd }
    ]
  },
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
