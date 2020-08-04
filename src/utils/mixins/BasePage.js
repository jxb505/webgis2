export default {
    data() {
        return {
            map: null
        }
    },
    methods: {
        // 地图加载完成的状态
        waitMapInitCompleted() {
            const self = this;
            return new Promise(resolve => {
                const timeIndex = setInterval(x => {
                    if (self.$store.getters.map) {
                        window.clearInterval(timeIndex);
                        self.map = self.$store.getters.map;
                        resolve(true);
                    }
                }, 100)
            })
        },
        // 设置地图偏移
        setMapOffSet() {
            const box = this.$el.getBoundingClientRect();
            this.$eventBus.$emit('mapContrainer/setOffSet', box);
        }
    },
    watch: {}
}
