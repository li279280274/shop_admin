<template>
  <div class="goods-add">
      <!-- 步骤条 -->
       <el-steps :active="active" finish-status="success">
          <el-step title="步骤 1" description="基本信息"></el-step>
          <el-step title="步骤 2" description="商品图片"></el-step>
          <el-step title="步骤 3" description="商品内容"></el-step>
        </el-steps>

        <!-- tab栏 -->
         <el-tabs v-model="activeTab" tab-position="left" @tab-click="handleClick">
            <el-tab-pane name="0" label="基本信息">
                <el-form ref="form" :model="form" label-width="80px">
                   <el-form-item label="商品名称">
                     <el-input v-model="form.goods_name" placeholder="请输入商品名称"></el-input>
                   </el-form-item>
                   <el-form-item label="商品价格">
                     <el-input v-model="form.goods_price" placeholder="请输入商品价格"></el-input>
                   </el-form-item>
                   <el-form-item label="商品重量">
                     <el-input v-model="form.goods_weight" placeholder="请输入商品重量"></el-input>
                   </el-form-item>
                   <el-form-item label="商品数量">
                     <el-input v-model="form.goods_number" placeholder="请输入商品数量"></el-input>
                   </el-form-item>
                   <el-form-item label="商品分类">
                  <el-cascader
                      :props="props"
                      v-model="form.goods_cat"
                      :options="options">
                  </el-cascader>
                   </el-form-item>
                </el-form>
                <el-button type="primary" @click="goNext">下一步</el-button>
            </el-tab-pane>
            <el-tab-pane name="1" label="商品图片">
              <!--
                action 提交图片的服务器地址，灭有走axios需要补全
                headers: 可以设置请求头
               -->
              <el-upload
                name="file"
                multiple
                :headers="headers"
                action="http://localhost:8888/api/private/v1/upload"
                :on-success="handleSuccess"
                :on-preview="handlePictureCardPreview"
                :on-remove="handleRemove"
                list-type="picture-card">
                <i class="el-icon-plus"></i>
              </el-upload>
                 <el-button class="btn" type="primary" @click="goNext">下一步</el-button>
            </el-tab-pane>
            <el-tab-pane name="2" label="商品内容">
              <quill-editor v-model="form.goods_introduce"></quill-editor>
              <el-button @click="addGood" type="primary">添加</el-button>
            </el-tab-pane>
          </el-tabs>

          <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt="">
          </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      active: 0,
      activeTab: '0',
      form: {
        goods_name: '',
        goods_cat: [], // 商品的分类, 将来是给级联绑定的
        goods_price: '',
        goods_number: '',
        goods_weight: '',
        goods_introduce: '',
        pics: [] //  图片数组，存储着上传的图片的对象
      },
      options: [],
      props: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      headers: {
        Authorization: localStorage.getItem('token')
      },
      dialogVisible: false,
      dialogImageUrl: ''
    }
  },
  async created () {
    const { data, meta } = await this.$axios.get('categories?type=3')
    if (meta.status === 200) {
      this.options = data
    } else {
      this.$message.error(meta.msg)
    }
  },
  methods: {
    handleClick (tab, event) {
      // console.log(tab, event)
      this.active = +tab.index
    },
    goNext () {
      // 控制步骤条
      this.active++
      this.activeTab = this.active + ''
    },
    // 上传图片
    handleSuccess (response, file, fileList) {
      // console.log(response)
      const { data, meta } = response
      if (meta.status === 200) {
        this.form.pics.push({
          pic: data.tmp_path

        })
        console.log(this.form.pics)
      } else {
        this.$message.error(meta.msg)
      }
    },
    // 删除图片
    handleRemove (file, fileList) {
      // console.log(file)
      // 获取到路径，根据路径从this.form.pics中移除对应的路径图片（保留不是该路径的）
      const path = file.response.data.tmp_path
      this.form.pics = this.form.pics.filter(item => item.pic !== path)
    },
    // 预览图片
    handlePictureCardPreview (file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    async addGood () {
      const { meta } = await this.$axios.post('goods', {
        ...this.form,
        goods_cat: this.form.goods_cat.join(',')
      })
      if (meta.status === 201) {
        this.$message.success(meta.msg)
        this.$router.push('/goods')
      } else {
        this.$message.error(meta.msg)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// 只要添加了scoped， 样式只会作用于当前模板中的内容，不会往下渗透到子组件中
 .goods-add {
   .btn {
     margin-top: 20%;
   }
 }
</style>
<style lang="scss">
  .ql-editor {
    min-height: 300px;
    background-color: pink;
  }
</style>
