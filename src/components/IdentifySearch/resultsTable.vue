<template>
    <div class="container">
        <div class="table-title">
            <span>相关表中的属性</span>
        </div>
        <el-table :data="tableData" class="tbale" height="200">
            <el-table-column
                v-for="(item,idx) in tableCols"
                :key="idx"
                v-bind="item"
            />
        </el-table>
    </div>
</template>
<script>
export default {
    name: 'ResultsTable',
    props: {
        tableData: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            tableCols: [{
                prop: 'key',
                label: '属性',
                width: '120px'
            }, {
                prop: 'value',
                label: '值',
                width: '180px'
            }]
        };
    },
    computed: {
        mapEventBus() {
            return this.$store.getters.mapEventBus;
        }
    },
    watch: {
        show: function(newval) {
            this.toggleTooltip(newval);
        }
    },
    methods: {
    }
};
</script>
<style lang="scss" scoped>
$width: 300px;
.container{
    .table-title{
        font-weight: bold;
        text-align: left;
        text-indent: 10px;
    }
    .tbale{
        width: 100%;
        >>>.el-table__header{
            width: 100% !important;
        };
    }
}
</style>
