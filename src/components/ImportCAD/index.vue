<template>
    <section class="importCAD">
        <el-upload
            class="upload"
            drag
            action="https://jsonplaceholder.typicode.com/posts/"
            multiple
        >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
                将CAD文件拖到此处，或
                <em>点击上传</em>
            </div>
            <!-- <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div> -->
        </el-upload>
    </section>
</template>

<script>
export default {
    name: 'ImportCAD',
};
</script>

<style lang="scss" scoped>
.importCAD {
    .upload {
        width: 300px;
        margin: 10px auto;
        >>> .el-upload-dragger {
            width: 300px;
            border-style: solid;
            box-shadow: 0px 0px 1px 0px #d9d9d9;
        }
        >>> .el-upload-list {
            margin: 0;
            padding: 0;
            list-style: none;
            height: 200px;
            overflow-y: auto;
        }
        >>> .el-upload-list__item{
            margin: 10px 0;
        }
    }
}
</style>