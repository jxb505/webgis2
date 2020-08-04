
import EsriQuery from 'esri/tasks/support/Query'
import QueryTask from 'esri/tasks/QueryTask'
import IdentifyParameters from 'esri/tasks/support/IdentifyParameters'
import IdentifyTask from 'esri/tasks/IdentifyTask'
const defaultCurrentAttrsTemplate = () => {
    return {
        layerOption: IdentifyParameters.LAYER_OPTION_ALL,
        config: [],
        layerInfo: [], // [{layerJsonInfo}, ...]
        query: [],
        queryTemp: {
            resultLayer: null, // GraphicsLayer or FeatureLayer
            result: null,
            returnGeometry: true,
            geometry: null,
            layerIds: [],
            layerDefinitions: []
        }
    }
}
class SingleIdentifyTask {
    constructor(view, currentAttrs) {
        this.view = view;
        this.currentAttrs = currentAttrs;
    }
    resetCurrentAttrs() {
        this.currentAttrs = defaultCurrentAttrsTemplate();
    }
    _isServiceSupportsOrderBy(layerInfo) {
        let isSupport = false;
        if (layerInfo.advancedQueryCapabilities) {
            if (layerInfo.advancedQueryCapabilities.supportsOrderBy) {
                isSupport = true;
            }
        }
        return isSupport;
    }

    _isServiceSupportsPagination(layerInfo) {
        let isSupport = false;
        if (layerInfo.advancedQueryCapabilities) {
            if (layerInfo.advancedQueryCapabilities.supportsPagination) {
                isSupport = true;
            }
        }
        return isSupport;
    }
    _removeTempResultLayer() {
        if (this.tempResultLayer) {
            this.view.removeLayer(this.tempResultLayer);
        }
        this.tempResultLayer = null;
    }

    _addOperationalLayer(resultLayer) {
        this.view.addLayer(resultLayer);
    }
    _getLayerIndexByLayerUrl(layerUrl) {
        const lastIndex = layerUrl.lastIndexOf('/');
        const a = layerUrl.slice(lastIndex + 1, layerUrl.length);
        return parseInt(a, 10);
    }

    _getServiceUrlByLayerUrl(layerUrl) {
        const lastIndex = layerUrl.lastIndexOf('/');
        const serviceUrl = layerUrl.slice(0, lastIndex);
        return serviceUrl;
    }
    _isImageServiceLayer(url) {
        return url.indexOf('/ImageServer') > -1;
    }

    _isTable(layerDefinition) {
        return layerDefinition.type === 'Table';
    }

    _getBestQueryName(queryName) {
        if (queryName) {
            queryName += ' _' + this.nls.queryResult;
        } else {
            queryName += this.nls.queryResult;
        }
        var finalName = queryName;
        var allNames = this.view.graphicsLayerIds.map((glId) => {
            var layer = this.view.getLayer(glId);
            return layer.name;
        });
        var flag = 2;
        while (allNames.indexOf(finalName) >= 0) {
            finalName = queryName + '_' + flag;
            flag++;
        }
        return finalName;
    }

    _getQueryResultTemplate() {
        return {
            features: [],
            relatedResults: [],
            relatedTableIds: []
        }
    }

    /* --------------------query with currentAttrs.cofnig -------------------------*/
    /**
     * [features description]
     * @type {Array}
     * {features: [], relatedResults: [], relatedTableIds: []}
     */
    doQueryByCurrentAttrs() {
        var defs = [];
        this.currentAttrs.config.forEach((config, idx, arr) => {
            // var def = this._queryByCurrentAttrs(config.where, config.geometry, true, idx);
            // RasterLayer不受支持
            const lyrType = config.type;
            // const lyrType = config.json.type;
            if (lyrType === 'Raster Layer') return;
            const def = this._identifyByCurrentAttrs(idx);
            defs.push(def);
        });

        //
        var resultArr = [];
        return Promise.all(defs).then((responses) => {
            responses.forEach((response, idx, arr) => {
                //
                // response = [IdentifyResult]: displayFieldName,geometryType,layerId,layerName,feature,value
                const { results } = response;
                this.currentAttrs.query[idx].result = results;
                const features = [];
                results.forEach(item => {
                    features.push(item.feature);
                })
                resultArr.push({
                    results,
                    features,
                    relatedResults: [],
                    relatedTableIds: []
                });
            });
            return resultArr;
        }, (err) => {
            console.error(err);
            // if(resultLayer){
            //   this.view.removeLayer(resultLayer);
            // }
            // resultLayer = null;
            return err;
        });
    }
    _queryByCurrentAttrs(where, geometry, returnGeometry, idx) {
        const queryParams = new EsriQuery();
        queryParams.where = where;
        if (geometry) {
            queryParams.geometry = geometry;
        }
        queryParams.outSpatialReference = this.view.spatialReference;
        queryParams.returnGeometry = !!returnGeometry;

        queryParams.outFields = this._getOutputFieldsByCurrentAttrs(idx);
        const queryTask = new QueryTask(this.currentAttrs.config[idx].url);
        return queryTask.execute(queryParams);
    }
    _identifyByCurrentAttrs(idx) {
        const query = this.currentAttrs.query[idx];
        const config = this.currentAttrs.config[idx];
        const layerOption = this.currentAttrs.layerOption;

        const identifyParams = new IdentifyParameters();
        identifyParams.tolerance = 10; // 点查询时的缓冲像素
        identifyParams.returnGeometry = !!query.returnGeometry;

        // 当有图层组时，会出现Identify时，同一个数据出现返回两条同样的结果；
        // 过滤图层组的索引
        // modify by jiangxb @2019-3-26 10:43:00
        // ----start---------------------------

        const layerIds = [];
        // >>> add
        /* this.currentAttrs.layerInfo[idx].layers.forEach((x, index) => {
            if (!!!x.subLayerIds) {
                layerIds.push(index);
            }
        });*/
        // >>> modify
        for (let i = 0; i < query.layerIds.length; i++) {
            if (query.layerIds[i] < 0) {
                continue;
            }
            layerIds.push(query.layerIds[i]);
        }
        // identifyParams.layerIds = query.layerIds; //[0, 2];
        identifyParams.layerIds = layerIds;
        identifyParams.spatialReference = this.view.spatialReference;
        identifyParams.returnFieldName = true;
        // ----end-----------------------------

        if (query.layerDefinitions) { identifyParams.layerDefinitions = query.layerDefinitions; }
        identifyParams.geometry = query.geometry;

        identifyParams.mapExtent = this.view.extent;
        identifyParams.layerOption = layerOption; // IdentifyParameters.LAYER_OPTION_ALL;
        identifyParams.width = this.view.width;
        identifyParams.height = this.view.height;

        const identifyTask = new IdentifyTask(config.url);
        return identifyTask.execute(identifyParams);
    }

