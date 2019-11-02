<template>
  <div class="goods">
   <el-button @click="goAdd" class="goodBtn" type="success" plain>添加商品</el-button>

   <!-- 表格 -->
    <el-table :data="goodList">
      <el-table-column :index="indexMethod" type="index"></el-table-column>
      <el-table-column label="商品名称" prop="goods_name"></el-table-column>
      <el-table-column label="商品价格" prop="goods_price"></el-table-column>
      <el-table-column label="商品重量" prop="goods_weight"></el-table-column>
      <el-table-column label="创建时间">
        <template v-slot:default="{ row }">
           {{ row.add_time | time }}
        </template>
      </el-table-column>
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
  </div>
</template>

<script>
export default {
  data () {
    return {
      pagenum: 1,
      pagesize: 5,
      goodList: [],
      total: 0
    }
  },
  created () {
    this.getGoodList()
  },
  methods: {
    async getGoodList () {
      // 发送ajax请求
      const { data, meta } = await this.$axios.get('goods', {
        params: {
          pagenum: this.pagenum,
          pagesize: this.pagesize
        }
      })
      if (meta.status === 200) {
        this.goodList = data.goods
        this.total = data.total
        // console.log(this.goodList)
        // console.log(this.total)
      } else {
        this.$message.error(meta.msg)
      }
    },
    handleSizeChange (val) {
      // console.log(`每页 ${val} 条`)
      this.pagesize = val
      this.pagenum = 1
      this.getGoodList()
    },
    handleCurrentChange (val) {
      // console.log(`当前页: ${val}`)
      this.pagenum = val
      this.getGoodList()
    },
    indexMethod (index) {
      return index + 1 + (this.pagenum - 1) * this.pagesize
    },
    goAdd () {
      this.$router.push('goods-add')
    }
  }
}
</script>

<style lang="scss" scoped>
// scoped  可以让组件的样式互不影响
.goods {
  .goodBtn {
    margin-bottom: 10px;
  }
}
</style>
