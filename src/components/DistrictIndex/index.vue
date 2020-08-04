<template>
  <div v-clickoutside="handleClose">
    <div class="citychangeopt" :class="{ em:show }" @click="show=!show">
      <span class="adjustpadding" />
      <span class="weather-item" />
      <a href="#" class="ui3-city-change-inner ui3-control-shadow">
        <span>{{ CurCityInfo }}</span>
        <em />
      </a>
    </div>
    <div v-show="show" class="map_popup">
      <div class="popup_main">
        <div class="title">城市列表</div>
        <div class="content">
          <div class="sel_city blueC">
            <div>
              <div class="sel_city_default">
                <p class="CurCityInfo">
                  <span>
                    当前城市：
                    <span>{{ CurCityInfo }}</span>
                  </span>
                </p>
              </div>
              <div class="sel-city-hotcity">
                <a
                  v-for="(item,index) in selCityHotCityId"
                  :key="index"
                  name="item"
                  href="javascript:void(0)"
                  @click="position(item);CurCityInfo=item;"
                >{{ item }}</a>
              </div>
              <div style="border-top:1px solid #CCC;padding-bottom:10px;" />
            </div>
            <div class="selCityPlaceList">
              <table
                style="border-collapse:collapse;border-spacing:0;"
                cellpadding="0"
                cellspacing="0"
              >
                <tbody>
                  <template v-for="(item, index) in items">
                    <tr :key="2*index">
                      <td class="sel-city-td-sf">
                        <a
                          href="javascript:void(0)"
                          @click="position(item.name);CurCityInfo=item.name;"
                        >{{ item.name }}:</a>
                      </td>
                      <td class="sel-city-td-item">
                        <a
                          v-for="(it, idx) in item.children"
                          :key="idx"
                          href="javascript:void(0)"
                          @click="position(it.name);CurCityInfo=it.name;"
                        >{{ it.name }}</a>
                      </td>
                    </tr>
                    <tr :key="2*index+1">
                      <td colspan="2">
                        <div class="sel-city-tr-splitline">{{ item.name }}</div>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <button id="popup_close" title="关闭" @click="show=false" />
      </div>
      <div class="poput_shadow" style="height: 393px;" />
    </div>
  </div>
</template>

<script>
const clickoutside = {
    // 初始化指令
    bind(el, binding, vnode) {
        function documentHandler(e) {
            // 这里判断点击的元素是否是本身，是本身，则返回
            if (el.contains(e.target)) {
                return false;
            }
            // 判断指令中是否绑定了函数
            if (binding.expression) {
                // 如果绑定了函数 则调用那个函数，此处binding.value就是handleClose方法
                binding.value(e);
            }
        }
        // 给当前元素绑定个私有变量，方便在unbind中可以解除事件监听
        el.__vueClickOutside__ = documentHandler;
        document.addEventListener('click', documentHandler);
    },
    update() {},
    unbind(el, binding) {
    // 解除事件监听
        document.removeEventListener('click', el.__vueClickOutside__);
        delete el.__vueClickOutside__;
    }
};
export default {
    name: 'Districtindex',
    directives: { clickoutside },
    data() {
        return {
            show: false,
            CurCityInfo: '北京',
            selCityHotCityId: [
                '全国',
                '北京',
                '上海',
                '广州',
                '深圳',
                '成都',
                '天津',
                '南京',
                '杭州',
                '武汉'
            ],
            items: [
                {
                    name: '安徽',
                    children: [
                        {
                            name: '合肥'
                        },
                        {
                            name: '安庆'
                        },
                        {
                            name: '蚌埠'
                        },
                        {
                            name: '亳州'
                        },
                        {
                            name: '巢湖'
                        },
                        {
                            name: '池州'
                        },
                        {
                            name: '滁州'
                        },
                        {
                            name: '阜阳'
                        },
                        {
                            name: '淮北'
                        },
                        {
                            name: '淮南'
                        },
                        {
                            name: '黄山'
                        },
                        {
                            name: '六安'
                        },
                        {
                            name: '马鞍山'
                        },
                        {
                            name: '宿州'
                        },
                        {
                            name: '铜陵'
                        },
                        {
                            name: '芜湖'
                        },
                        {
                            name: '宣城'
                        }
                    ]
                },
                {
                    name: '福建',
                    children: [
                        {
                            name: '福州'
                        },
                        {
                            name: '龙岩'
                        },
                        {
                            name: '南平'
                        },
                        {
                            name: '宁德'
                        },
                        {
                            name: '莆田'
                        }
                    ]
                }
            ]
        };
    },
    mounted() {},
    methods: {
        handleClose(e) {
            this.show = false;
        },
        position: function(name) {}
    }
};
</script>

