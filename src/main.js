import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import router from './router'
import axios from 'axios'
import moment from 'moment'
import VueQuillEditor from 'vue-quill-editor'

// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.config.productionTip = false
// 只要是vue的插件，如果是模块化的开发模式，必须use一下
Vue.use(VueQuillEditor /* { default global options } */)
Vue.use(ElementUI)

// ----------------------------------axios的配置 -----
// 所有的组件都是可复用的vue实例
Vue.prototype.$axios = axios

// 配置axios的基准地址, 效果: 将来所有的请求, 会自动在前面拼接上路径
axios.defaults.baseURL = 'http://localhost:8888/api/private/v1/'

// 添加请求拦截器
axios.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么
  // console.log(config)
  // 在请求拦截器这里统一的加上token
  config.headers.Authorization = localStorage.getItem('token')
  return config
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error)
})

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
  // 对响应数据做点什么
  response = response.data
  // 统一对响应处理，如果状态码是401 ，过期或无效，拦截到登录
  if (response.meta.status === 401) {
    response.meta.msg = '尊敬的用户，你的登录状态已过期，请重新登录'
    // 清除无效的token
    localStorage.removeItem('token')
    // 拦截到登录
    router.push('/login')
  }
  return response
}, function (error) {
  // 对响应错误做点什么
  return Promise.reject(error)
})

// ----------------------

// 过滤器 处理日期时间
Vue.filter('time', function (value) {
  return moment(value * 1000).format('YYYY-MM-DD HH-mm-ss')
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
