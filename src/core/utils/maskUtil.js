import geometryEngine from "esri/geometry/geometryEngine"
import Graphic from 'esri/Graphic'
const maskUtil = {
    addMask(graphiclayer, geo1, geo2) {
        let diffgeo = geometryEngine.difference(geo1, geo2);
        graphiclayer.add(new Graphic({
            geometry: diffgeo,
            symbol: {
                type: "simple-fill",
                color: [0, 0, 0, 0.5],
                outline: { color: [0, 0, 0, 0.5], width: 0 },
            }
        }))
    }
}
export default maskUtil