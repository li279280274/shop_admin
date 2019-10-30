<template>
  <div class="login">
   <!--
      1. type  类型  颜色
      2. plain   朴素  简约
      3. round   圆角  胶囊按钮
      4. circle  圆 border-radius：50%
    -->
   <!-- <el-button type="danger">这是按钮</el-button> -->
   <!--
      el-form   整个大的表单组件
        （1） ：model=“form”
              绑定了一个form对象，将来form对象中的所有属性
              都会和表单中的元素，双向数据绑定，用来快速获取表单的值
       el-form-item  单个的表单项
          （1） label 配置label的文本
       el-input  输入框组件  用起来和input框一样
    -->

   <el-form ref="form" status-icon :model="form" :rules="rules" label-width="80px">
     <img class="logo" src="../assets/01.jpg" alt="">
        <el-form-item label="用户名" prop="username">
          <el-input @keyup.enter.native ="login" type="username" v-model="form.username"></el-input>
        </el-form-item>
         <el-form-item label="密码" prop="password">
          <el-input @keyup.enter.native ="login" type="password" v-model="form.password"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="login" class="btn" type="primary">登录</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>

</el-form>
  </div>
</template>

<script>
export default {
  data () {
    return {
      form: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          // 1. requird 必填项  不能为空
          // 2. message  错误提示
          // 3.  trigger  触发校验
          // blur   失去焦点时触发
          // change  改变输入框变化是触发
          { required: true, message: '用户名不能为空', trigger: ['change', 'blur'] },
          { min: 3, max: 12, message: '用户名长度必须在3-12位', trigger: ['change', 'blur'] }
        ],
        password: [
          { required: true, message: '用户名不能为空', trigger: ['change', 'blur'] },
          { min: 3, max: 12, message: '用户名长度必须在3-12位', trigger: ['change', 'blur'] }
        ]
      }
    }
  },
  methods: {
    reset () {
      // 希望获取到form表单组件，调用组件的重置方法（利用ref和refs）
      this.$refs.form.resetFields()
    },
    async login () {
      try {
        await this.$refs.form.validate()
        // console.log('成功')
        const { meta, data } = await this.$axios.post('login', this.form)
        if (meta.status === 200) {
          // 一登录成功，就存储token令牌（字符串）到本地
          localStorage.setItem('token', data.token)
          this.$message({
            message: meta.msg,
            type: 'success',
            duration: 1000
          })
          // this.$router.push('/index')
          // 也可以这样写
          this.$router.push({ name: 'index' })
        } else {
          this.$message.error(meta.msg)
        }
      } catch (e) {
        console.log(e)
      }

      // this.$refs.form.validate(isValid => {
      //   // nsole.log(isValid)
      //   // 如果失败直接返回
      //   if (!isValid) return
      //   // axios.post(url,data).then()
      //   this.$axios.post('login', this.form).then(res => {
      //     const { meta, data } = res
      //     if (meta.status === 200) {
      //       // 一登录成功，就存储token令牌（字符串）到本地
      //       localStorage.setItem('token', data.token)
      //       this.$message({
      //         message: meta.msg,
      //         type: 'success',
      //         duration: 1000
      //       })
      //       // this.$router.push('/index')
      //       // 也可以这样写
      //       this.$router.push({ name: 'index' })
      //     } else {
      //       this.$message.error(meta.msg)
      //     }
      //   })
      // })
    }
  }
}
</script>

<style lang="scss">
.login {
  width: 100%;
  height: 100%;
  background-color: #2b434c;
  overflow: hidden;
  .el-form {
    width: 400px;
    background-color: #fff;
    padding: 20px;
    padding-top: 70px;
    border-radius: 20px;
    margin: 0 auto;
   margin-top: 200px;
   position: relative;
   .logo {
     width: 110px;
     position: absolute;
     left: 50%;
     transform: translateX(-50%);
     top: -60px;
     border-radius: 50%;
     border: 5px solid #fff;
   }
   .btn {
     margin-right: 70px;
   }
  }
}
</style>
