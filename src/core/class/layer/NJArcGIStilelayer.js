import BaseTileLayer from 'esri/layers/BaseTileLayer';
import esriRequest from 'esri/request';
import SpatialReference from 'esri/geometry/SpatialReference'
import TileInfo from 'esri/layers/support/TileInfo'

const layerclass = BaseTileLayer.createSubclass({
    properties: {
        url: null,
        id: null,
        label: null,
        visible: null,
        layerid: null,
        styleid: null,
        tileMatrixSet: 'Matrix_2',
        format: 'image/tile'
    },
    getTileUrl: function(level, row, col) {
        var keys = this.url.split('/');
        if (!this.layerid) {
            this.layerid = this.styleid = keys[keys.length - 2];
        }
        // 增加参数minLevel,maxLevel;
        if (this.minLevel && level < this.minLevel) {
            return;
        }
        if (this.maxLevel && level > this.maxLevel) {
            return;
        }
        var templateUrl = `${this.url}/tile/${level}/${row}/${col}`;
        return templateUrl;
    },
    fetchTile: function(level, row, col) {
          
        var url = this.getTileUrl(level, row, col);
        return esriRequest(url, {
            responseType: 'image',
            allowImageDataAccess: true
        }).then(function(response) {
            var image = response.data;
            var width = 256;
            var height = 256;
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            canvas.width = width;
            canvas.height = height;
            context.drawImage(image, 0, 0, width, height);
            return canvas;
        });
    }
});

const c = function(config) {
    const layer = new layerclass(config);
    const pTileInfo = new TileInfo({
        'dpi': '96',
        'format': 'image/tile',
        'compressionQuality': 0,
        'spatialReference': {
            'wkt': 'PROJCS["NJ08_118_50_CM",GEOGCS["GCS_GRS_1980",DATUM["D_GRS_1980",SPHEROID["GRS_1980",6378137.0,298.257222101]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Gauss_Kruger"],PARAMETER["False_Easting",500000.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",118.8333333333333],PARAMETER["Scale_Factor",1.0],PARAMETER["Latitude_Of_Origin",0.0],UNIT["Meter",1.0]]'
        },
        'rows': 256,
        'cols': 256,
        'origin': {
            'x': -20037508.342789199,
            'y': 20037508.342789199
        },
        'lods': [{
            'level': 10,
            'resolution': 152.87405657035293,
            'scale': 577790.55428878032
        }, {
            'level': 11,
            'resolution': 76.437028285176467,
            'scale': 288895.27714439016
        }, {
            'level': 12,
            'resolution': 38.218514142588234,
            'scale': 144447.63857219508
        }, {
            'level': 13,
            'resolution': 19.109257071294117,
            'scale': 72223.81928609754
        }, {
            'level': 14,
            'resolution': 9.5546285356470584,
            'scale': 36111.90964304877
        }, {
            'level': 15,
            'resolution': 4.7773142678235292,
            'scale': 18055.954821524385
        }, {
            'level': 16,
            'resolution': 2.3886571339117646,
            'scale': 9027.9774107621924
        }, {
            'level': 17,
            'resolution': 1.1943285669558823,
            'scale': 4513.9887053810962
        }, {
            'level': 18,
            'resolution': 0.59716428347794115,
            'scale': 2256.9943526905481
        }, {
            'level': 19,
            'resolution': 0.29858214173897057,
            'scale': 1128.4971763452741
        }]

    });
    const pSpatialReference = new SpatialReference({
        'wkt': 'PROJCS["NJ08_118_50_CM",GEOGCS["GCS_GRS_1980",DATUM["D_GRS_1980",SPHEROID["GRS_1980",6378137.0,298.257222101]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Gauss_Kruger"],PARAMETER["False_Easting",500000.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",118.8333333333333],PARAMETER["Scale_Factor",1.0],PARAMETER["Latitude_Of_Origin",0.0],UNIT["Meter",1.0]]'
    });
    layer.tileInfo = pTileInfo;
    layer.spatialReference = pSpatialReference;
    return layer;
}
export default c;