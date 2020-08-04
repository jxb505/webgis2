const state = {
    map: {},
    drawTools: {},
    layerController: {},
    mapEventBus: {},
    extentController: {}
}

const mutations = {

    SET_DRAWTOOLS(state, instance) {
        state.drawTools = instance
    },
    SET_LAYER_CONTROLLER(state, instance) {
        state.layerController = instance
    },
    SET_MAP_EVENT_BUS(state, instance) {
        state.mapEventBus = instance
    },
    SET_EXTENT_CONTROLLER(state, instance) {
        state.extentController = instance
    }
}

const actions = {

    setDrawTools({ commit }, instance) {
        commit('SET_DRAWTOOLS', instance)
    },
    setLayerController({ commit }, instance) {
        commit('SET_LAYER_CONTROLLER', instance)
    },
    setMapEventBus({ commit }, instance) {
        commit('SET_MAP_EVENT_BUS', instance)
    },
    setExtentController({ commit }, instance) {
        commit('SET_EXTENT_CONTROLLER', instance)
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}