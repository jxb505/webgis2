<template>
    <section class="serviceTree">
        <div class="head">
            <div class="drop" @click="showTreeflag=!showTreeflag">
                <i
                    :class="{'el-icon-caret-bottom':!showTreeflag,'el-icon-caret-top':showTreeflag}"
                />
            </div>
            <div class="icon">
                <i class="el-icon-s-marketing" />
            </div>
            <div class="label">{{ title }}</div>
            <input type="checkbox" class="checkbox" />
        </div>
        <div v-if="showTreeflag" class="body">
            <el-tree :data="treeData" class="tree" node-key="id" :props="defaultProps">
                <span slot-scope="{ node,data }" class="custom-tree-node">
                    <serviceControl :node="node" :data="data" />
                </span>
            </el-tree>
        </div>
    </section>
</template>

<script>
import serviceControl from '../serviceControl/index.vue';
export default {
    name: 'ServiceTree',
    components: {
        serviceControl,
    },
    props: {
        title: {
            type: String,
            default: () => '默认数据',
        },
        treeData: {
            type: Array,
            default: () => [
                {
                    label: '一级 1',
                    children: [
                        {
                            label: '二级 1-1',
                        },
                        {
                            label: '二级 1-2',
                        },
                        {
                            label: '二级 1-3',
                        },
                    ],
                },
            ],
        },
    },

    data() {
        return {
            showTreeflag: false,
            defaultProps: {
                label: 'label',
                children: 'children',
            },
        };
    },
    methods: {},
    mounted() {
        let treeData = this.treeData;
        const sethasCheckedFunc = node => {
            if (node) {
                node.hasChecked = false;
                if (node.children) {
                    node.children.forEach(child => {
                        sethasCheckedFunc(child);
                    });
                    // sethasCheckedFunc();
                }
            }
        };
        treeData.forEach(element => {
            sethasCheckedFunc(element);
        });
    },
};
</script>

<style lang="scss" scoped>
$default-height: 42px;
.serviceTree {
    margin: 0 10px;
    .head {
        height: $default-height;
        border-bottom: 1px solid #ccc;
        .drop {
            float: left;
            margin-top: 12px;
            margin-left: 0px;
            color: #666;
            cursor: pointer;
        }
        .icon {
            float: left;
            margin-top: 12px;
            margin-left: 2px;
            color: #517ce7;
        }
        .label {
            float: left;
            margin-top: 13px;
            margin-left: 3px;
            font-size: 14px;
            color: #000;
        }
        .checkbox {
            float: right;
            margin-top: 14px;
            margin-right: 0px;
        }
    }
    .body {
        font-size: 14px;
        color: #000;
        .tree {
            margin: 0px -7px 0px 13px;
        }
        .custom-tree-node {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 14px;
            padding-right: 8px;
        }
    }
}
</style>
