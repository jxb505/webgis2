<template>
  <section>
    <div class="list">
      <div
        v-for="(item,idx) in this.tasklist"
        :key="idx"
        :class="{'btn':true,'currentbtn':item&&item.title==currentTask.title}"
        @click="showtaskpanel(item)"
      >
        <div class="btntxt">{{ item&&item.title }}</div>
        <div class="close" @click.stop="closecurrentTask(item)">
          <i class="el-icon-close" />
        </div>
      </div>
    </div>
    <section v-if="rpflag" class="resultpanel">
      <div class="head">
        <div class="label">{{ currentTask.title }}</div>
        <div class="line" />
      </div>
      <div class="body">
        <component :is="currentTask.component" :options="options" />
      </div>
    </section>
  </section>
</template>
<script>
// import Item from './Item';
export default {
    name: 'Taskbar',
    // components: { Item },
    data() {
        return {
            tasklist: [],
            currentTask: {},
            rpflag: false,
            com: '',
            options: []
        };
    },
    computed: {},
    watch: {
        //all task list
        '$store.state.app.tasklist'(ele) {
            this.tasklist = ele;
        },
        //get currentTask
        '$store.state.app.currentTask'(ele) {
            if (ele) {
                this.currentTask = this.tasklist.find((e) => { return e.title == ele });
            } else {
                this.currentTask = {};
                this.rpflag = false;
            }
        }
    },
    methods: {
        showtaskpanel(ele) {
            this.currentTask = ele;
            this.rpflag = true;
        },
        //close and delete
        closecurrentTask(ele){
            this.currentTask = {};
            this.rpflag = false;
            this.$store.dispatch('app/currentTask', null);
            this.tasklist.splice(this.tasklist.findIndex(item => item.title === ele.title), 1)
            this.$store.dispatch('app/tasklist', this.tasklist);
        }
    }
};
</script>

<style lang='scss' scoped>
@import '~@/styles/variables.scss';
$default-width: 300px;
$default-height: 42px;
.btn {
  width: 42px;
  height: 120px;
  background: $menuBg;
  box-shadow: 0px 0px 1px 0px #ccc;
  padding-top: 5px;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: space-around;
}
.btntxt {
  color: #fff;
  font-size: 14px;
  width: 14px;
}
.close {
  color: #fff;
  cursor: pointer;
}
.currentbtn {
  background: $menuActive;
}
.resultpanel {
  position: fixed;
  top: 100px;
  border-radius: 2px;
  right: 53px;
  width: auto;
  bottom: 7px;
  background: white;
  box-shadow: 0px 0px 1px 0px rgba(0, 8, 14, 0.14);
  .head {
    width: $default-width;
    height: $default-height;
    .label {
      width: $default-width - 20px;
      height: $default-height;
      margin: 0 10px;
      line-height: $default-height;
      text-align: center;
      letter-spacing: 1px;
    }
    .line {
      height: 1px;
      border-top: 1px solid #ccc;
      margin: 0 10px;
    }
  }
  .body {
    position: absolute;
    top: 42px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    overflow: auto;
  }
}
</style>
