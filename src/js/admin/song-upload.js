import $ from '../../../node_modules/jquery/dist/jquery';
import * as qiniu from 'qiniu-js';

{
  let view = {
    el: $('#footer'),
    render(config, isSuccess=false) {
      let pEle = this.el.find('.input-wrapper').find('p');
      let inputEle = this.el.find('input[type=file]');
      let { text, showInput, percent } = config;
      if(isSuccess) {
        pEle.text('上传成功')
        setTimeout(()=> {
          pEle.text(text)
        }, 1000)
      }else {
        pEle.text(text)
      }
      if(showInput) {
        inputEle.show()
      }else {
        inputEle.hide()
      }
      this.drawProgress(percent);
    },
    drawProgress(percent) {
      this.el.find('.progress').css({
        width: `${percent}%`,
        opacity: `${percent/100}`
      })
    }
  };
  let model = {
    data: {}
  };
  let controller = {
    init(view, model) {
      this.view = view;
      this.model = model;
      this.getToken();
    },
    uploadSuccess(res) {
      window.eventHub.emit('upload-success', res);
      this.view.render({
        text: '上传（点击或拖拽上传）',
        showInput: true,
        percent: 0
      }, true)
    },
    getToken() {
      $.ajax({
        url: "http://localhost:8888/api/uptoken",
        success: (res) => {
          let { token } = JSON.parse(res);
          let config = {
            useCdnDomain: false,
            disableStatisticsReport: false,
            retryCount: 6,
            region: undefined
          };
          let putExtra = {
            fname: "",
            params: {},
            mimeType: null
          };
          this.uploadWithSDK(token, putExtra, config);
        }
      })
    },
    uploadWithSDK(token, putExtra, config) {
      $("#select-file").on("change", (e)=> {
        let file = e.target.files[0];
        if (file) {
          let observable = qiniu.upload(file, file.name, token, putExtra, config);
          observable.subscribe(
            (res)=> {
              this.view.drawProgress(res.total.percent);
            },
            (err)=> {
              alert("上传出错", err)
            },
            (res)=> {
              this.uploadSuccess(res);
            }
          )
          this.view.render({
            text: '上传中...',
            showInput: false,
            percent: 0
          })
        }
      })
    }
  }
  controller.init(view, model)
}