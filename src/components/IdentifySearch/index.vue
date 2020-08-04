
<template>
    <div v-loading="loading" class="container">
        <div class="layer-select">
            <span class="select-label">图层:</span>
            <el-select v-model="currentSwitch" placeholder="请选择">
                <el-option
                    v-for="item in layerSelect"
                    :key="item.value"
                    :label="item.label"
                    :value="item"
                >
                    <span class="layer-select">{{ item.label }}</span>
                </el-option>
            </el-select>
        </div>
        <div v-if="resultsCount" class="query-detail">
            <span>找到的要素数：{{ resultsCount }}</span>
        </div>
        <div v-if="resultsData.length" class="result-container">
            <div class="result-tree-container">
                <el-tree :data="resultsData" :props="defaultResultsProps" default-expand-all @node-click="handleNodeClick">
                    <span slot-scope="{ node,data }" class="custom-tree-node">
                         <span class="nodelabel">
                            <i
                            :class="['nodelabelimg',treenodecfg[data.type].icon]"
                            :style="{'color':treenodecfg[data.type].color}"
                            />
                            <span class="nodelabeltxt">{{ data.label }}</span>
                        </span>
                    </span>
                </el-tree>
            </div>
            <div v-if="tableData.length" class="result-table-container">
                <results-table :table-data="tableData" />
            </div>
        </div>
        <tooltip :show="showTooltip" />
    </div>
