import Vueaxios from '@/utils/request'; // 'vue-axios';
import esriRequest from 'esri/request';
var splitSymbol = '_';
var cache = {};
var option = {};
// request
var getRes = function (opt) {
    option = opt;
    var promise = new Promise(function (resolve, reject) {
        if (!cache[option.SchemeID]) {
            var url = option.url;
            var content = {
                'f': 'pjson'
            };
            content[option.keyword] = option.SchemeID;
            // Vueaxios
            //     .get(url, { params: content })
            esriRequest(url,{query:content}).then(function (response) {
                  
                response = response.data;
                if (typeof response === 'string') { } else if (typeof response === 'object') { }
                if (response.ProcessState) {
                    // soe结果 缓存数据 检测是否需要列转行处理
                    response = JSON.parse(response.ProcessValue);
                    var checked = needPre(response.TableColumns);
                    if (checked) {
                        response = changecows(response.TableRows);
                    }
                } else if (response.status === 0) {
                    // 请求数据库的表结果
                    response = response.result;
                } else {
                    this
                        .$message
                        .error('请求统计结果失败！');
                    inject(null);
                    return;
                    // result occur some errer
                }
                cache[option.SchemeID] = response;
                // pie、bar、table、region处理
                var alldata = dealData(JSON.parse(JSON.stringify(response)));
                resolve(alldata);
            }.bind(this));
        } else {
            var temp = JSON.parse(JSON.stringify(cache[option.SchemeID]));
            // 保证legendZD一致
            if (temp.TableColumns) {
                var checked = needPre(temp.TableColumns);
            } else {
                option.legendZD = false;
            }
            // 一系列处理过程
            var alldata = dealData(temp);
            resolve(alldata);
        }
    });
    return promise;
};
// 处理返回所有的
var dealData = function (data) {
    var res = {};
    res.tableData = tableData(data);
    res.pieData = pieData(res.tableData);
    if (option.xzq) {
        res.region = getRegion(data);
    }
    // 按行政区处理bar
    if (option.barTypeXZQ) {
        res.barData = barDataXZQ(res.tableData)
    } else {
        res.barData = JSON.parse(JSON.stringify(res.pieData));
    }
    return res;
};

