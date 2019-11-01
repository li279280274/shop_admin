<template>
  <div class="roles">
   <!-- 面包屑 -->
   <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
  </el-breadcrumb>

  <!-- 按钮 -->
  <el-button @click="showAddDialog" class="addRole" type="success" plain>添加角色</el-button>

  <!-- 表格 -->
  <el-table :data="roleList">
    <el-table-column type="expand">
      <!-- row是遍历的每一项，就是一个角色，一个角色有多个一级权限 -->
       <template v-slot:default="{ row }">
         <!-- <el-tag v-for="item in row.children" :key="item.id">{{ item.authName }}</el-tag> -->
          <p v-if="row.children.length === 0">暂无权限</p>
         <!-- 每一个一级权限，都应该是一行 -->
           <el-row class="l1" v-for="l1 in row.children" :key="l1.id">
              <el-col :span="4">
                <el-tag @close="delRight(row, l1.id)" closable>{{ l1.authName }}</el-tag>
                <i class="el-icon-arrow-right"></i>
              </el-col>
              <el-col :span="20">
                  <!-- 每个二级，都应该是一行 -->
                  <el-row class="l2" v-for="l2 in l1.children" :key="l2.id">
                     <el-col :span="4">
                       <el-tag @close="delRight(row, l2.id)" closable type="success">{{ l2.authName }}</el-tag>
                         <i class="el-icon-arrow-right"></i>
                     </el-col>
                     <el-col :span="20">
                       <!-- 每一个三级，自己就是一个 el-tag -->
                       <el-tag @close="delRight(row, l3.id)" class="l3" closable type="warning" v-for="l3 in l2.children" :key="l3.id">{{ l3.authName }}</el-tag>
                     </el-col>
                  </el-row>
              </el-col>

           </el-row>
       </template>
    </el-table-column>
     <el-table-column type="index"></el-table-column>
     <el-table-column label="角色名称" prop="roleName"></el-table-column>
     <el-table-column label="描述" prop="roleDesc"></el-table-column>
     <el-table-column label="操作">
        <template v-slot:default="{ row }">
           <el-button @click="showEditDialog(row)" icon="el-icon-edit" type="primary" plain size="small"></el-button>
            <el-button @click="delRoles(row.id)" icon="el-icon-delete" type="warning" plain size="small"></el-button>
            <el-button @click="showAssignDialog(row)" icon="el-icon-check" type="success" plain size="small">分配权限</el-button>
        </template>
     </el-table-column>
  </el-table>
  <!-- 分配权限对话框 -->
        <el-dialog
        title="分配权限"
        :visible.sync="assignVisible"
        width="40%">

       <el-tree ref="tree" node-key="id" default-expand-all show-checkbox :data="data" :props="defaultProps"></el-tree>

      <template v-slot:footer>
          <span class="dialog-footer">
          <el-button @click="assignVisible = false">取 消</el-button>
          <el-button @click="assignRights" type="primary">分 配</el-button>
        </span>
      </template>
      </el-dialog>

      <!-- 添加和修改的对话框 -->
         <el-dialog
            @close="closeDialog"
            :title="dialogTitle"
            :visible.sync="addVisible"
            width="40%">

             <el-form status-icon :rules="rules" ref="form" :model="form" label-width="80px">
                 <el-form-item label="角色名称" prop="roleName">
                    <el-input placeholder="请输入角色名称" v-model="form.roleName"></el-input>
                 </el-form-item>
                  <el-form-item label="角色描述" prop="roleDesc">
                    <el-input placeholder="请输入角色描述" v-model="form.roleDesc"></el-input>
                 </el-form-item>
             </el-form>

          <template v-slot:footer>
              <span class="dialog-footer">
              <el-button @click="addVisible = false">取 消</el-button>
              <el-button @click="saveRole" type="primary">确  认</el-button>
            </span>
          </template>
      </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      roleList: [],
      assignVisible: false,
      data: [],
      // 暂存正在操作的角色id
      roleId: '',
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      addVisible: false,
      form: {
        // 正要修改的id，也要暂存
        id: '',
        roleName: '',
        roleDesc: ''
      },
      rules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: ['blur', 'change'] }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: ['blur', 'change'] }
        ]
      },
      dialogTitle: '添加角色'
    }
  },
  created () {
    this.getRoleList()
  },
  methods: {
    async getRoleList () {
      const { data, meta } = await this.$axios.get('roles')
      if (meta.status === 200) {
        this.roleList = data
        console.log(this.roleList)
      } else {
        this.$message.error(meta.msg)
      }
    },
    async delRight (row, rightId) {
      // 点击时发送删除的ajax请求
      // console.log(roleId, rightId)
      // data 后台会返回所有该角色的剩余权限
      const { meta, data } = await this.$axios.delete(`roles/${row.id}/rights/${rightId}`)
      if (meta.status === 200) {
        this.$message.success(meta.msg)
        // 重新渲染
        // this.getRoleList()
        // 这里不需要更新整个表格，只要更新当前角色即可，只需要更新row.children
        row.children = data
      } else {
        this.$message.error(meta.msg)
      }
    },
    async showAssignDialog (row) {
      this.roleId = row.id
      this.assignVisible = true
      // 一展开对话框，就发送ajax请求，获取到数据
      const { data, meta } = await this.$axios.get('rights/tree')
      if (meta.status === 200) {
        // 进行数据的展示
        this.data = data

        // 设置选中项，  数据回显
        // this.$refs.tree.setCheckedKeys([101])
        // 获取到所有的三级权限的 id 用于设置
        const ids = []
        row.children.forEach(l1 => {
          // 拿到所有的一级
          l1.children.forEach(l2 => {
            // 拿到所有的二级
            l2.children.forEach(l3 => {
              // 拿到所有的思三级的 id
              ids.push(l3.id)
            })
          })
        })
        this.$refs.tree.setCheckedKeys(ids)
      } else {
        this.$$message.error(meta.msg)
      }
    },
    async assignRights () {
      // 点击分配按钮，获取到所有选中的权限，发送ajax 全选和半选都需要
      const ids = this.$refs.tree.getCheckedKeys()
      const halfs = this.$refs.tree.getHalfCheckedKeys()
      const rids = [...ids, ...halfs].join(',')
      // 发送ajax
      const { meta } = await this.$axios.post(`roles/${this.roleId}/rights`, { rids })
      if (meta.status === 200) {
        this.assignVisible = false
        this.$message.success(meta.msg)
        // 重新渲染
        this.getRoleList()
      } else {
        this.$message.error(meta.msg)
      }
    },
    async delRoles (id) {
      try {
        await this.$confirm('亲,你确认要删除吗?', '温馨提示', {
          type: 'warning'
        })
        // 发送删除的ajajx请求
        // 结构一下res
        const { meta } = await this.$axios.delete(`roles/${id}`)
        if (meta.status === 200) {
          this.$message.success(meta.msg)
          this.getRoleList()
        } else {
          this.$message.error(meta.msg)
        }
      } catch (e) {
        console.log(e)
      }
    },
    showAddDialog () {
      this.addVisible = true
      this.dialogTitle = '添加角色'
    },
    showEditDialog (row) {
      this.addVisible = true
      this.dialogTitle = '修改角色'
      // console.log(row)
      // this.$nextTick  可以让函数，在下一次dom更新完成之后执行
      this.$nextTick(() => {
        this.form.id = row.id
        this.form.roleName = row.roleName
        this.form.roleDesc = row.roleDesc
      })
    },
    closeDialog () {
      // 重置内容和状态
      this.$refs.form.resetFields()
    },
    async saveRole () {
      const isAdd = this.dialogTitle === '添加角色'
      // 添加和修改不一样的地方，请求方式，请求参数
      const url = isAdd ? 'roles' : `roles/${this.form.id}`
      const method = isAdd ? 'post' : 'put'
      const { meta } = await this.$axios[method](url, this.form)
      if (meta.status === 200 || meta.status === 201) {
        this.$message.success('操作成功')
        this.getRoleList()
        this.addVisible = false
      } else {
        this.$message.error(meta.msg)
      }
    }

  }
}
</script>

<style lang="scss">
  .roles {
    .addRole {
      margin-bottom: 10px;
    }
    .l1 {
      padding: 10px 0;
      border-bottom: 1px dotted #ccc;
    &:last-child {
      border-bottom: none;
     }
    }
    .l2 {
      margin-bottom: 10px;
    }
    .l3 {
      margin-right: 5px;
      margin-bottom: 5px;
    }
  }
</style>