    _getOutputFieldsByCurrentAttrs(configIndex) {
        const currentConfig = this.currentAttrs.config[configIndex];
        const currentLayerInfo = this.currentAttrs.layerInfo[configIndex];

        //
        const fields = currentConfig.popup.fields;
        let outFields = fields.map((fieldInfo) => {
            return fieldInfo.name;
        });
        // we need to add objectIdField into outFields because relationship query
        // needs objectId infomation
        const objectIdField = currentConfig.objectIdField;
        if (outFields.indexOf(objectIdField) < 0) {
            outFields.push(objectIdField);
        }
        // "Name:${CITY_NAME}, Population: ${POP}"
        const title = currentConfig.popup.title;
        // ["${CITY_NAME}", "${POP}"]
        const matches = title.match(/\$\{\w+\}/g);
        if (matches && matches.length > 0) {
            matches.forEach((match) => {
                // "${CITY_NAME}"
                const fieldName = match.replace('${', '').replace('}', '');
                if (outFields.indexOf(fieldName) < 0) {
                    outFields.push(fieldName);
                }
            });
        }

        const allFieldInfos = currentLayerInfo.fields;
        const allFieldNames = allFieldInfos.map((fieldInfo) => {
            return fieldInfo.name;
        });
        // make sure every fieldName of outFields exists in fieldInfo
        outFields = outFields.filter((fieldName) => {
            return allFieldNames.indexOf(fieldName) >= 0;
        });

        return outFields;
    }

    /* -------------------------common functions----------------------------------*/

    _getOutputFields(idx) {
        const fields = this.currentAttrs.config[idx].popup.fields;
        let outFields = fields.map((fieldInfo) => {
            return fieldInfo.name;
        });
        // we need to add objectIdField into outFields because relationship query
        // needs objectId infomation
        const objectIdField = this.currentAttrs.config[idx].objectIdField;
        if (outFields.indexOf(objectIdField) < 0) {
            outFields.push(objectIdField);
        }
        // "Name:${CITY_NAME}, Population: ${POP}"
        const title = this.currentAttrs.config[idx].popup.title;
        // ["${CITY_NAME}", "${POP}"]
        const matches = title.match(/\$\{\w+\}/g);
        if (matches && matches.length > 0) {
            matches.forEach((match) => {
                // "${CITY_NAME}"
                const fieldName = match.replace('${', '').replace('}', '');
                if (outFields.indexOf(fieldName) < 0) {
                    outFields.push(fieldName);
                }
            });
        }

        const allFieldInfos = this.currentAttrs.layerInfo[idx].fields;
        const allFieldNames = allFieldInfos.map((fieldInfo) => {
            return fieldInfo.name;
        });
        // make sure every fieldName of outFields exists in fieldInfo
        outFields = outFields.filter((fieldName) => {
            return allFieldNames.indexOf(fieldName) >= 0;
        });

        return outFields;
    }
}

SingleIdentifyTask.LAYER_OPTION_ALL = IdentifyParameters.LAYER_OPTION_ALL; // layer.visibleAtScale
SingleIdentifyTask.LAYER_OPTION_TOP = IdentifyParameters.LAYER_OPTION_TOP;
SingleIdentifyTask.LAYER_OPTION_VISIBLE = IdentifyParameters.LAYER_OPTION_VISIBLE;
SingleIdentifyTask.getCleanCurrentAttrsTemplate = defaultCurrentAttrsTemplate;

export default SingleIdentifyTask;
