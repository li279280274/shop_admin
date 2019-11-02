<template>
  <div class="categories">
   <el-button @click="showAddDialog" class="addBtn" type="success" plain>添加分类</el-button>
   <!-- 表格 -->
   <el-table
    v-loading="isLoading"
    row-key="cat_id"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255, 255, 255, 0.8)"
    :data="categoryList">
      <el-table-column label="商品名称" prop="cat_name"></el-table-column>
      <el-table-column label="是否有效">
        <template v-slot:default="{ row }">
           <span>{{ row.cat_deleted ? '否' : '是'}}</span>
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="cat_level"></el-table-column>
      <el-table-column label="操作">
        <template v-slot:default="{ row }">
            <el-button size="small" icon="el-icon-edit" type="primary" plain></el-button>
             <el-button size="small" icon="el-icon-delete" type="danger" plain></el-button>
        </template>
      </el-table-column>
   </el-table>

   <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagenum"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
  <!-- 对话框 -->
      <el-dialog
        @close="closeDialog"
          title="添加分类"
          :visible.sync="dialogVisible"
          width="40%">
         <!-- 表单 -->
          <el-form :rules="rules"
             ref="form" :model="form" label-width="80px">
             <el-form-item label="分类名称" prop="cat_name">
             <el-input v-model="form.cat_name" placeholder="请输入分类名称"></el-input>
             </el-form-item>

             <!-- 这个prop不是用于校验的，只是用于重置的  -->
             <el-form-item label="父级名称" prop="cat_pid">
                    <el-cascader

                      clearable
                      :props="props"
                      v-model="form.cat_pid"
                      :options="options">
                      </el-cascader>
             </el-form-item>
          </el-form>

          <template v-slot:footer>
            <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button @click="addCategory" type="primary">确 定</el-button>
            </span>
          </template>
    </el-dialog>
  </div>

</template>

<script>
export default {
  data () {
    return {
      pagenum: 1, // 当前页
      pagesize: 5, // 每页多少条
      categoryList: [],
      total: 0,
      isLoading: false,
      dialogVisible: false,
      form: {
        cat_name: '', // 分类名称
        cat_pid: [], // 分类父级的id
        cat_level: ''// 添加的分类的层级
      },
      rules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: ['blur', 'change'] }
        ]
      },
      options: [],
      props: {
        checkStrictly: true,
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      }
    }
  },
  created () {
    this.getCategoryList()
  },
  methods: {
    async getCategoryList () {
      // 发送商品列表ajax请求

      this.isLoading = true
      const { data, meta } = await this.$axios.get('categories', {
        params: {
          type: 3,
          pagenum: this.pagenum,
          pagesize: this.pagesize
        }
      })
      if (meta.status === 200) {
        this.categoryList = data.result
        this.total = data.total
        // console.log(this.categoryList)
        // console.log(this.total)
      } else {
        this.$message.error(meta.msg)
      }
      this.isLoading = false
    },
    handleSizeChange (val) {
      // console.log(`每页 ${val} 条`)
      this.pagesize = val
      this.pagenum = 1
      this.getCategoryList()
    },
    handleCurrentChange (val) {
      // console.log(`当前页: ${val}`)
      this.pagenum = val
      this.getCategoryList()
    },
    async showAddDialog () {
      this.dialogVisible = true
      // 发送ajax获取二级的分类
      const { data, meta } = await this.$axios.get('categories?type=2')
      if (meta.status === 200) {
        this.options = data
        console.log(this.options)
      } else {
        this.$message.error(meta.msg)
      }
    },
    async addCategory () {
      try {
        // 先校验在发送ajax请求
        await this.$refs.form.validate()
        // 只要能够到这里，说明校验成功，发送ajax请求
        const { meta } = await this.$axios.post('categories', {
          // 所谓的父级，就是拿到cat_pid 数组的最后一项 0 表示没有内容
          cat_pid: this.form.cat_pid[this.form.cat_pid.length - 1] || 0,
          cat_name: this.form.cat_name,
          cat_level: this.form.cat_pid.length
        })
        if (meta.status === 201) {
          this.$message.success(meta.msg)
          this.dialogVisible = false
          this.getCategoryList()
        } else {
          this.$message.error(meta.msg)
        }
      } catch (e) {
        console.log(e)
      }
    },
    closeDialog () {
      this.$refs.form.resetFields()
    }
  }

}
</script>

<style lang="scss" scoped>
 .categories {
   .addBtn {
     margin-bottom: 10px;
   }
 }
</style>
