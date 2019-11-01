<template>

    <el-container class="index">
      <el-header>
        <div class="logo">
          <img src="../assets/logo.png" alt="">
        </div>
        <div class="title">
          <h1>王者来袭</h1>
        </div>
        <div class="logout">
          欢迎光临~ <a @click="logouts" href="javascript:;">退出</a>
        </div>
      </el-header>
      <el-container>
        <!-- 侧边栏 -->
        <el-aside width="200px">
          <!--
             el-menu 整个大的导航组件
             el-submenu  子菜单
             el-menu-item 展开的内容
              default-active="1"  默认高亮
           -->
            <el-menu
            router
            :default-active="defaultActive"
            unique-opened
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#ffd04b">

              <!-- 导航一 -->
            <el-submenu :index="men.path" v-for="men in menuList" :key="men.id">
              <template v-slot:title>
                <i class="el-icon-location"></i>
                <span>{{men.authName}}</span>
              </template>
              <!-- 展开的内容 -->
              <!-- 解析时，会将配置的路径，当成绝对路径使用，写的是users=》/users -->
                <el-menu-item :index="item.path" v-for="item in men.children" :key="item.id">
                  <i class="el-icon-menu"></i>
                  <span slot="title">{{ item.authName}}</span>
                </el-menu-item>
            </el-submenu>
             <!-- <el-submenu index="2"> -->
               <!-- 导航一  -->
               <!-- <template v-slot:title>
                <i class="el-icon-location"></i>
                <span>权限管理</span>
              </template> -->
               <!-- 内容 -->
                <!-- <el-menu-item index="roles">
                  <i class="el-icon-menu"></i>
                  <span slot="title">角色列表</span>
                </el-menu-item>
                 <el-menu-item index="rights">
                  <i class="el-icon-menu"></i>
                  <span slot="title">权限列表</span>
                </el-menu-item>
            </el-submenu>  -->
          </el-menu>

        </el-aside>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
  </el-container>

</template>

<script>
export default {
  // 计算属性
  computed: {
    defaultActive () {
      // this.$route  拿到当前路由的相关信息对象（路径，参数）
      // this.$router 拿到整个路由实例
      // slice 从开始截取，包括开始，不包括结束
      return this.$route.path.slice(1)
    }
  },
  data () {
    return {
      menuList: []
    }
  },
  async created () {
    const { data, meta } = await this.$axios.get('menus')
    if (meta.status === 200) {
      this.menuList = data
      console.log(this.menuList)
    } else {
      this.$message.error(meta.msg)
    }
  },
  methods: {
    logouts () {
      this.$confirm('亲，你确认要退出吗!', '温馨提示', {
        type: 'warning'
      }).then(res => {
        // console.log('确认了')
        // 销毁本地的token
        localStorage.removeItem('token')
        // 跳转到登录页
        this.$router.push('/login')
      }).catch(e => {
        console.log(e)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
// 默认情况下，Vue开发的单页应用程序，不同组件之间的样式，是会影响的
  // 1. 使用模块的类名限制
  // 2. scoped属性，给style标签添加上scoped属性，可以让样式只做用与当前组件模板中
 .index {
   height: 100%;
   .el-header {
     background-color: #b8b8b8;
     display: flex;
     .logo {
       width: 180px;
       img {
         height: 40px;
         margin: 10px;
       }
     }
     .title {
       flex: 1;
       text-align: center;
       h1 {
         height: 60px;
         line-height: 60px;
       }
     }
     .logout {
       width: 180px;
       text-align: right;
       height: 60px;
       line-height: 60px;
       font-weight: 700;
       a {
         color: indianred;
       }
     }
   }
   .el-aside {
     background-color: #545c64;
     .el-menu {
       border: none;
     }
   }
   .el-main {
     background-color: #ecf0f1;
   }
 }
</style>
