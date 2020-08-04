<template>
  <div>
    <button
      id="screenshotBtn"
      class="action-button esri-widget"
      :class="{active: active}"
      aria-label="选择屏幕截图区域"
      title="选择屏幕截图区域"
      @click="areaSelection"
    >选择屏幕截图区域</button>
    <div id="screenshotDiv" class="screenshotDiv" :class="{hide: hide}">
      <img class="js-screenshot-image" :width="width" :height="height" :src="src">
      <div>
        <label>设置要在图像上显示的文本：</label>
        <input id="textInput" v-model="textInput" type="text" placeholder="图像文本" autofocus>
      </div>
      <button
        id="downloadBtn"
        ref="downloadBtn"
        class="action-button"
        aria-label="下载图像"
        title="下载图像"
      >下载图像</button>
      <button
        id="closeBtn"
        class="action-button"
        aria-label="返回视图"
        title="返回视图"
        @click="hidePreview"
      >返回视图</button>
    </div>
    <div id="maskDiv" ref="maskDiv" class="maskDiv screenshotCursor" />
  </div>
</template>

<script>
export default {
    name: 'Screenshot',
    data() {
        return {
            active: false,
            hide: true,
            width: '',
            height: '',
            src: '',
            textInput: '',
            view: null
        }
    },

    mounted() {
    // this.view = this.$store.getters.view;
    },

    methods: {
        areaSelection() {
            this.active = true;
            var view = this.view;

            view.container.classList.add('screenshotCursor');
            let area = null;

            // listen for drag events and compute the selected area
            const dragHandler = view.on('drag', function(event) {
            // prevent navigation in the view
                event.stopPropagation();

                // when the user starts dragging or is dragging
                if (event.action !== 'end') {
                    // calculate the extent of the area selected by dragging the cursor
                    const xmin = clamp(
                        Math.min(event.origin.x, event.x),
                        0,
                        view.width
                    );
                    const xmax = clamp(
                        Math.max(event.origin.x, event.x),
                        0,
                        view.width
                    );
                    const ymin = clamp(
                        Math.min(event.origin.y, event.y),
                        0,
                        view.height
                    );
                    const ymax = clamp(
                        Math.max(event.origin.y, event.y),
                        0,
                        view.height
                    );
                    area = {
                        x: xmin,
                        y: ymin,
                        width: xmax - xmin,
                        height: ymax - ymin
                    };
                    var correctArea = {
                        x: xmin + this.view.position[0],
                        y: ymin + this.view.position[1],
                        width: xmax - xmin,
                        height: ymax - ymin
                    };
                    // set the position of the div element that marks the selected area
                    setMaskPosition.call(this, correctArea);
                } else {
                // when the user stops dragging
                    // remove the drag event listener from the SceneView
                    dragHandler.remove();
                    // the screenshot of the selected area is taken
                    view
                        .takeScreenshot({ area: area, format: 'png' })
                        .then(function(screenshot) {
                            // display a preview of the image
                            this.showPreview(screenshot);
                            this.screenshot = screenshot;
                            // create the image for download
                            this.$refs.downloadBtn.onclick = function() {
                                const text = document.getElementById('textInput').value;
                                // if a text exists, then add it to the image
                                if (text) {
                                    const dataUrl = this.getImageWithText(screenshot, text);
                                    this.downloadImage(
                                        'screenshot-' + text + '.png',
                                        dataUrl
                                    );
                                } else {
                                // otherwise download only the webscene screenshot
                                    this.downloadImage(
                                        'screenshot' + '.png',
                                        screenshot.dataUrl
                                    );
                                }
                            }.bind(this);

                            // the screenshot mode is disabled
                            this.active = false;
                            view.container.classList.remove('screenshotCursor');
                            setMaskPosition.call(this, null);
                        }.bind(this));
                }
            }.bind(this))

            function setMaskPosition(area) {
                var maskDiv = this.$refs.maskDiv;
                if (area) {
                    maskDiv.classList.remove('hide');
                    maskDiv.style.left = area.x + 'px';
                    maskDiv.style.top = area.y + 'px';
                    maskDiv.style.width = area.width + 'px';
                    maskDiv.style.height = area.height + 'px';
                } else {
                    maskDiv.classList.add('hide');
                }
            }

            function clamp(value, from, to) {
                return value < from ? from : value > to ? to : value;
            }
        },
        showPreview(screenshot) {
            this.hide = false;
            this.width = screenshot.data.width;
            this.height = screenshot.data.height;
            this.src = screenshot.dataUrl;
        },
        getImageWithText(screenshot, text) {
            const imageData = screenshot.data;

            // to add the text to the screenshot we create a new canvas element
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = imageData.height;
            canvas.width = imageData.width;

            // add the screenshot data to the canvas
            context.putImageData(imageData, 0, 0);
            context.font = '20px Arial';
            context.fillStyle = '#000';
            context.fillRect(
                0,
                imageData.height - 40,
                context.measureText(text).width + 20,
                30
            );

            // add the text from the textInput element
            context.fillStyle = '#fff';
            context.fillText(text, 10, imageData.height - 20);

            return canvas.toDataURL();
        },
        downloadImage(filename, dataUrl) {
            // the download is handled differently in Microsoft browsers
            // because the download attribute for <a> elements is not supported
            if (!window.navigator.msSaveOrOpenBlob) {
            // in browsers that support the download attribute
            // a link is created and a programmatic click will trigger the download
                const element = document.createElement('a');
                element.setAttribute('href', dataUrl);
                element.setAttribute('download', filename);
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            } else {
            // for MS browsers convert dataUrl to Blob
                const byteString = atob(dataUrl.split(',')[1]);
                const mimeString = dataUrl
                    .split(',')[0]
                    .split(':')[1]
                    .split(';')[0];
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                const blob = new Blob([ab], { type: mimeString });

                // download file
                window.navigator.msSaveOrOpenBlob(blob, filename);
            }
        },
        hidePreview() {
            this.hide = true;
        }
    }
}
</script>

<style lang='scss' scoped>
.screenshotDiv {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.8);
}

.hide {
  display: none;
}

img {
  border: 10px solid white;
  box-shadow: 2px 2px 5px 0 rgba(0, 0, 0, 0.5);
}

.screenshotDiv > * {
  margin: 0.5em;
}

.screenshotCursor {
  cursor: crosshair;
}

.action-button {
  padding: 0.6em;
  border: 1px solid #0079c1;
  text-align: center;
  background-color: white;
  cursor: pointer;
}

.action-button:hover,
.action-button:focus {
  background: #0079c1;
  color: white;
}

.maskDiv {
  position: absolute;
  background: rgba(255, 51, 0, 0.1);
  border: 2px dashed rgb(255, 51, 0);
}
</style>
