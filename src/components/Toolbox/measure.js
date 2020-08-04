import Draw from 'esri/views/draw/Draw';
import Graphic from 'esri/Graphic';
import geometryEngine from 'esri/geometry/geometryEngine';
import GraphicsLayer from 'esri/layers/GraphicsLayer';
// const { Draw, Graphic, geometryEngine, GraphicsLayer }
let view = null;
const distanceArr = [];
const distancemeasure = function distancemeasure(v) {
    1
    var draw = new Draw({ view: v });
    view = v;
    var action = draw.create('polyline', { mode: 'click' });
    // 开启监听
    action.on(['vertex-add', 'vertex-remove', 'cursor-update', 'redo', 'undo', 'draw-complete'], updateVertices);
}
function updateVertices(event) {
    if (event.vertices.length > 1) {
        const result = createGraphic(event);
        if (result.selfIntersects) {
            event.preventDefault();
        }
    }
}
function createGraphic(event) {
    const vertices = event.vertices;
    view.graphics.removeAll();

    // a graphic representing the polyline that is being drawn
    const graphic = new Graphic({
        geometry: {
            type: 'polyline',
            paths: vertices,
            spatialReference: view.spatialReference
        },
        symbol: {
            type: 'simple-line', // autocasts as new SimpleFillSymbol
            color: [4, 90, 141],
            width: 4,
            cap: 'round',
            join: 'round'
        }
    });
    // check if the polyline intersects itself.
    const intersectingSegment = getIntersectingSegment(graphic.geometry);
    if (event.type === 'vertex-add') {
        var lineLength = geometryEngine.geodesicLength(graphic.geometry, 'miles');
        distanceArr.push(lineLength);
        createMarkGraphic(graphic.geometry);
    }
    // Add a new graphic for the intersecting segment.
    if (intersectingSegment) {
        view.graphics.addMany([graphic, intersectingSegment]);
    } else {
        // Just add the graphic representing the polyline if no intersection
        view.graphics.add(graphic);
    }

    // return intersectingSegment
    return {
        selfIntersects: intersectingSegment
    };
}
// 创建标记
function createMarkGraphic(polyline) {
    let path_idx, point_idx;
    const point = polyline.getPoint(path_idx, point_idx);
    const graphic = new Graphic({
        geometry: point,
        symbol: {
            type: 'text', // autocasts as new TextSymbol()
            color: 'white',
            haloColor: 'black',
            haloSize: '1px',
            text: distanceArr[point_idx],
            xoffset: 3,
            yoffset: 3,
            font: { // autocast as new Font()
                size: 12,
                family: 'sans-serif',
                weight: 'bold'
            }
        }
    })
    view.graphics.add(graphic);
}
function isSelfIntersecting(polyline) {
    if (polyline.paths[0].length < 3) {
        return false;
    }
    const line = polyline.clone();

    // get the last segment from the polyline that is being drawn
    const lastSegment = getLastSegment(polyline);
    line.removePoint(0, line.paths[0].length - 1);

    // returns true if the line intersects itself, false otherwise
    return geometryEngine.crosses(lastSegment, line);
}

// Checks if the line intersects itself. If yes, change the last
// segment's symbol giving a visual feedback to the user.
function getIntersectingSegment(polyline) {
    if (isSelfIntersecting(polyline)) {
        return new Graphic({
            geometry: getLastSegment(polyline),
            symbol: {
                type: 'simple-line', // autocasts as new SimpleLineSymbol
                style: 'short-dot',
                width: 3.5,
                color: 'yellow'
            }
        });
    }
    return null;
}

// Get the last segment of the polyline that is being drawn
function getLastSegment(polyline) {
    const line = polyline.clone();
    const lastXYPoint = line.removePoint(0, line.paths[0].length - 1);
    const existingLineFinalPoint = line.getPoint(
        0,
        line.paths[0].length - 1
    );

    return {
        type: 'polyline',
        spatialReference: view.spatialReference,
        hasZ: false,
        paths: [
            [
                [existingLineFinalPoint.x, existingLineFinalPoint.y],
                [lastXYPoint.x, lastXYPoint.y]
            ]
        ]
    };
}
export default {
    distancemeasure: distancemeasure
}