</template>
<script>
// import { localRequest } from '@/utils/request';
import { mapGetters } from 'vuex'
import tooltip from './tooltip';
import resultsTable from './resultsTable';
import SingleIdentifyTask from '@/core/class/SingleIdentifyTask'
import graphicUtil from '@/core/utils/graphicUtil';
export default {
    components: { tooltip, resultsTable },
    props: {
        widgetConfig: {
            type: Object,
            default: () => {}
        },
        visible: {
            type: Boolean,
            default: false
        }
    },
    data() {
        const defaultSelect = [{
            label: '可见层',
            value: 'visible'
        }, {
            label: '所有层',
            value: 'all'
        }];
        const unsupportLayerTypes = ['wmts', 'web-tile', 'graphics', 'base-tile'];
        const treenodecfg = {
            'DIR': {
                color: '#9653B8',
                icon: 'el-icon-s-order'
            },
            'LEAF': {
                color: '#5B67E9',
                icon: 'el-icon-notebook-1'
            }
        };
        const infoTemp = {
            showInInfoWindow: 1,
            name: '',
            alias: '',
            specialType: 1
        };
        return {
            defaultSelect,
            resultsData: [],
            unsupportLayerTypes,
            resultsCount: 0,
            currentSwitch: defaultSelect[0],
            showTooltip: false,
            loading: false,
            treenodecfg,
            defaultResultsProps: {
                id: 'ROOT',
                label: '根',
                type: 'DIR',
                url: '',
                feature: null,
                parent: null
            },
            infoTemp,
            tableData: []
        };
    },
    computed: {
        ...mapGetters(['view', 'drawTools', 'layerController', 'extentController']),
        layerSelect() {
            return [...this.defaultSelect, ...this._visibleLayerNames]
        },
        visibleLayers() {
            return this.layerController.visibleLayers;
        },
        _visibleServices() {
            return this._allServices.filter(svr => svr.visible);
        },
        _allServices() {
            return this.layerController.allLayers.filter(layer => {
                if (!this.unsupportLayerTypes.includes(layer.type) && !layer.isBasemap && layer.loaded) {
                    const { id, label, url, sublayers, type, visible } = layer;
                    const json = layer;
                    return { id, label, url, sublayers, type, visible, json }
                }
            })
        },
        _allLayerNames() {
            const arr = [];
            this._allServices.forEach(svr => {
                const { id, url, sublayers, visible } = svr;
                if (sublayers && sublayers.length) {
                    sublayers.forEach(subitem => {
                        const info = {
                            serviceid: id,
                            layerid: subitem.id,
                            label: subitem.title,
                            value: subitem.title,
                            layername: subitem.title,
                            url: `${url}/${subitem.id}`,
                            visible
                        }
                        arr.push(info)
                    })
                }
            })
            return arr;
        },
        _visibleLayerNames() {
            return this._allLayerNames.filter(info => info.visible)
        }
    },
    watch: {
        allLayerIds(newVal) {
            const newLayer = newVal.pop();
            this._addLegendOptions(newLayer);
        },
        visible(visible) {
            if (!visible) {
                this.clearResults();
            }
        }
    },
    mounted() {
        if (!Reflect.has(this.drawTools, 'activate')) {
            const unwatch = this.$watch('drawTools', newVal => {
                this.initDrawOptions();
                unwatch();
            });
        } else {
            this.initDrawOptions();
        }
    },
    methods: {
        collapseChange() {},
        onClose() {
        },
        initDrawOptions() {
            this.drawTools.stop();
            this.showTooltip = true;
            const { type } = this.widgetConfig;
            const symbolType = type;
            const symbolOption = null;
            const options = {
                drawBeforeClear: false
            };
            const mode = 'freehand';
            const action = this.drawTools.activate({
                type,
                symbolType,
                symbolOption,
                mode,
                options
            });
            this.drawTools.addActionHandle(action, (graphic) => {
                this.showTooltip = false;
                const { geometry } = graphic;
                this.drawTools.clearAllGraphics();
                this.doQuery(geometry).then((results) => {
                    
                    this.loading = false;
                    this.doQueryEnd(results);
                    this.initDrawOptions();
                }, (err) => {
                    console.log(err)
                    this.loading = false;
                    this.$message.error('无查询结果！')
                    this.initDrawOptions();
                });
            });
        },
        createOptions(layerCatalog) {
            const options = [];
            // const { allLayerIds } = this.layerController;
            const { arcgisLayers, non_arcgisLayers } = layerCatalog;
            const promiseArr = [];
            arcgisLayers.forEach(layer => {
                const idx = this.allLayerIds.indexOf(layer.id);
                const promise = this._requestArcgisLayersLegend(layer.url);
                const _promise = promise.then(result => {
                    if (result) {
                        return Object.assign(result, { idx });
                    } else {
                        console.log(
                            `%c图层 ${layer.id} 无图例信息！`,
                            'color:red;'
                        );
                        return null;
                    }
                });
                promiseArr.push(_promise);
            });
            non_arcgisLayers.forEach(layer => {
                const idx = this.allLayerIds.indexOf(layer.id);
                // eslint-disable-next-line no-undef
                const config = _.find(
                    this.widgetConfig.non_arcgisLayers,
                    target => {
                        return target.layerName === layer.id;
                    }
                );
                options[idx] = config;
            });
            return Promise.all(promiseArr).then(results => {
                results.forEach(result => {
                    var option = {};
                    const { idx, layers } = result;
                    const layerOptions = [];
                    if (layers) {
                        layers.forEach(legendData => {
                            const label = legendData.layerName;
                            const legends = legendData.legend.map(legend => {
                                return {
                                    label: legend.label,
                                    img: `data:image/png;base64,${legend.imageData}`
                                };
                            });
                            layerOptions.push({ label, legends });
                        });
                    }
                    option.layerName = this.allLayerIds[idx];
                    option.layerOptions = layerOptions;
                    options[idx] = option;
                });
                return options;
            });
        },
        doQuery(geometry) {
            this.clearResults();
            this.loading = true;
            const currentAttrs = SingleIdentifyTask.getCleanCurrentAttrsTemplate();
            this.currentSingleTask = new SingleIdentifyTask(
                this.view,
                currentAttrs
            );
            if (this.currentSwitch.label === '所有层') {
                currentAttrs.config = this._allServices;
                currentAttrs.layerOption =
                        SingleIdentifyTask.LAYER_OPTION_ALL;
            } else if (this.currentSwitch.label === '可见层') {
                currentAttrs.config = this._visibleServices;
                currentAttrs.layerOption =
                        SingleIdentifyTask.LAYER_OPTION_VISIBLE;
            } else {
                currentAttrs.config = this.currentSwitch;
                currentAttrs.layerOption =
                        SingleIdentifyTask.LAYER_OPTION_TOP;
            }
            //   
            if (!this._allServices.length) {
                return new Promise((reslove, reject) => {
                    reject(null)
                });
            }
            currentAttrs.config.forEach((item, i) => {
                // eslint-disable-next-line no-undef
                const queryTemp = _.clone(currentAttrs.queryTemp);
                queryTemp.geometry = geometry;
                if (item.sublayers) {
                    queryTemp.layerIds = item.sublayers.items
                        .filter((item) => item.visible)
                        .map((newItem) => newItem.id); // item.layerIds = lang.clone(item.visibleLayers);
                    if (item.layerDefinitions) { queryTemp.layerDefinitions = item.layerDefinitions; }
                    //
                    // 拿到url
                    // var url = item.url;
                    const json = item.json;
                    console.log('>>>> 第 ' + i + ' 个服务 >>>> ' + item.url);
                    // 将LayerInfo添加到currentAttrs.layerInfo
                    if (!currentAttrs.layerInfo) currentAttrs.layerInfo = [];
                    currentAttrs.layerInfo.push(json);
                    //
                    // set geometry
                    // item.geometry = geometry;
                    //
                    currentAttrs.query.push(queryTemp);
                }
            })
            if (!currentAttrs.query.length) {
                return new Promise((reslove, reject) => {
                    reject(null)
                })
            }
            return this.currentSingleTask.doQueryByCurrentAttrs();
        },
        doQueryEnd(results) {
            const currentAttrs = this.currentSingleTask.currentAttrs;

            // 首先创建root
            // index 服务索引
            results.forEach((result, index, arr) => {
                // query
                const currentConfig = currentAttrs.config[index];

                // 根据查询结果 , currentAttrs.query 中查找json
                const layerIds = [];
                const layerIdIndecis = []; // layerId在config.layerInfos中的索引
                const layerFeatures = [];
                currentConfig.sublayers.items.forEach((info, i) => {
                    layerIds.push(info.id);
                    layerFeatures.push([]);
                    layerIdIndecis.push(i);
                });
                // result，根据layerId解析分组
                currentConfig.info = [];
                const resultArray = result.results;
                for (let i = 0; i < resultArray.length; i++) {
                    const info = {};
                    const iresult = resultArray[i];
                    const { feature, layerId, layerName } = iresult;
                    //
                    const attributes = feature.attributes;
                    const _index = layerIds.indexOf(layerId);
                    // var attributes = iresult.feature.attributes;
                    // 在service中，设置layer的基本属性
                    // 删除fields数据
                    if (!info.objectIdField) { info.objectIdField = 'OBJECTID' } // 设置字段
                    if (Reflect.has(iresult, 'displayFieldName')) {
                        const { displayFieldName } = iresult;
                        // this._popup.captionField = iresult.displayFieldName;
                        // add in iresult.feature
                        info.displayField = displayFieldName;
                        info.orderByFields = displayFieldName;
                        feature.display = {
                            displayField: displayFieldName,
                            displayValue: feature.attributes[displayFieldName]
                        };
                    }
                    const Infos = {
                        fields: []
                    };
                    Object.keys(attributes).forEach(key => {
                    // eslint-disable-next-line no-undef
                        const popField = _.cloneDeep(this.infoTemp);
                        popField.name = key;
                        popField.alias = attributes[key];
                        Infos.fields.push(popField);
                    })
                    info.id = _index;
                    // 取出layerId对应的features
                    info.popup = Infos;
                    info.id = _index;
                    info.name = layerName;
                    currentConfig.info[_index] = info;
                    const features = layerFeatures[_index];
                    features.push(feature);
                    // 按字段排序
                    if (this.specialConfig) {
                        if (this.specialConfig.subLayerID.indexOf(layerName) > -1) {
                            const { sortDescFields } = this.specialConfig;
                            if (features.length > 1) {
                                features.sort((a, b) => {
                                    return (
                                        b[sortDescFields] - a[sortDescFields]
                                    );
                                });
                            }
                        }
                    }
                }

                // layerIds.length == layerFeatures.length
                for (let j = 0; j < layerIds.length; j++) {
                    const _layerId = layerIds[j];
                    const _features = layerFeatures[j];
                    // 统计查询总数
                    this.resultsCount += _features.length;
                    // 将 features 构造成一个 DIR节点（图形为 LEAF）
                    var nodes = this._addResultItems(
                        index,
                        _layerId,
                        _features
                    );
                    this.resultsData = [...this.resultsData, ...nodes]
                }
            });
        },
        _addResultItems: function(configIndex, layerId, features) {
            let nodes = [];
            if (features.length > 0) {
                nodes = this._createQueryResultItem(
                    configIndex,
                    layerId,
                    features
                );
            }
            return nodes;
        },

        _createQueryResultItem: function(configIndex, layerId, features) {
            const currentAttrs = this.currentSingleTask.currentAttrs;
            // console.log("构建图层DIR节点 >>>> " + currentAttrs.layerInfo[configIndex].name + " >>>> " + features.length);

            const currentConfig = currentAttrs.config[configIndex];
            // var currentLayerJson = currentAttrs.layerInfo[configIndex];
            let currentLayerInfo = {};
            currentConfig.sublayers.items.forEach((info) => {
                if (info.id === layerId) {
                    // const clone = _.cloneDeep(info);
                    currentLayerInfo = info;
                }
            });
            //
            const layerName = currentLayerInfo.title;
            const titleField = currentLayerInfo.displayField;
            const objectIdField = currentLayerInfo.objectIdField;

            // eslint-disable-next-line no-undef
            const root = _.clone(this.defaultResultsProps);
            const dirParentId = root.id;
            const theNodeId = `${layerName}'_'${layerId}`;
            const rootNodes = {
                id: theNodeId,
                label: `${layerName}  ( 共 ${features.length} 个图形 )`,
                type: 'DIR',
                configIndex: configIndex,
                layerId: layerId,
                children: [],
                feature: null,
                // data: currentAttrs.layerInfo[configIndex],
                parent: dirParentId
            }
            features.forEach((feature, idx) => {
                // tree: leaf node of tree
                const display = feature.display || {};
                let title = display.displayValue || feature.attributes[titleField];
                title = !title || title.toUpperCase() === 'NULL'
                    ? feature.attributes[objectIdField]
                    : title; // displayField || objectId

                const node = {
                    id: layerName + '_' + layerId + '_' + idx + '_' + title,
                    // id: title,// id 不能重复，dijitTree会去重。
                    label: title,
                    type: 'LEAF',
                    configIndex: configIndex,
                    layerId: layerId,
                    feature: feature,
                    parent: theNodeId
                };
                rootNodes.children.push(node);
            });

            return [rootNodes];
        },
        _createTableData(currentLayerInfo, feature, currentLayerId) {
            // 创建 PopupTemplate
            const fields = currentLayerInfo.popup.fields;
            // var titleField = currentLayerInfo.displayField;
            // var objectIdField = currentLayerInfo.objectIdField;
            // var title = feature.attributes[titleField];
            // title = !title ? feature.attributes[objectIdField] : title;
            // 图层过滤字段配置(外部引入)
            let fieldfilter, showFields, forbiddenFields;
            if (this.filters) {
                fieldfilter =
                    this.filters[currentLayerId] &&
                    this.filters[currentLayerId][currentLayerInfo.name];
                if (fieldfilter && fieldfilter.fieldType === 'show') {
                    // 显示字段
                    showFields = fieldfilter.field;
                } else if (fieldfilter && fieldfilter.fieldType === 'hide') {
                    // 屏蔽字段
                    forbiddenFields = fieldfilter.field;
                }
            }
            const isUndefined = (s) => {
                return typeof s === 'undefined';
            }
            const isNull = (s) => {
                return (
                    s == null ||
                    (s && typeof s === 'string' && s.toLowerCase() === 'null')
                );
            }
            const dataSet = [];
            fields.forEach((field) => {
                const fieldname = field.name;
                const item = {};
                let fieldAlias, fieldValue;
                if (!!showFields && showFields.length) {
                    // 显示的字段
                    if (showFields.indexOf(fieldname) > -1) {
                        var idx = showFields.indexOf(fieldname);
                        // 仅显示配置的字段
                        // alias
                        fieldAlias = (fieldfilter && fieldfilter.alias && fieldfilter.alias[idx]) ||
                         fieldname;
                        // value
                        item.key = fieldAlias;
                        fieldValue = feature.attributes[fieldname];
                        item.value = (isUndefined(fieldValue) || isNull(fieldValue) ? '' : fieldValue)
                        dataSet.push(item);
                    }
                } else {
                    // 常规字段过滤(oid,shape,geometry)
                    var fname = fieldname.toUpperCase();
                    if (fname.indexOf('OBJECTID') === -1 &&
                        fname.indexOf('SHAPE') === -1 &&
                        fname.indexOf('GEOMETRY') === -1
                    ) {
                        // 不显示屏蔽的字段
                        if (!forbiddenFields || forbiddenFields.length && forbiddenFields.indexOf(fieldname) === -1) {
                            fieldAlias = fieldname;
                            item.key = fieldAlias;
                            fieldValue = feature.attributes[fieldname];
                            item.value = (isUndefined(fieldValue) || isNull(fieldValue) ? '' : fieldValue)
                            dataSet.push(item);
                        }
                    }
                }
            });
            return dataSet;
        },
        handleNodeClick(data, node) {
            this.clearDrawing();
            const gra = this.drawGraphics(data.feature.geometry);
            this._showInfos(data);
            this.extentController.goTo({ target: gra }, () => {

            })
        },
        _showInfos(item) {
            const currentAttrs = this.currentSingleTask.currentAttrs;
            let currentLayerInfo;
            const currentConfig = currentAttrs.config[item.configIndex];
            currentConfig.info.forEach((info) => {
                if (info.id === item.layerId) currentLayerInfo = info;
            });
            this.tableData = this._createTableData(
                currentLayerInfo,
                item.feature,
                currentConfig.id
            );
        },
        drawGraphics(geometry) {
            const gra = graphicUtil.createGraphics({ geometry })
            this.drawTools.addGraphic(gra);
            return gra
        },
        clearDrawing() {
            this.drawTools.clearAllGraphics();
        },
        clearResults() {
            this.resultsCount = 0;
            this.resultsData = [];
            this.tableData = [];
            this.clearDrawing();
        }
    }
};
</script>
<style lang="scss" scoped>
.container{
    background-color: #fff;
    font-size: 14px;
    .layer-select{
        height: 40px;
        // margin: 5px 0;
        line-height: 40px;
        width: 100%;
        .select-label{
            margin-right: 30px;
        }
        .el-select{
            width: 60%;
        }
    }
    .query-detail{
        text-align: left;
        text-indent: 26px;
    }
    .custom-tree-node{
        font-size: 12px;
        .nodelabelimg{
            font-size: 14px;
        }
    }
    .result-tree-container{
        height: 160px;
        overflow: auto;
        .el-tree{
            height: 100%;
        }
    }
    .result-table-container{
        // overflow: auto;
        height: 240px;
        width: 100%;
    }
}
</style>
