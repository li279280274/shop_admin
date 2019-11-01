<template>
  <div class="users">
   <!-- 面包屑 -->
   <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
  </el-breadcrumb>
   <!-- 搜索框 -->
   <el-input placeholder="请输入内容" v-model="query" class="input-with-select">
    <el-button @click="searchUser" slot="append" icon="el-icon-search"></el-button>
  </el-input>
  <el-button type="success" plain class="btn" @click="showAddDialog">添加用户</el-button>
   <!-- 表格 -->
   <!--
     el-table 整个表格
       ：data   表格配置的数据
     el-table-column  每一列
        label 列的标题，表头
    -->
    <el-table :data="userList">
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="用户状态">
          <!-- 通过 Scoped slot 可以获取到 row, column, $index 和 store的数据 -->
          <template v-slot:default="obj">
           <!-- {{obj.row}} -->
            <el-switch
             @change="changeState(obj.row.id,obj.row.mg_state)"
              v-model="obj.row.mg_state"
              active-color="#13ce66"
              inactive-color="#ff4949">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
           <template v-slot:default="{ row }">
              <el-button @click="showEditDialog(row)" icon="el-icon-edit" size="small" plain type="primary"></el-button>
              <el-button @click="delUser(row.id)" icon="el-icon-delete" size="small" plain type="danger"></el-button>
              <el-button @click="showAssignDialog(row)" icon="el-icon-check" size="small" plain type="success">分配角色</el-button>
           </template>
        </el-table-column>
    </el-table>
   <!-- 分页 -->
   <!--
     @size-change="handleSizeChange"  每页条数的变化
     @current-change="handleCurrentChange"   当前页的变化

       :current-page   当前页
       :page-sizes  可供选择的每页条数
        :page-size  当前页每页条数
        layout   展示的功能控件
    -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagenum"
          :page-sizes="[2, 4, 6, 8]"
          :page-size="pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
          <!-- 添加 -->
         <el-dialog
            title="添加用户"
            :visible.sync="dialogVisible"
            @close= "closeDialog"
            width="40%">

            <el-form ref="form" :rules="rules" :model="form" label-width="80px">
               <el-form-item label="用户名" prop="username">
                  <el-input placeholder="请输入用户名" v-model="form.username"></el-input>
               </el-form-item>
               <el-form-item label="密码" prop="password">
                  <el-input type="password" placeholder="请输入密码" v-model="form.password"></el-input>
               </el-form-item>
               <el-form-item label="邮箱" prop="email">
                  <el-input placeholder="请输入邮箱" v-model="form.email"></el-input>
               </el-form-item>
               <el-form-item label="手机" prop="mobile">
                  <el-input placeholder="请输入手机" v-model="form.mobile"></el-input>
               </el-form-item>
            </el-form>

            <template v-slot:footer>
              <span class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
              </span>
            </template>
         </el-dialog>

         <!-- 修改 -->
         <el-dialog
            title="修改用户"
            :visible.sync="editVisible"
            width="40%">

            <el-form ref="editForm" :rules="rules" :model="editForm" label-width="80px">
               <el-form-item label="用户名">
                <el-tag type="info"> {{ editForm.username }}</el-tag>
               </el-form-item>
               <el-form-item label="邮箱" prop="email">
                  <el-input placeholder="请输入邮箱" v-model="editForm.email"></el-input>
               </el-form-item>
               <el-form-item label="手机" prop="mobile">
                  <el-input placeholder="请输入手机" v-model="editForm.mobile"></el-input>
               </el-form-item>
            </el-form>
            <template v-slot:footer>
              <span class="dialog-footer">
                 <el-button @click="editVisible=false">取消</el-button>
                 <el-button @click="editUser" type="primary">确定</el-button>
              </span>
            </template>

         </el-dialog>

         <!-- 分配角色 -->
         <el-dialog
            title="分配角色"
            :visible.sync="assignVisible"
            width="40%">

            <el-form :model="assignForm" label-width="80px">
               <el-form-item label="用户名">
                <el-tag type="info"> {{ assignForm.username }}</el-tag>
               </el-form-item>
               <el-form-item label="角色里边">
             <el-select v-model="assignForm.rid" placeholder="请选择">
                  <el-option
                    v-for="item in options"
                    :key="item.id"
                    :label="item.roleName"
                    :value="item.id">
                    </el-option>
              </el-select>
               </el-form-item>
            </el-form>
            <template v-slot:footer>
              <span class="dialog-footer">
                 <el-button @click="editVisible=false">取消</el-button>
                 <el-button @click="assignRole" type="primary">分配</el-button>
              </span>
            </template>

         </el-dialog>
  </div>
</template>

