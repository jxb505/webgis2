<template>
    <el-button
            class="open-btn"
            icon="el-icon-s-management"
            @click="book()"
        >
        书签
        </el-button>
</template>
<script>
import BookmarksViewModel from "esri/widgets/Bookmarks/BookmarksViewModel"
export default {
    name: 'Measurements',
    data() {
        return {}
    },
    mounted(){
    },
    methods: {
        book(){
            var viewModel;
            var BookmarksViewModel;
            viewModel.createBookmark().then(function(bookmark){
            // Give the bookmark a name
            bookmark.name = "New Bookmark";
            // Add to bookmarks list
            viewModel.bookmarks.add(bookmark);
            });
        }
    }
}
</script>
<style lang="scss" scoped>
.open-btn{
    height: 30px;
    /* line-height: 30px; */
    vertical-align: middle;
    margin-right: 20px;
}
</style>
