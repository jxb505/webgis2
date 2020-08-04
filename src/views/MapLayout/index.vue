<template>
    <div class="layout-container" :class="viewsPattern">
        <div v-for="(view, viewIdx) in layoutViews" :key="viewIdx" class="view-container" :class="`view-${viewIdx+1}`">
            <div
                v-for="(item, idx) in view.directions"
                :key="idx"
                class="components-container"
                :class="item.pos"
            >
                <component
                    :is="com.component"
                    v-for="(com, i) in item.components"
                    :ref="com.config.id"
                    :key="i"
                    :widget-config="com.widgetConfig"
                    :panel-cfg="com.config.panelCfg"
                    :panel-visible.sync="panelVisibleSet[com.config.id]"
                    :config="com.config"
                    @loadWidgetInPanel="loadWidgetInPanel($event)"
                    @showPanel="showPanel($event)"
                    @hidePanel="hidePanel($event)"
                />
            </div>
        </div>
        <div class="panels-container" :style="layoutPosition">
            <map-panel
                v-for="(item, idx) in panels"
                :key="idx"
                :position="item.position"
                :config="item.config"
                :visible="panelVisibleSet[item.config.id]"
                @close-popup="hidePanel"
            >
                <template #widget-container>
                    <keep-alive>
                        <component
                            :is="item.component"
                            :widget-config="item.widgetConfig"
                            :config="item.config"
                            :visible.sync="panelVisibleSet[item.config.id]"
                            v-on="$listeners"
                            :ref="item.config.id"
                        />
                    </keep-alive>
                </template>
            </map-panel>
        </div>
    </div>