<style lang="scss" scoped>
.citychangeopt {
  line-height: 22px;
  display: inline-block;
  // float: left;
  border-radius: 2px;
  box-shadow: 1px 2px 1px rgba(0, 0, 0, 0.15);
}
.adjustpadding {
  float: left;
  width: 5px;
  height: 34px;
  border-radius: 2px 0 0 2px;
  padding-left: 7px;
  background: #fff;
}
.weather-item {
  display: inline-block;
  line-height: 17px;
  height: 34px;
  background-color: #fff;
  text-decoration: none;
  vertical-align: middle;
  // float: left;
}
.ui3-city-change-inner {
  // float: left;
  display: inline-block;
  padding-right: 12px;
  height: 34px;
  line-height: 34px;
  background-color: #fff;
  color: #666;
  font-size: 12px;
  text-decoration: none;
  vertical-align: middle;
  position: relative;
}
.ui3-city-change-inner span {
  font-size: 12px;
  float: left;
}
.ui3-city-change-inner em {
  width: 7px;
  height: 7px;
  margin-left: 5px;
  float: left;
  margin-top: 13px;
  background-image: url(../../assets/images/baidumap/newtools_cc97086.png);
  background-repeat: no-repeat;
  background-position: -13px -17px;
}
.citychangeopt.em .ui3-city-change-inner em {
  background-position: -12px -177px;
}
.map_popup {
  font-size: 12px;
  color: #4c4c4c;
  font-family: Arial, Helvetica, SimSun, sans-serif;
  position: absolute;
  z-index: 50000;
  width: 355px;
  display: block;
  height: 393px;
  right: 79px;
  top: 47px;
}
.map_popup .popup_main {
  z-index: 2;
  position: absolute;
  width: 100%;
  height: 100%;
  background: #fff;
  overflow: hidden;
  box-shadow: 1px 2px 1px rgba(0, 0, 0, 0.15);
}
.map_popup .title {
  border-bottom: 1px solid #dadada;
  height: 25px;
  line-height: 25px;
  font-size: 12px;
  color: #4c4c4c;
  padding-left: 7px;
}
.content {
  height: 369px;
  overflow: hidden;
}
.map_popup button {
  position: absolute;
  z-index: 50;
  top: 7px;
  right: 6px;
  width: 12px;
  height: 12px;
  background: url(../../assets/images/baidumap/popup_close_15d2283.gif)
    no-repeat;
  border: 0;
  cursor: pointer;
  padding: 0;
}
.sel_city {
  margin: 7px 5px 5px;
}
.selCityPlaceList {
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  height: 255px;
}
.sel-city-tr-splitline {
  height: 12px;
  visibility: hidden;
}
.sel-city-td-sf {
  vertical-align: top;
  padding: 3px 14px 0 7px;
  font-weight: 700;
  padding-right: 8px;
}
.sel-city-td-sf a {
  outline: 0;
  cursor: pointer;
  color: #3d6dcc;
  text-decoration: none;
  line-height: 18px;
  white-space: nowrap;
}
.sel-city-td-item {
  padding-top: 3px;
}
.sel-city-td-item a {
  font-size: 12px;
  outline: 0;
  cursor: pointer;
  color: #3d6dcc;
  text-decoration: none;
}
.sel_city a {
  white-space: nowrap;
  margin-right: 9px;
  line-height: 18px;
}
.sel-city-hotcity {
  padding: 0 5px;
  margin: 0 11px 10px;
}
.sel-city-hotcity a {
  outline: 0;
  cursor: pointer;
  color: #3d6dcc;
  text-decoration: none;
  white-space: nowrap;
  line-height: 18px;
  margin-right: 5px;
}
.sel_city_default {
  display: block;
  border-bottom: 1px solid #ccc;
  padding: 7px 0 13px 5px;
  margin-bottom: 13px;
  line-height: 22px;
}
.CurCityInfo {
  margin: 0;
}
</style>
