import Map from 'esri/Map';
// import Basemap from 'esri/Basemap';
// import Ground from 'esri/Ground';
class MapCreator {
    constructor(options) {
        const { baseLayers, groundLayers, layers } = options;
        let basemap, ground;
        const promiseArr = [];
        if (baseLayers) {
            basemap = import('esri/Basemap').then(module => {
                const Basemap = module.default;
                return new Basemap({ baseLayers });
            });
        } else {
            basemap = new Promise((reslove, reject) => {
                reslove(null)
            })
        }
        promiseArr.push(basemap);
        if (groundLayers) {
            ground = import('esri/Ground').then(module => {
                const Ground = module.default;
                return new Ground({ layers });
            });
        } else {
            ground = new Promise((reslove, reject) => {
                reslove(null)
            })
        }
        promiseArr.push(ground);
        return Promise.all(promiseArr).then((basemap, ground) => {
            return this.createMap({ layers, basemap, ground })
        })
    }
    createMap(options) {
        return new Map(options)
    }
}
export default MapCreator