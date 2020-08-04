import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import map from './modules/map'
import settings from './modules/settings'
import user from './modules/user'
import interfaces from './modules/interfaces'

Vue.use(Vuex)

const store = new Vuex.Store({
    modules: {
        app,
        map,
        settings,
        user,
        interfaces
    },
    getters
})

export default store