// soe的B模板，约定以下划线（——）隔开属性
var changecows = function (TableRows) {
    var re = {};
    TableRows.forEach(function (item, index, arr) {
        // 筛选过滤字段
        var isnopush = option
            .filter
            .find(x => JSON.stringify(item).indexOf(x) > -1);
        if (!isnopush) {
            var obj = {};
            for (var i in item) {
                if (i.indexOf(splitSymbol) > -1) {
                    var arr = i.split(splitSymbol);
                    if (!obj[arr[0]]) {
                        obj[arr[0]] = {};
                    }
                    obj[arr[0]][i] = item[i];
                }
            }
            var sz = [];
            for (var i in obj) {
                var arrObj = {};
                arrObj['name'] = i;
                for (const j in obj[i]) {
                    var tempArr = j.split(splitSymbol);
                    arrObj[tempArr[1]] = obj[i][j];
                    if (tempArr[2]) {
                        arrObj['code'] = tempArr[2];
                    }
                }
                // 筛选过滤字段
                var isnopush = option
                    .filter
                    .find(x => JSON.stringify(arrObj).indexOf(x) > -1);
                if (!isnopush) {
                    sz.push(arrObj);
                }
            }
            // keyname为关键筛选字段；//配置
            if (option.keyname) {
                re[item[option.keyname]] = sz;
            } else if (option.xzq) {
                // 默认行政区字段筛选
                re[item[option.xzq]] = sz;
            }
        }
    });
    return re;
};
// 求和行
var getsumItem = function (data) {
    var data = JSON.parse(JSON.stringify(data));
    var res = {};
    for (var i = 0; i < data.length; i++) {
        for (var p in data[i]) {
            if (!!option.xzq && p != option.xzq) {
                res[p] = res[p] || 0;
                res[p] = (!isNaN(parseFloat(data[i][p])))
                    ? parseFloat(data[i][p]) + parseFloat(res[p])
                    : data[i][p];
            }
        }
    }
    // return [res];
    return res;
};
// 筛选行政区
var getRegion = function (data) {
    var region = [];
    if (data.TableRows) {
        var tempdata = JSON.parse(JSON.stringify(data.TableRows));
    } else if (data.result) {
        var tempdata = JSON.parse(JSON.stringify(data.result.dataList));
    } else if (data) { // change cows
        var tempdata = JSON.parse(JSON.stringify(data));
        for (var i in tempdata) {
            var isnopush = option
                .filter
                .find(x => x == i);
            if (!isnopush) {
                region.push(i);
            }
        }
        return region;
    } else {
        return;
    }
    tempdata.forEach(function (item) {
        var isnopush = option
            .filter
            .find(x => JSON.stringify(item).indexOf(x) > -1);
        if (!isnopush) {
            region.push(item[option.xzq]);
        }
    });
    return region;
};
// 求合计--针对b模板
var sum = function (data) {
    var res = [];
    for (var j in data) {
        for (var i = 0; i < data[j].length; i++) {
            for (var p in data[j][i]) {
                res[i] = res[i] || {};
                res[i][p] = 0;
                res[i][p] = (!isNaN(parseFloat(data[j][i][p]))) ? Number(data[j][i][p]) + Number(res[i][p]) : data[j][i][p];
            }
        }
    }
    return res;
};
// 表格数据
var tableData = function (data) {
    var sz = [];
    if (!!data && !!data.TableRows && !!data.TableRows.length) {
        var tempdata = JSON.parse(JSON.stringify(data.TableRows));
    } else if (data.result && data.result.dataList) {
        var tempdata = JSON.parse(JSON.stringify(data.result.dataList));
    } else if (data) { // changecows
        var tempdata = JSON.parse(JSON.stringify(data));
    } else {
        return
    }
    // 只取soe中的总计项
    //   
    if (!tempdata.length) {
        var res = {};
        // 过滤行政区
        if (option.xzq && option.selectRegion.length) {
            option.selectRegion.forEach(function (arr) {
                res[arr] = tempdata[arr];
            });
            sz = sum(res);
        } else {
            sz = sum(tempdata);
        }
    } else {
        // 筛选过滤字段
        tempdata.forEach(function (arr) {
            var isnopush = option
                .filter
                .find(x => JSON.stringify(arr).indexOf(x) > -1);
            var isselect = true;
            // 过滤行政区
            if (option.xzq && option.selectRegion.length) {
                isselect = false;
                isselect = option
                    .selectRegion
                    .find(x => x == arr[option.xzq]);
            }
            if (!isnopush && !!isselect) {
                sz.push(arr);
            }
        });
    }

    return sz;
};
var pieData = function (data) {
    if (!data) {
        return;
    }
    // 总计行
    var sumitem = getsumItem(JSON.parse(JSON.stringify(data)));

    var arr = [];
    // 属性图表展示//需读取表头分类的情况
    if (option.legendZD) {
        var s = dealdatapie(JSON.parse(JSON.stringify(sumitem)));
        return s;
    }
    data.forEach(function (item) {
        var obj = {
            xzq: option.xzq
                ? item[option.xzq]
                : '',
            name: item.name,
            value: item[option.pieword]
        }
        arr.push(obj);
    })
    return arr;
};
// 处理每个piedata
var dealdatapie = function (arr) {
    var sum = [];
    for (var i = 0; i < option.legendZD.length; i++) {
        for (var p in option.legendZD[i]) {
            var a = option.legendZD[i][p];
            if (a.indexOf('+') > -1) {
                var s = '+';
                a = a.split('+');
            } else if (a.indexOf('-') > -1) {
                var s = '-';
                a = a.split('-');
            }
            if (s) { // 有计算公式
                for (var j = 0; j < a.length; j++) {
                    var value = value || 0;
                    if (s == '+') {
                        value = Number(arr[a[j]]) + value;
                    } else if (s == '-') {
                        value = value - Number(arr[a[j]]);
                    }
                }
            } else { // 仅字段
                var value = arr[a];
            }
        }
        var obj = {
            xzq: option.xzq
                ? arr[option.xzq]
                : '',
            name: p,
            value: value
        };
        sum.push(obj);
    }
    return sum
};
var barDataXZQ = function (data) {
    var temp = JSON.parse(JSON.stringify(data));
    if (option.legendZD) {
        var arr = [];
        temp.some(function (item, index) {
            var obj = dealdatapie(JSON.parse(JSON.stringify(item)));
            arr.push(obj);
        });
        //   
        return arr;
    } else {
        return null
    }
};

var needPre = function (TableColumns) {
    // 每一个都包含字符_时返回true 部分包含时，判断为属性对比，非行政区对比|this.legendZD
    var x = false;
    TableColumns.some(function (item) {
        for (var i in item) {
            if (i.indexOf(splitSymbol) != -1) {
                x = true;
            }
        }
    })
    return (!option.legendZD && !!x)
};
export default { getRes: getRes }
