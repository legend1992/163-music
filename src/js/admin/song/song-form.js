import $ from 'jquery';
import { patchValue } from '../../public/public-method';
import { getToken } from '../../public/service';
import * as qiniu from 'qiniu-js';
const AV = require('leancloud-storage');
const SaveSongsObj = AV.Object.extend('Songs');

{
  let view = {
    el: $('#song-form-section'),
    template: `
      <h1>__title__</h1>
      <form>
        <div class="row require">
          <label>
            <span>歌名</span><input type="text" placeholder="请输入歌名" name="name" value="__name__">
          </label>
          <div class="explain">请输入歌名</div>
        </div>
        <div class="row">
          <label>
            <span>歌手</span><input type="text" placeholder="请输入歌手名" name="singer" value="__singer__">
          </label>
        </div>
        <div class="row">
          <label>
            <span>专辑</span><input type="text" placeholder="请输入专辑名" name="album" value="__album__">
          </label>
        </div>
        <div class="row">
          <label>
            <span>备注</span><input type="text" placeholder="请输入备注" name="remark" value="__remark__">
          </label>
        </div>
        <div class="row big-row">
          <label>
            <span>封面外链</span><input type="text" placeholder="网络资源可直接填写地址，本地资源请在下方上传" name="cover_url" value="__cover_url__">
          </label>
          <div class="upload-input-wrapper">
            <p>选择图片</p>
            <input type="file" id="select-file" accept="image/*">
            <div class="progress"></div>
          </div>
        </div>
        <div class="row require big-row">
          <label>
            <span>歌曲外链</span><input type="text" placeholder="网络资源可直接填写地址，本地资源请在下方上传" name="url" value="__url__">
          </label>
          <div class="explain">请输入歌曲外链</div>
        </div>
        <div class="row">
          <label>
            <span>歌词</span><textarea rows="10" cols="60" name="lyrics">__lyrics__</textarea>
          </label>
        </div>
        <div class="row button-wrapper">
          <span id="save" class="button"><div class="loader-wrapper2"><div class="loader">Loading...</div></div>提交</span>
        </div>
      </form>
    `,
    render(data) {
      let { songId, songInfo } = data;
      let html = this.template;
      let title = songId ? '编辑歌曲' : '新建歌曲';
      html = html.replace('__title__', title);
      for(let key in songInfo) {
        html = html.replace(`__${key}__`, songInfo[key].value)
      }
      this.el.html(html)
    },
    highlightInput(key) {
      this.el.find(`input[name=${key}]`).closest('.row').addClass('error')
    },
    downplayInput(e) {
      let row = $(e.target).closest('.row');
      if(e.target.value) {
        if(row.hasClass('error')) {
          row.removeClass('error')
        }
      }else {
        row.addClass('error')
      }
    },
    unLoading() {
      this.el.find('#save').removeClass('loading');
    },
    loading() {
      this.el.find('#save').addClass('loading');
    },
    drawProgress(percent) {
      this.el.find('.progress').css({
        width: `${percent}%`,
        opacity: `${percent/100}`
      })
    },
    uploading() {
      let textEle = this.el.find('.upload-input-wrapper p');
      textEle.text('上传中').next('input').hide();
    },
    uploadSuccess(res) {
      let textEle = this.el.find('.upload-input-wrapper p');
      textEle.text('上传成功');
      setTimeout(() => {
        textEle.text('选择图片').next('input').show().next('.progress').css({
          width: `0%`,
          opacity: `0`
        });
      }, 1000);
      this.el.find('input[name="cover_url"]').val(`http://pjrjfrnv0.bkt.clouddn.com/${res.key}`)
    }
  }
  let model = {
    data: {
      songId: undefined,
      songInfo: {
        name: {value:'', require: true},
        singer: {value:''},
        album: {value:''},
        remark: {value:''},
        cover_url: {value:''},
        lyrics: {value:''},
        url: {value:'', require: true}
      },
      loading: false
    },
    modify() {
      let song = AV.Object.createWithoutData('Songs', this.data.songId);
      for (let key in this.data.songInfo) {
        song.set(key, this.data.songInfo[key].value);
      }
      return song.save().then(function (data) {
        return data
      }, function (error) {
        console.error('Failed to ModifySongsObj: ' + error.message);
      })
    },
    save() {
      let Songs = new SaveSongsObj();
      for (let key in this.data.songInfo) {
        Songs.set(key, this.data.songInfo[key].value);
      }
      return Songs.save().then(function (data) {
        return data
      }, function (error) {
        console.error('Failed to SaveSongsObj: ' + error.message);
      });
    },
    reset() {
      this.data = {
        songId: undefined,
        songInfo: {
          name: {value:'', require: true},
          singer: {value:''},
          album: {value:''},
          remark: {value:''},
          cover_url: {value:''},
          lyrics: {value:''},
          url: {value:'', require: true}
        },
        loading: false
      }
    }
  }
  let controller = {
    init(view, model) {
      this.view = view;
      this.model = model;
      this.view.render(this.model.data);
      this.getToken();
      this.bindEvents();
      this.eventHubOn();
    },
    bindEvents() {
      this.saveSong();
      this.inputKeyUp();
    },
    getToken() {
      getToken((token, putExtra, config)=> {
        this.bindFileChange(token, putExtra, config)
      })
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
              this.view.uploadSuccess(res);
            }
          )
          this.view.uploading();
        }
      })
    },
    saveSong() {
      this.view.el.on('click', '#save',(e)=> {
        for (let key in this.model.data.songInfo) {
          this.model.data.songInfo[key].value = this.view.el.find(`[name=${key}]`).val()
        }
        if(this.verifyInfo(this.model.data.songInfo) && !this.model.data.loading) {
          this.model.data.loading = true;
          this.view.loading();
          if(this.model.data.songId) {
            this.model.modify().then((data)=> {
              setTimeout(() => {
                this.model.data.loading = false;
                window.eventHub.emit('modify-song-success', data);
                this.view.unLoading()
              }, 500);
            })
          }else {
            this.model.save().then((data)=> {
              setTimeout(() => {
                window.eventHub.emit('add-song-success', data);
                this.reset()
              }, 500);
            })
          }
        }
      })
    },
    verifyInfo(songInfo) {
      let verify = true;
      for(let key in songInfo) {
        if(songInfo[key].require && !songInfo[key].value) {
          this.view.highlightInput(key);
          verify = false;
        }
      }
      return verify;
    },
    inputKeyUp() {
      this.view.el.on('keyup', '.row.require input[type="text"]', (e)=> {
        this.view.downplayInput(e)
      })
    },
    eventHubOn() {
      window.eventHub.on('edit-song', (data)=> {
        this.reset();
        this.model.data.songId = data.id;
        patchValue(this.model.data.songInfo, data);
        this.view.render(this.model.data);
      })
      window.eventHub.on('create-song', ()=> {
        this.reset()
      })
      window.eventHub.on('upload-success', (res)=> {
        patchValue(this.model.data.songInfo, {
          name: res.key,
          url: `http://pjrjfrnv0.bkt.clouddn.com/${encodeURIComponent(res.key)}`
        });
        this.view.render(this.model.data)
      })
      window.eventHub.on('song-list-empty', ()=> {
        this.reset()
      })
    },
    reset() {
      this.model.reset();
      this.view.render(this.model.data);
    }
  }
  controller.init(view, model)
}