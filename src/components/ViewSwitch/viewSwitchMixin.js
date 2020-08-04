
import {mapGetters} from 'vuex';
export default{
    data() {
        return {
            icon:'icon2D',
            label:'2D'
        }
    },
    computed: {
        ...mapGetters(['splitStatus','layerController','viewType']),
    },
    mounted() {
        // this.view = this.$store.getters.view;
        // this.view.watch('camera', (e) => {
        //     let newType;
        //     if (e.tilt < 10) {
        //         newType = '2D'
        //     } else {2
        //         newType = '3D'
        //     }
        //     if (newType !== this.viewType) {
        //         this.$store.dispatch('map/setViewType', newType);
        //     }
        // })
    },

    methods: {
        setcamera() {
            if(this.viewType == "3D"){
                this.view.goTo({ tilt: 0 });
            }else{
                this.view.goTo({ tilt: 45 })
            }
        }
    },
    watch:{
        viewType(n,o){
            if(n == "2D"){
                // this.layerController.setBaseMap(this.basemaps,n);
                this.layerController.close3DLayers();
            }else{
                let layers = [];
                // this.cartList.forEach(e=>{
                //     if(e.children && e.children.length > 0){
                //         layers = [...layers,...e.children];
                //     }
                // });
                // this.layerController.setBaseMap(this.basemaps,n);
                this.layerController.openLayers(layers);
            }
        }
    }
}