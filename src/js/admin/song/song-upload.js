import $ from 'jquery';
import * as qiniu from 'qiniu-js';
import { getToken } from '../../public/service';

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
    },
    show() {
      this.el.show()
    },
    hide() {
      this.el.hide()
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
      this.eventHubOn();
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
      getToken(this.bindFileChange, this)
    },
    bindFileChange(token, putExtra, config) {
      this.view.el.on("change", "#select-file", (e)=> {
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
    },
    eventHubOn() {
      window.eventHub.on('select-menu', (menu)=> {
        if(menu==='song-manage') {
          this.view.show()
        }else {
          this.view.hide()
        }
      })
    }
  }
  controller.init(view, model)
}