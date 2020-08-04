import esriConfig from 'esri/config';
import {
    addProxyRule
} from 'esri/core/urlUtils';
const DEFAULT_WORKER_URL = 'http://localhost/arcgisapi414/';
const DEFAULT_LOADER_URL = `${DEFAULT_WORKER_URL}dojo/dojo-lite.js`;

esriConfig.geometryServiceUrl = "http://192.168.7.190:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer";
esriConfig.workers.loaderUrl = DEFAULT_LOADER_URL;
esriConfig.workers.loaderConfig = {
    baseUrl: `${DEFAULT_WORKER_URL}dojo`,
    packages: [{
        name: 'esri',
        location: DEFAULT_WORKER_URL + 'esri'
    },
    {
        name: 'dojo',
        location: DEFAULT_WORKER_URL + 'dojo'
    },
    {
        name: 'dojox',
        location: DEFAULT_WORKER_URL + 'dojox'
    },
    {
        name: 'dijit',
        location: DEFAULT_WORKER_URL + 'dijit'
    },
    {
        name: 'dstore',
        location: DEFAULT_WORKER_URL + 'dstore'
    },
    {
        name: 'moment',
        location: DEFAULT_WORKER_URL + 'moment'
    },
    {
        name: '@dojo',
        location: DEFAULT_WORKER_URL + '@dojo'
    },
    {
        name: 'cldrjs',
        location: DEFAULT_WORKER_URL + 'cldrjs',
        main: 'dist/cldr'
    },
    {
        name: 'globalize',
        location: DEFAULT_WORKER_URL + 'globalize',
        main: 'dist/globalize'
    },
    {
        name: 'maquette',
        location: DEFAULT_WORKER_URL + 'maquette',
        main: 'dist/maquette.umd'
    },
    {
        name: 'maquette-css-transitions',
        location: DEFAULT_WORKER_URL + 'maquette-css-transitions',
        main: 'dist/maquette-css-transitions.umd'
    },
    {
        name: 'maquette-jsx',
        location: DEFAULT_WORKER_URL + 'maquette-jsx',
        main: 'dist/maquette-jsx.umd'
    },
    {
        name: 'tslib',
        location: DEFAULT_WORKER_URL + 'tslib',
        main: 'tslib'
    }
    ]
};
esriConfig.request.proxyUrl = '/proxy';
addProxyRule({
    urlPrefix: 'http://192.168.100.55:6080',
    proxyUrl: '/proxy'
});
