// import store from '../store'

import store from '../../store/index'
import Geometry from 'esri/geometry/Geometry'
import Extent from 'esri/geometry/Extent'
import Mesh from 'esri/geometry/Mesh'
import Multipoint from 'esri/geometry/Multipoint'
import Point from 'esri/geometry/Point'
import Polygon from 'esri/geometry/Polygon'
import Polyline from 'esri/geometry/Polyline'
const geometryType = new Set([
    'point', 'multipoint', 'polyline', 'polygon', 'extent', 'mesh'
])

const geometryUtil = {
    constructOpt(type, croods) {
        const opt = {}
        switch (type) {
            case 'point':
                if (Array.isArray(croods) && croods.length === 2) {
                    opt.x = croods[0]
                    opt.y = croods[1]
                }
                break;
            case 'multipoint':
                if (Array.isArray(croods)) {
                    opt.points = croods
                }
                break;
            case 'polyline':
                if (Array.isArray(croods)) {
                    opt.paths = croods
                }
                break;
            case 'polygon':
                if (Array.isArray(croods)) {
                    opt.rings = croods
                }
                break;
            case 'rectangle':
            case 'circle':
            case 'ellipse':
                break;
        }
        return opt
    },
    createGeometry(options) {
        // const { Geometry, Extent, Mesh, Multipoint, Point, Polygon, Polyline } = store.getters['api'];
        const _store = store;
        const geometryDic = {
            Geometry, Extent, Mesh, Multipoint, Point, Polygon, Polyline
        }
        const { type, croods, spatialReference = _store.getters['view'].spatialReference } = options;
        if (!geometryType.has(type)) {
            console.error(`unregisted geometry type: ${type}`)
            return;
        }
        const opt = this.constructOpt(type, croods)
        opt.spatialReference = spatialReference;
        const capitalized = type.substr(0, 1).toUpperCase() + type.substr(1, type.length - 1)
        const Clazz = geometryDic[capitalized];
        const geometry = new Clazz(opt)
        return geometry
    },
    changeSymbol(graphic, symbol) {

    }
}
export default geometryUtil
