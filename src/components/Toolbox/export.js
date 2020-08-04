import html2canvas from 'html2canvas';
// 导出图片
function exportmapbyweb(dom, filename) {
    html2canvas(dom).then((canvas) => {
        document.body.appendChild(canvas);
        var url = canvas.toDataURL('image/jpeg');
        saveFile(url, filename || '图片');
        document.body.removeChild(canvas);
    });
}
// 保存文件
function saveFile(data, filename) {
    var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
    save_link.href = data;
    save_link.download = filename;
    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    save_link.dispatchEvent(event);
}
export default {
    exportmapbyweb: exportmapbyweb
}
