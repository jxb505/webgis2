//基于arcgis api的通用几何计算类，目标完成根据输入的Geometry options计算要素
import GeometryEngine from "esri/geometry/geometryEngine";
/**
 * 计算几何面积，长度方法
 * @param {*} geo 
 * @param {*} options 
 * {
 *      unit:'',
 *      unitlabel:'',
 *      accuracy:''
 * }
 */
let doMeasure = function (geo, options) {
    let value = '';
    switch (geo.type) {
        case 'polygon':
            value = GeometryEngine.planarArea(geo, options && options.unit || 'hectares');
            value = doAccuracy(value, options && options.accuracy || 2)+"公顷";
            break;
        case 'polyline':
            value = GeometryEngine.planarLength(geo, options && options.unit || 'kilometers');
            value = doAccuracy(value, options && options.accuracy || 2)+"公里";
            break;
        case 'multipoint':
            value = geo.points.length;
            value = value+"个";
            break;
        default:
            break;
    }
    return value;
};
let doAccuracy = function (value, accuracy) {
    value = Math.abs(value);
    return Math.ceil(value * Math.pow(10, accuracy)) / Math.pow(10, accuracy);
};
export default doMeasure;