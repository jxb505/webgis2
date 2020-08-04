import Cookies from 'js-cookie'
import WidgetManager from '@/utils/WidgetManager'

const state = {
    sidebar: {
        opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
        withoutAnimation: false
    },
    device: 'desktop',
    routerlist: [],
    appconfig: {},
    WidgetManager: new WidgetManager(),
    mapLayoutPosition: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },
    tasklist: [],
    currentTask: '',
    viewtype: '',
    splitNodes: [],
    panelVisibleSet: {},
    splitWidgets: {}
}

const mutations = {
    SET_MAP_LAYOUT_POSITION: (state, position) => {
        state.mapLayoutPosition = position
    },
    TOGGLE_SIDEBAR: state => {
        state.sidebar.opened = !state.sidebar.opened
        state.sidebar.withoutAnimation = false
        if (state.sidebar.opened) {
            Cookies.set('sidebarStatus', 1)
        } else {
            Cookies.set('sidebarStatus', 0)
        }
    },
    CLOSE_SIDEBAR: (state, withoutAnimation) => {
        Cookies.set('sidebarStatus', 0)
        state.sidebar.opened = false
        state.sidebar.withoutAnimation = withoutAnimation
    },
    TOGGLE_DEVICE: (state, device) => {
        state.device = device
    },
    REVISE_ROUTERLIST: (state, routerlist) => {
        state.routerlist = routerlist
    },
    REVISE_APPCONFIG: (state, appconfig) => {
        state.appconfig = appconfig
    },
    TASKLIST: (state, tasklist) => {
        state.tasklist = tasklist
    },
    CURRENTTASK: (state, currentTask) => {
        state.currentTask = currentTask;
    },
    VIEWTYPE: (state, viewtype) => {
        state.viewtype = viewtype;
    },
    ADD_TO_SPLIT: (state, node) => {
        state.splitNodes.push(node)
    },
    UPDATE_SPLIT: (state, splitNodes) => {
        state.splitNodes = splitNodes
    },
    DROP_FROM_SPLIT: (state, node) => {
        const idx = state.splitNodes.findIndex(item => item.label === node.label)
        if (idx > -1) {
            state.splitNodes.splice(idx, 1)
        }
    },
    REVISE_PANEL_VISIBLE(state, target) {
        state.panelVisibleSet = Object.assign({}, state.panelVisibleSet, target);
        // 触发更新
        // state.panelVisibleSet = Object.assgin()
    },
    CLOSE_ALL_PANELS(state) {
         
        const keys = Object.keys(state.panelVisibleSet);
        keys.forEach(key => {
            state.panelVisibleSet[key] = false
        })
    },
    REVISE_MAP_COMPONENTS(state, target) {
        state.appconfig.widgetOnScreen.widgets = target;
    },
    SET_SPLIT_WIDGETS(state, target) {
        state.splitWidgets = target;
    }
}

const actions = {
    setMapLayoutPosition({ commit }, range) {
        commit('SET_MAP_LAYOUT_POSITION', range)
    },
    toggleSideBar({ commit }) {
        commit('TOGGLE_SIDEBAR')
    },
    closeSideBar({ commit }, { withoutAnimation }) {
        commit('CLOSE_SIDEBAR', withoutAnimation)
    },
    toggleDevice({ commit }, device) {
        commit('TOGGLE_DEVICE', device)
    },
    reviseRouterlist({ commit }, routerlist) {
        commit('REVISE_ROUTERLIST', routerlist)
    },
    reviseAppconfig({ commit }, appconfig) {
        commit('REVISE_APPCONFIG', appconfig)
    },
    tasklist({ commit }, tasklist) {
        commit('TASKLIST', tasklist)
    },
    currentTask({ commit }, currentTask) {
        commit('CURRENTTASK', currentTask)
    },
    viewtype({ commit }, viewtype) {
        commit('VIEWTYPE', viewtype)
    },
    addToSplit({ commit }, node) {
        commit('ADD_TO_SPLIT', node)
    },
    updateSplit({ commit }, splitNodes) {
        commit('UPDATE_SPLIT', splitNodes)
    },
    dropFromSplit({ commit }, node) {
        commit('DROP_FROM_SPLIT', node)
    },
    revisePanelVisible({ commit }, target) {
        commit('REVISE_PANEL_VISIBLE', target)
    },
    closeAllPanels({ commit }) {
        commit('CLOSE_ALL_PANELS')
    },
    reviseMapComponents({ commit }, target) {
        commit('REVISE_MAP_COMPONENTS', target)
    },
    setSplitWidgets({ commit }, target) {
        commit('SET_SPLIT_WIDGETS', target)
    }
}
export default {
    namespaced: true,
    state,
    mutations,
    actions
}
