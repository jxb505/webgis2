
import store from '../../store/index'
import graphicUtil from '../utils/graphicUtil';
import geometryUtil from '../utils/geometryUtil';
import Draw from 'esri/views/draw/Draw';
import Graphic from "esri/Graphic"
const layerController = store.getters['layerController'];
class DrawTools {
    constructor(options) {
        const view = options.view;
        this.map = options.map;
        this.view = view;
        this.Draw = new Draw({ view });
        this.graphics = [];
        this.droppedGraphics = [];
    }
    get drawTypes() {
        return {
            point: 'point',
            multipoint: 'multipoint',
            polyline: 'polyline',
            polygon: 'polygon',
            mixin: 'rectangle',
            rectangle: 'rectangle',
            circle: 'circle',
            ellipse: 'ellipse',
            text: 'point'
        }
    }
    get geometryType() {
        return {
            point: 'point',
            multipoint: 'multipoint',
            polyline: 'polyline',
            polygon: 'polygon',
            rectangle: 'polygon',
            circle: 'mesh',
            ellipse: 'mesh',
            text: 'point'
        }
    }
    get mode() {
        return {
            hybrid: 'hybrid',
            freehand: 'freehand',
            click: 'click'
        }
    }
    activate(opt) {
        const { type, symbolType, symbolOption, mode, options } = opt;
        if (!this.drawTypes[type] || (mode && !this.mode[mode])) {
            return;
        }
        this.currentType = this.drawTypes[type];
        const drawSymbol = graphicUtil.defaultSymbol[symbolType]
        this.drawBeforeClear = options.drawBeforeClear;
        this.drawSymbol = this.changeDrawSymbol(drawSymbol, symbolOption);
        this.drawAction = this.Draw.create(this.drawTypes[type], mode)
        return this.drawAction
    }
    addActionHandle(action, callback, layerid) {
        if (!Reflect.has(action, 'on')) {
            return;
        }
        let layer;
        if (layerid) {
            layer = layerController.getLayerById(layerid)
            if (!layer) { console.warn(`${layerid} cannot find a matched layer! use map's default graphics to store`) }
        }
        switch (this.currentType) {
            case 'point':
            case 'text':
                action.on('draw-complete', (evt) => {
                    this.drawBreforeClear && this.clearGraphics(layer)
                    const { coordinates } = evt
                    const option = {
                        croods: coordinates,
                        type: this.geometryType[this.currentType],
                        symbol: this.drawSymbol
                    }
                    const graphic = this.drawAndAddGraphic(option, layer)
                    this.graphics.push(graphic)
                    callback(graphic)
                })
                break;
            case 'multipoint':
            case 'polyline':
            case 'polygon':
            case 'rectangle':
            case 'circle':
            case 'ellipse':
                action.on(['vertex-add', 'vertex-remove', 'cursor-update'], (evt) => {
                    this._cache && this.clearGraphic(this._cache)
                    let { vertices } = evt
                    const { type, vertexIndex } = evt

                    if (this.currentType === 'rectangle') {
                        if (!vertexIndex) {
                            return;
                        }
                        const [orient, end] = vertices;
                        vertices = [orient, [end[0], orient[1]], end, [orient[0], end[1]], orient]
                    }

                    const option = {
                        croods: vertices,
                        type: this.geometryType[this.currentType],
                        symbol: this.drawSymbol
                    }
                    this._cache = this.drawAndAddGraphic(option, layer)
                });
                action.on(['draw-complete'], (evt) => {
                    this.drawBreforeClear && this.clearAllGraphics(layer)
                    const { vertices } = evt
                    const option = {
                        croods: vertices,
                        type: this.geometryType[this.currentType],
                        symbol: this.drawSymbol
                    }
                    const graphic = this.drawAndAddGraphic(option, layer)
                    this.graphics.push(graphic)
                    callback(graphic)
                })
                break;
            default:
                console.warn(`unregistered type ${this.currentType}, please check code!`)
                break
        }
    }

    drawAndAddGraphic(option, layer = this.view.graphics) {
        const geometry = geometryUtil.createGeometry(option)
        const { symbol } = option
        const graphic = graphicUtil.createGraphics({ geometry, symbol })

        if (!graphic) return
        this.addGraphic(graphic, layer);
        return graphic
    }
    clearAllGraphics(target = this.view.graphics) {
        target.removeAll()
        this.graphics = [];
        this.droppedGraphics = [];
    }
    addGraphic(graphic, target = this.view.graphics) {
        target.add(graphic)
    }
    clearGraphic(graphic, target = this.view.graphics) {
        target.remove(graphic)
    }
    changeDrawSymbol(symbol, opt) {
        return graphicUtil.changeSymbol(symbol, opt);
    }
    unmakeGraphic(layer) {
        if (this.graphics.length) {
            const graphic = this.graphics.pop();
            this.droppedGraphics.push(graphic)
            this.clearGraphic(graphic, layer)
        }
    }
    restoreGraphic(layer) {
        if (this.droppedGraphics.length) {
            const graphic = this.droppedGraphics.pop();
            this.graphics.push(graphic)
            this.addGraphic(graphic, layer)
        }
    }
    complete() {
        this.Draw.complete();
    }
    stop() {
        this.Draw.reset();
    }
}
DrawTools.drawBeforeClear = true
export default DrawTools