<script>
export default {
// vue组件 也是vue实例，也有自己的生命周期函数
// created：会将data中的数据注入到当前实例上。此时实例上已经有数据了
  created () {
    this.getUserList()
  },
  data () {
    return {
      userList: [],
      query: '',
      pagenum: 1, // 当前页
      pagesize: 4, // 每页的条数
      total: 0,
      dialogVisible: false,
      form: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入活动名称', trigger: ['change', 'bule'] },
          { min: 3, max: 12, message: '长度在 3 到 12 个字符', trigger: ['change', 'bule'] }
        ],
        password: [
          { required: true, message: '请输入活动名称', trigger: ['change', 'bule'] },
          { min: 3, max: 12, message: '长度在 3 到 12 个字符', trigger: ['change', 'bule'] }
        ],
        email: [
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['change', 'bule'] }
        ],
        mobile: [
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: ['change', 'bule'] }
        ]
      },
      editVisible: false,
      editForm: {
        id: '',
        username: '', // 用户名用于展示
        email: '',
        mobile: ''
      },
      assignVisible: false,
      assignForm: {
        id: '',
        rid: '',
        username: '' // 用户用户的展示
      },
      options: []
    }
  },
  methods: {
    async getUserList () {
      // axios.post(url,data,config).then(),catch()   data指在请求体中发送的数据
      // put  patch 同post
      // axios。get（uel，config）
      // delete 同get
      // 发送ajax数据，存到userList上
      const { meta, data } = await this.$axios.get('users', {
        params: {
          query: this.query,
          pagenum: this.pagenum,
          pagesize: this.pagesize
        }
      })
      if (meta.status === 200) {
        this.userList = data.users
        this.total = data.total
        // console.log(this.userList)
      } else {
        this.$message.error(meta.msg)
      }

      // .then(res => {
      //   // console.log(res.data)
      //   const { meta, data } = res
      //   if (meta.status === 200) {
      //     this.userList = data.users
      //     this.total = data.total
      //     console.log(this.userList)
      //   } else {
      //     this.$message.error(meta.msg)
      //   }
      // })
    },
    // 处理每页条数的变化
    handleSizeChange (val) {
      // console.log(`每页 ${val} 条`)
      // 更新每页条数
      this.pagesize = val
      // 修改了每页后，之间的页码就没有了，推荐：从第一页开始展示
      // 重新渲染
      this.getUserList()
    },
    // 处理当前页的变化
    handleCurrentChange (val) {
      // console.log(`当前页: ${val}`)
      // 更新当前页
      this.pagenum = val
      // 重新渲染
      this.getUserList()
    },
    async delUser (id) {
      try {
        await this.$confirm('亲，你确认要删除吗?', {
          type: 'warning'
        })
        // console.log('成功')
        // 发送ajax请求
        const { meta } = await this.$axios.delete(`users/${id}`)
        if (meta.status === 200) {
          this.$message.success(meta.msg)
          // 如果当前只有一条了，删除后，当前页 --
          if (this.userList.length === 1 && this.pagenum > 1) {
            this.pagenum--
          }
          this.getUserList()
        } else {
          this.$message.error(meta.msg)
        }
      } catch (e) {
        console.log(e)
      }
    },
    // 搜索用户
    searchUser () {
      this.pagenum = 1
      this.getUserList()
    },
    async changeState (id, flag) {
      const { meta } = await this.$axios.put(`users/${id}/state/${flag}`)
      if (meta.status === 200) {
        this.$message.success(meta.msg)
      } else {
        this.$message.error(meta.msg)
      }

      // this.$axios.put(`users/${id}/state/${flag}`).then(res => {
      //   console.log(res)
      //   const { meta } = res
      //   if (meta.status === 200) {
      //     this.$message.success(meta.msg)
      //   } else {
      //     this.$message.error(meta.msg)
      //   }
      // })
    },
    showAddDialog () {
      this.dialogVisible = true
    },
    async addUser () {
      // 先校验
      try {
        await this.$refs.form.validate()
        // console.log('成功')
        // 发送ajax请求
        const { meta } = await this.$axios.post('users', this.form)
        if (meta.status === 201) {
          this.$message.success(meta.msg)
          // 关闭对话框
          this.dialogVisible = false
          this.total++
          // 更新当前页成最后一页    总条数/每页多少条，往上取整
          this.pagenum = Math.ceil(this.total / this.pagesize)
          // 重新渲染
          this.getUserList()
        } else {
          this.$message.error(meta.msg)
        }
      } catch (e) {
        console.log(e)
      }
    },
    closeDialog () {
      // console.log('关闭')
      this.$refs.form.resetFields()
    },
    showEditDialog (row) {
      this.editVisible = true
      // console.log(row)
      this.editForm.id = row.id
      this.editForm.username = row.username
      this.editForm.email = row.email
      this.editForm.mobile = row.mobile
    },
    async editUser () {
      try {
        await this.$refs.editForm.validate()
        const { id, email, mobile } = this.editForm
        const { meta } = await this.$axios.put(`users/${id}`, { email, mobile })
        if (meta.status === 200) {
          this.$message.success(meta.msg)
          this.editVisible = false
          this.getUserList()
        } else {
          this.$message.error(meta.msg)
        }
      } catch (e) {
        console.log(e)
      }
    },
    async showAssignDialog (row) {
      // console.log(row)
      this.assignVisible = true
      this.assignForm.id = row.id
      this.assignForm.username = row.username
      // 需要发送ajax请求，获取到角色的id，进行回显
      const resUser = await this.$axios.get(`users/${row.id}`)
      if (resUser.meta.status === 200) {
        const rid = resUser.data.rid
        this.assignForm.rid = rid === -1 ? '' : rid
      }

      // 发送ajax请求，获取到所有的角色
      const { data, meta } = await this.$axios.get('roles')
      if (meta.status === 200) {
        this.options = data
      } else {
        this.$message.error(meta.msg)
      }
    },
    async assignRole () {
      const { id, rid } = this.assignForm
      if (rid === '') {
        this.$message.error('请选择角色')
        return
      }
      // console.log('发送分配的ajax')
      const { meta } = await this.$axios.put(`users/${id}/role`, { rid })
      if (meta.status === 200) {
        this.$message.success(meta.msg)
        this.assignVisible = false
        this.getUserList()
      } else {
        this.$message.error(meta.msg)
      }
    }
  }

}
</script>

<style lang="scss">
  .users {

    .input-with-select {
      width: 300px;
      margin-bottom: 10px;
    }
    .btn {
      margin-left: 20px;
    }
  }
</style>
