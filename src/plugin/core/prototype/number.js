/*
 * updated by jiangxb on 2017/6/21
 * -------------------------------------------------
 * 扩展原型类:
 * 扩展原型常用方法
 *
 */

/* eslint-disable no-extend-native */

/**
 * 毫秒数转日期
 * @formatStr: 格式化参数, 默认yyyy-MM-dd HH:mm
 * ex:         1483943989639.toDate()  =>  Mon Jan 09 2017 14:39:49 GMT+0800 (中国标准时间)
 */
Number.prototype.toDate = function() {
    return new Date(this)
}

/**
 * 数字格式化
 * @num : 数字字符串
 * @precision : 精确小数位数
 * @separator : 分隔符
 * return : 格式化后的数字字符串
 * ex: formatNum(10000) => "10, 000"
 *     (10000, 2) => "10, 000.00"
 *     (.123456, 2, ' ') => "0.12"
 *     (56., 0, ' ') => "56"
 *     ('56.a') => 56.a
 */
Number.prototype.formatNum = function(precision = 2, separator) {
    let num = this
    if (!isNaN(parseFloat(num)) && isFinite(num)) {
        let parts
        num = Number(num)
        num = (typeof precision !== 'undefined' ? num.toFixed(precision) : num).toString()
        parts = num.split('.')
        parts[0] = parts[0].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + (separator || ', '))
        return parts.join('.')
    } else {
        return '-'
    }
}
