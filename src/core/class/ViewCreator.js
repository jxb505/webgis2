
import Map from 'esri/Map';
class MapCreator {
    constructor(options) {
        const { viewType } = options;
        let promise;
        if (viewType !== 'SceneView') {
            promise = import('esri/views/MapView').then(module => {
                const MapView = module.default;
                return new MapView({ ...options });
            });
        } else {
            promise = import('esri/views/SceneView').then(module => {
                const SceneView = module.default;
                return new SceneView({ ...options });
            });
        }
        return promise
    }
    createMap(options) {
        return new Map(options)
    }
}
export default MapCreator
