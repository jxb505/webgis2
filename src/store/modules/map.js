const state = {
    map: null,
    view: null,
    viewType:'2D',
    layerController: null,
    viewsPattern: 'default',
    splitStatus: false,
    _layerCache:[],
    visible3DLayers:[],
    splitClear:false
};
const mutations = {
    SPLIT_CLEAR(state,value){
        debugger;
        state.splitClear = value;
    },
    CHANGE_MAPSTATE(state, { key, value }) {
        if (Reflect.has(state, key)) {
            state[key] = value;
        }
    },
    SET_VIEWTYPE(state,viewType){
        state.viewType = viewType;
    },
    SET_VISLAYERS(state,layers){
         
        state.visible3DLayers = layers;
    },
    SET_LAYER_CONTROLLER(state, instance) {
        state.layerController = instance;
    },
    SET_VIEW(state, view) {
        state.view = view;
    },
    SET_MAP(state, map) {
        state.map = map;
    },
    SET_VIEWS_PATTERN(state, pattern) {
        state.viewsPattern = pattern;
    },
    REVISE_SPLIT_STATUS(state, status) {
        state.splitStatus = status;
    }
};

const actions = {
    splitClear({commit},value){
        debugger;
        commit('SPLIT_CLEAR',value)
    },
    changeMapState({ commit }, data) {
        commit('CHANGE_MAPSTATE', data);
    },
    setView({ commit }, ins) {
        commit('SET_VIEW', ins);
    },
    setViewType({ commit }, viewType){
         
        commit('SET_VIEWTYPE', viewType);
    },
    setVisLayers({ commit }, layers){
         
        commit('SET_VISLAYERS', layers);
    },
    setMap({ commit }, ins) {
        commit('SET_MAP', ins);
    },
    initLayerController({ commit }, instance) {
        commit('SET_LAYER_CONTROLLER', instance);
    },
    setViewsPattern({ commit }, pattern) {
          
        commit('SET_VIEWS_PATTERN', pattern);
    },
    reviseSplitStatus({ commit }, status) {
        commit('REVISE_SPLIT_STATUS', status);
    }
};
export default {
    namespaced: true,
    state,
    mutations,
    actions
};
