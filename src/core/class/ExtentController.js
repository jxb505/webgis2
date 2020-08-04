import ViewPoint from 'esri/Viewpoint'
class ExtentContorller {
    constructor({ map, view }) {
        this.map = map;
        this.view = view;
    }
    
    goTo(options, callback) {
        const { _options } = options;
        let { target } = options;
        if (!_.isArray(target)) {
            if (target.type === 'point') {
                const idealScale = _options.scale || 10000;
                target = new ViewPoint({
                    targetGeometry: target,
                    scale: idealScale
                })
            }
        }
        this.view.goTo(target, _options).then(() => {
            if (_.isFunction(callback)) {
                callback();
            }
        })
    }
}
export default ExtentContorller
