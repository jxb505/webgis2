<template>
  <section>
    <catalogue-panel ref="cataloguePanel" :metaconfig="metaconfig">
      <template v-slot:leftSlot>
        <!-- 左侧面板 内容 -->
        <div class="left_demo">
          <el-button type="primary" @click="change_bottompanel">展开下方面板</el-button>
          <el-button type="primary" @click="change_rightpanel">展开右侧面板</el-button>
        </div>
      </template>

      <template v-slot:bottomSlot>
        <!-- 下侧面板 内容-->
        <div class="bottom_demo">
          <el-table :data="tableData" border style="width: 100%">
            <el-table-column fixed prop="date" label="日期" width="150" />
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column prop="province" label="省份" width="120" />
            <el-table-column prop="city" label="市区" width="120" />
            <el-table-column prop="address" label="地址" width="300" />
            <el-table-column prop="zip" label="邮编" width="120" />
            <el-table-column fixed="right" label="操作" width="100">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="handleClick(scope.row)">查看</el-button>
                <el-button type="text" size="small">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </template>

      <template v-slot:rightSlot>
        <!-- 右侧面板 内容-->
        <div class="right_demo">
          <result />
        </div>
      </template>
    </catalogue-panel>
  </section>
</template>
<script>
import Result from '@/views/Demo/result';
export default {
    components: { Result },
    data() {
        return {
            bp_flag: false,
            rp_flag: false,
            metaconfig: {},
            tableData: [
                {
                    date: '2016-05-02',
                    name: '王小虎',
                    province: '上海',
                    city: '普陀区',
                    address: '上海市普陀区金沙江路 1518 弄',
                    zip: 200333
                }, {
                    date: '2016-05-04',
                    name: '王小虎',
                    province: '上海',
                    city: '普陀区',
                    address: '上海市普陀区金沙江路 1517 弄',
                    zip: 200333
                }, {
                    date: '2016-05-01',
                    name: '王小虎',
                    province: '上海',
                    city: '普陀区',
                    address: '上海市普陀区金沙江路 1519 弄',
                    zip: 200333
                }, {
                    date: '2016-05-03',
                    name: '王小虎',
                    province: '上海',
                    city: '普陀区',
                    address: '上海市普陀区金沙江路 1516 弄',
                    zip: 200333
                }]

        }
    },
    mounted() {
        this.config = this.$route.meta.config;// 获取模块配置
        this.metaconfig = { ...this.$route.meta };// 获取模块元信息
    },
    beforeDestroy() {

    },
    methods: {
        handleClick(row) {
            console.log(row);
        }
    },
    methods: {
        change_bottompanel() {
            this.bp_flag ? this.$refs.cataloguePanel.hidepanel('bottom') : this.$refs.cataloguePanel.showpanel('bottom');
            this.bp_flag = !this.bp_flag;
        },
        change_rightpanel() {
            if (this.rp_flag) {
                this.$refs.cataloguePanel.hidepanel('right');
            } else {
                this.$refs.cataloguePanel.showpanel('right');
                const { icon, title } = this.metaconfig;
                this.$refs.cataloguePanel.saveResultpanel(Result, 'data', { icon, title });
            }
            this.rp_flag = !this.rp_flag;
        }
    }
};
</script>
 <style lang="scss" scoped>
.left_demo {
  width: 300px;
  height: 100%;
  padding: 20px;
}
.bottom_demo {
  height: 235px;
}
.right_demo {
  width: 200px;
  height: 100%;
}
</style>
