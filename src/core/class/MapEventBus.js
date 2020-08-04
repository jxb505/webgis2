
class mapEventBus {
    constructor(options) {
        this.map = options.map;
        this.view = options.view;
        this.eventMap = new Map();
    }

    /**
     *
     *
     * @param {String,String[]} name []
     * @param {*} callback
     * @returns
     * @memberof mapEventBus
     */
    bindEvent(name, callback) {
        const handler = this.view.on(name, callback)
        if (this.eventMap.has(name)) {
            this.eventMap.get(name).add(handler)
        } else {
            this.eventMap.set(name, new Set([handler]));
        }
        return handler
    }
    unbind(name, handler) {
        if (!handler || !name) {
            return;
        }
        if (this.eventMap.has(name)) {
            this.eventMap.get(name).delete(handler)
            handler.remove();
        }
    }
    removeAllBind(name) {
        if (this.eventMap.has(name)) {
            const set = this.eventMap.get(name);
          
            set.forEach(item => item.remove())
            set.clear()
        }
    }
}
export default mapEventBus
