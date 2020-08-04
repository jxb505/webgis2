// 应用内通信
// 监听
// this.$eventBus.$on('cmd',()=>{});
// 发布
// this.$eventBus.$emit('cmd',[...args]);

// 应用间通信
/*
 * 监听消息
 * this.$interface.$on('interface-locationMap',()=>{})
 * 发送消息
 * this.$interface.$dispatch('interface-openBDCdialog', {});
 * @params :传递的参数结构
 * for ex.
    {
        cmd: 'locationMap',
        params: {
            coordinate:[30.26732,22.36782]
        }
     }
 */

const install = function(Vue, opts = {}) {
    Vue.prototype.$interface = new Vue();

    // 监听父页面的信息
    window.addEventListener('message', function(event) {
        var data = event.data;
        if (!data.cmd) {
            return
        }
        console.log(`接收事件:${data.cmd}-----来源：${event.origin}`);
        Vue.prototype.$interface.$emit(data.cmd, data.params);
    });

    // 向父页面发送信息
    Vue.prototype.$interface.$dispatch = function(cmd, params) {
        window.parent && window.parent.postMessage({
            cmd,
            params
        }, '*');
    }
}
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}
export default {
    install
}
