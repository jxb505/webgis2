// import store from '../store'
import Graphic from 'esri/Graphic'
// const { Graphic } = store.getters['api'];
const defaultSymbol = {
    polygon: {
        type: 'simple-fill',
        color: 'rgba(138, 43, 226, 0)',
        style: 'solid',
        outline: {
            color: '#ff0000',
            width: "1px",//'2PX'
            style: 'solid'
        }
    },
    mixin: {
        type: 'simple-fill',
        color: 'rgba(138, 43, 226, 0)',
        style: 'solid',
        outline: {
            color: '#517ce7',
            width: '2px',
            style: 'solid'
        }
    },
    polyline: {
        type: 'simple-line',
        color: '#517ce7',
        width: '2px',
        style: 'solid'
    },
    point: {
        type: 'simple-marker',
        style: 'circle',
        color: 'blue',
        size: '8px',
        // path: ""
        outline: {
            color: [255, 255, 0],
            width: 3 // points
        }
    },
    picture_polygon: {
        type: 'picture-fill', // autocasts as new PictureFillSymbol()
        url: 'https://static.arcgis.com/images/Symbols/Shapes/BlackStarLargeB.png',
        width: '24px',
        height: '24px',
        outline: {
            style: 'solid',
            color: [255, 255, 0],
            width: 3 // points
        }
    },
    picture_point: {
        type: 'picture-marker', // autocasts as new PictureMarkerSymbol()
        url: 'https://static.arcgis.com/images/Symbols/Shapes/BlackStarLargeB.png',
        width: '64px',
        height: '64px'
    },
    // multipoint : {
    //     type: 'picture-marker', // autocasts as new PictureMarkerSymbol()
    //     url: 'resource/img/locate.png',
    //     width: '64px',
    //     height: '64px'
    // },
    multipoint:{
        type: 'simple-marker',
        style: 'circle',
        color: 'blue',
        size: '8px',
        // path: ""
        outline: {
            color: [255, 255, 0],
            width: 3 // points
        }
    },
    text: {
        type: 'text', // autocasts as new TextSymbol()
        color: [0, 0, 0],
        // haloColor: "black",
        // haloSize: "1px",
        text: 'test',
        // xoffset: 3,
        // yoffset: 3,
        font: { // autocasts as new Font()
            size: 12,
            family: 'sans-serif',
            weight: 'bold'
        }
    }
}
const simpleStyleSet = {
    point: new Set(['circle', 'square', 'cross', 'x', 'diamond', 'triangle', 'path']),
    polyline: new Set(['dash', 'dash-dot', 'dot', 'long-dash', 'long-dash-dot', 'long-dash-dot-dot',
        'none', 'short-dash', 'short-dash-dot', 'short-dash-dot-dot', 'short-dot', 'solid']),
    polygon: new Set(['backward-diagonal', 'cross', 'diagonal-cross', 'forward-diagonal', 'horizontal', 'none', 'solid', 'vertical'])
}
const graphicUtil = {
    defaultSymbol,
    createGraphics(options) {
        const { geometry, type = geometry.type } = options;
        let { symbol = defaultSymbol[type] } = options;
        if (!geometry || !Reflect.has(defaultSymbol, type)) {
            return;
        }
        symbol = {...defaultSymbol[type], ...symbol}
        const graphic = new Graphic(Object.assign(options, { symbol }))
        return graphic
    },
    changeSymbol(symbol, options) {
        const newSymbol = Object.assign(symbol, options);
        //
        return newSymbol;
    }
}
export default graphicUtil
