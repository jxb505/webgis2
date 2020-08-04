const getters = {
    // user
    token: state => state.user.token,
    avatar: state => state.user.avatar,
    name: state => state.user.name,

    // app
    sidebar: state => state.app.sidebar,
    device: state => state.app.device,
    appconfig: state => state.app.appconfig,
    widgetManager: state => state.app.WidgetManager,
    mapLayoutPosition: state => state.app.mapLayoutPosition,
    splitNodes: state => state.app.splitNodes,
    routerlist: state => state.app.routerlist,
    panelVisibleSet: state => state.app.panelVisibleSet,
    splitWidgets: state => state.app.splitWidgets,

    // map
    map: state => state.map.map,
    view: state => state.map.view,
    viewsPattern: state => state.map.viewsPattern,
    splitStatus: state => state.map.splitStatus,
    _layerCache: state => state.map._layerCache,
    viewType: state => state.map.viewType,
    visible3DLayers: state => state.map.visible3DLayers,


    // interfaces
    drawTools: state => state.interfaces.drawTools,
    layerController: state => state.interfaces.layerController,
    extentController: state => state.interfaces.extentController,
    mapEventBus: state => state.interfaces.mapEventBus
}
export default getters