</template>
<script>
import mapButtons from '../MapButtons';
import mapPanel from '../MapPanel';
import { getWidgetConfig } from '@/plugin/config/sysConfig';
import { mapGetters, mapState } from 'vuex';
export default {
    name: 'MapLayout',
    components: {
        mapButtons,
        mapPanel
    },
    props: {
        widgets: {
            type: Array,
            default: () => []
        }
    },
    data() {
        const directions = [
            'left',
            'right',
            'top',
            'bottom',
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right',
            'left-top',
            'left-bottom',
            'right-top',
            'right-bottom'
        ];
        const directionsPair = {
            left: 'right',
            right: 'left',
            top: 'bottom',
            bottom: 'top'
        };
        const arrange_directions = ['vertical', 'horizontal'];
        return {
            directions,
            directionsList: directions.map(pos => {
                return {
                    pos,
                    components: []
                };
            }),
            layoutViews: [{
                directions: [],
                id: null,
                title: null,
                label: null
            }],
            panels: [],
            directionsPair,
            arrange_directions
            // btnStates: {}
        };
    },
    computed: {
        ...mapGetters(['mapLayoutPosition', 'panelVisibleSet', 'splitNodes', 'viewsPattern', 'splitStatus', 'widgetManager', 'appconfig']),
        ...mapState({ splitWidgets: state => state.app.splitWidgets }),
        layoutPosition() {
            const { top, bottom, right, left } = this.mapLayoutPosition;
            return {
                top: `${top}px`,
                bottom: `${bottom}px`,
                right: `${right}px`,
                left: `${left}px`
            };
        }
    },
    watch: {
        splitStatus(newVal, oldval) {
            this.directionsList.forEach(item => { item.components = [] })
            if (newVal) {
                this.splitNodes.forEach((split, idx) => {
                    const _default = {
                        directions: [],
                        id: null,
                        title: null,
                        label: null
                    }
                    if (idx > 0) {
                        this.layoutViews.push(_default);
                    }
                })
                const { remainWidgetList, commonWidgetList } = this.splitWidgets;
                const { widgets } = remainWidgetList;
                const mainIdArr = widgets.map(item => item.id);
                const pickList = [...this.appconfig.widgetOnScreen.widgets2d, this.appconfig.widgetOnScreen.widgets23d];
                let mainWidgets = pickList.filter(item => {
                    return mainIdArr.indexOf(item.id) > -1
                });
                // 仅分屏状态下加入的组件,无组件顺序控制
                if (mainIdArr.length > mainWidgets.length) {
                    const widgetsOnlyInSplit = widgets.filter(item => item.uri);
                    mainWidgets = [...mainWidgets, ...widgetsOnlyInSplit];
                }
                const proms = this.layoutViews.map(async(view, idx) => {
                    let directions;
                    // 主屏
                    if (idx === 0) {
                        directions = await this.placeComponents([...mainWidgets, ...commonWidgetList])
                    // view.directions = Object.assign([], this.placeComponents([...mainWidgets, ...commonWidgetList]));
                    } else {
                        directions = await this.placeComponents(commonWidgetList)
                    // view.directions = Object.assign([], this.placeComponents([...commonWidgetList]));
                    }
                    const newDirections = directions;
                    // view.directions = newDirections;
                    return new Promise((res, rej) => {
                        res(newDirections)
                    })
                })
                Promise.all(proms).then(results => {
                    results.forEach((res, idx) => {
                        // 给组件加入所属屏幕序号
                        res.forEach(direction => {
                            const { components } = direction;
                            components.forEach(item => { item.config.viewIdx = idx });
                        })
                        const view = this.layoutViews[idx];
                        this.$set(view, 'directions', res)
                    })
                })
            } else {
                this.layoutViews = [{
                    directions: [],
                    id: null,
                    title: null,
                    label: null
                }];
                this.initialLayout();
            }
        }
    },
    async created() {
        this.initialLayout();
    },
    methods: {
        async placeComponents(widgets) {
            // 过滤出工具配置
            const tools = widgets.filter(
                item => typeof item.position === 'string'
            );
            // eslint-disable-next-line no-undef
            const directionsList = _.cloneDeep(this.directionsList);
            const promises = await tools.map(async item => {
                const target = directionsList.find(
                    di => di.pos === item.position
                );
                item.tooltipPlacement = this.getTooltipPlacement(
                    item.position
                );
                if (target) {
                    if (item.inPanel) {
                        target.components.push({
                            config: _.cloneDeep(item),
                            component: mapButtons
                        });
                    } else {
                        if (item.hasConfig && !item.config) {
                            item.config = await getWidgetConfig(item);
                        }
                        target.components.push({
                            config: _.cloneDeep(item),
                            visible: false,
                            widgetConfig: item.config,
                            component: this.widgetManager.loadWidget(item)
                        });
                        const opt = {};
                        opt[item.id] = false;
                        this.$store.dispatch('app/revisePanelVisible', opt)
                        // this.btnStates[item.id] = false;
                    }
                }
                return new Promise((res, rej) => {
                    res(target)
                })
            });
            return Promise.all(promises).then(targets => {
                const directions = [];
                targets.forEach(target => {
                    if (!directions.includes(target)) {
                        directions.push(target);
                    }
                })
                return directions
            })
        },
        async initialLayout() {
            const { widgets } = this.appconfig.widgetOnScreen;
            const directions = await this.placeComponents(widgets);
            this.layoutViews[0].directions = directions;
            this.panels = [];
        },
        getTooltipPlacement(pos) {
            const prefix = pos.split('-')[0];
            return this.directionsPair[prefix];
        },
        async loadWidgetInPanel(buttonCfg) {
            // const { widgets } = this.appconfig.widgetOnScreen;
            // const tools = widgets.filter(item => item.inPanel);
            const { id } = buttonCfg;
            // let config = tools.find(item => item.id === id);
            // let widgetConfig = {};
            // if (config.configPath) {
            //     widgetConfig = await this.WidgetManager.getWidgetConfig(config);
            // }
            // config = this.assignPositionConfig(config);
            const config = this.assignPositionConfig(buttonCfg);
            const componentCfg = {
                position: config.panel.position,
                config,
                visible: true,
                widgetConfig: config.config,
                component: this.widgetManager.loadWidget(config)
            };
            buttonCfg.panelCfg = true;
            const opt = {};
            opt[id] = true;
            this.$store.dispatch('app/revisePanelVisible', opt)
            // if (Reflect.has(this.btnStates, id)) {
            //     this.btnStates[id] = true;
            // } else {
            //     this.$set(this.btnStates, id, true)
            // }
            this.panels.push(componentCfg);
        },
        assignPositionConfig(config) {
            
            // 只使用了left&top来定位面板，故需要计算位置
            const defaultPanelPosition = {
                left: 100,
                top: 60,
                width: 300,
                zIndex: 100
            };
            const {
                top = 0,
                bottom = 0,
                right = 0,
                left = 0
            } = this.mapLayoutPosition;
            const { panel = {}} = config;
            // 默认值
            const { position = defaultPanelPosition } = panel;

            const containerH = document.getElementsByClassName('app-main')[0].clientHeight;
            const containerW = document.getElementsByClassName('app-main')[0].clientWidth;
            position.top =
                position.top ||
                containerH -
                    top -
                    bottom -
                    position.bottom -
                    position.height;
            position.left =
                position.left ||
                containerW -
                    left -
                    right -
                    position.right -
                    position.width;
            return Object.assign(config, { panel: { position }});
        },
        hidePanel(config) {
            const { id } = config;
            const opt = {};
            opt[id] = false;
            this.$store.dispatch('app/revisePanelVisible', opt)
            // this.btnStates[id] = false;
            this.$refs[id][0].onClose&&this.$refs[id][0].onClose();

        },

        showPanel(config) {
            const { id } = config;
            const opt = {}; 
            opt[id] = true;
            this.$store.dispatch('app/revisePanelVisible', opt)
            // this.btnStates[id] = true;
        }
    }
};
</script>
<style lang="scss" scoped>
.layout-container {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    right: 0;
    pointer-events: none;
    .view-container{
        position: relative;
        .components-container {
            position: absolute;
            z-index: 100;
            flex-shrink: 0;
            pointer-events: all;
        }
        [class*='-right'] {
            * + *  {
                margin-right: 6px;
            }
        }
        [class*='-left'] {
            * + * {
                margin-left: 6px;
            }
        }
        [class*='top'] {
            top: 5px;
            // max-width: 33%;
            * {
                display: inline-block;
            }
        }
        .top,
        .bottom  {
            left: 50%;
            transform: translateX(-50%);
            width: auto;
        }
        [class*='bottom'] {
            bottom: 0;
            // max-width: 33%;
            * {
                display: inline-block;
            }
        }
        [class*='-top'] {
            top: 100px;
            // display: flex;
            * {
                display: block;
            }
            * + * {
                margin-top: 6px;
            }
        }
        [class*='-bottom'] {
            bottom: 100px;
            display: flex;
            -ms-flex-direction: column-reverse;
            flex-direction: column-reverse;
            * + *  {
                margin-bottom: 6px;
            }
        }
        [class*='-left'] {
            display: flex;
            -ms-flex-direction: row;
            flex-direction: row;
        }
        [class*='left']{
            left: 10px;
        }
        [class*='right']{
            right: 10px;
        }
        [class*='-right'] {
            display: flex;
            -ms-flex-direction: row-reverse;
            flex-direction: row-reverse;
        }
    }

    .panels-container {
        width: 100%;
        height: 100%;
        position: absolute;
    }
}
</style>
SZ
