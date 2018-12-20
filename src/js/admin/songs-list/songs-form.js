import $ from 'jquery';
import { patchValue } from '../../public/public-method';
import { getToken } from '../../public/service';
import * as qiniu from 'qiniu-js';
const AV = require('leancloud-storage');
const SaveSongsListObj = AV.Object.extend('SongsList');

{
  let view = {
    el: $('#songs-form-section'),
    template: `
      <h1>__title__</h1>
      <form>
        <div class="row require">
          <label>
            <span>歌单名</span><input type="text" placeholder="请输入歌单名" name="name" value="__name__">
          </label>
          <div class="explain">请输入歌单名</div>
        </div>
        <div class="row">
          <label>
            <span>标签</span><input type="text" placeholder="请输入标签" name="label" value="__label__">（以英文逗号分隔，不超过3个）
          </label>
        </div>
        <div class="row big-row">
          <label>
            <span>封面链接</span><input type="text" placeholder="网络图片可直接填写地址，本地图片请点击右侧上传" name="cover_url" value="__cover_url__">
          </label>
          <div class="upload-input-wrapper">
            <p>选择图片</p>
            <input type="file" id="select-file" accept="image/*">
            <div class="progress"></div>
          </div>
        </div>
        <div class="row">
          <label>
            <span>简介</span><textarea rows="10" cols="60" name="intro">__intro__</textarea>
          </label>
        </div>
        <div class="row button-wrapper">
          <span id="save" class="button"><div class="loader-wrapper2"><div class="loader">Loading...</div></div>提交</span>
        </div>
      </form>
      <ul id="song-list"></ul>
    `,
    render(data) {
      let { songsId, songsInfo } = data;
      let html = this.template;
      let title = songsId ? '编辑歌单<button id="edit-list" class="right">编辑列表</button>' : '新建歌单';
      html = html.replace('__title__', title);
      for(let key in songsInfo) {
        html = html.replace(`__${key}__`, songsInfo[key].value)
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
  };
  let model = {
    data: {
      songsId: undefined,
      songsInfo: {
        name: {value:'', require: true},
        label: {value:''},
        intro: {value:''},
        cover_url: {value:''}
      },
      loading: false
    },
    modify() {
      let songs = AV.Object.createWithoutData('SongsList', this.data.songsId);
      for (let key in this.data.songsInfo) {
        songs.set(key, this.data.songsInfo[key].value);
      }
      return songs.save().then(function (data) {
        return data
      }, function (error) {
        console.error('Failed to ModifySongsListObj: ' + error.message);
      })
    },
    save() {
      let SongsList = new SaveSongsListObj();
      for (let key in this.data.songsInfo) {
        SongsList.set(key, this.data.songsInfo[key].value);
      }
      return SongsList.save().then(function (data) {
        return data
      }, function (error) {
        console.error('Failed to SaveSongsListObj: ' + error.message);
      })
    },
    // findAll() {
    //   let SongsList = new AV.Query('SongsList');
    //   return SongsList.find().then((songsList)=> {
    //     this.data.songsList = songsList.map((songs)=> {
    //       return { id: songs.id, ...songs.attributes }
    //     })
    //   }, function (error) {
    //     console.error('歌单列表获取失败:', error)
    //   })
    // },
    reset() {
      this.data = {
        songsId: undefined,
        songsInfo: {
          name: {value:'', require: true},
          label: {value:''},
          intro: {value:''},
          cover_url: {value:''}
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
    saveSong() {
      this.view.el.on('click', '#save',(e)=> {
        for (let key in this.model.data.songsInfo) {
          this.model.data.songsInfo[key].value = this.view.el.find(`[name=${key}]`).val()
        }
        if(this.verifyInfo(this.model.data.songsInfo) && !this.model.data.loading) {
          this.model.data.loading = true;
          this.view.loading();
          if(this.model.data.songsId) {
            this.model.modify().then((data)=> {
              setTimeout(() => {
                this.model.data.loading = false;
                window.eventHub.emit('modify-songs-success', data);
                this.view.unLoading()
              }, 500);
            })
          }else {
            this.model.save().then((data)=> {
              setTimeout(() => {
                window.eventHub.emit('add-songs-success', data);
                this.reset()
              }, 500);
            })
          }
        }
      })
    },
    verifyInfo(songsInfo) {
      let verify = true;
      for(let key in songsInfo) {
        if(songsInfo[key].require && !songsInfo[key].value) {
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
              this.view.uploadSuccess(res);
            }
          )
          this.view.uploading();
        }
      })
    },
    eventHubOn() {
      window.eventHub.on('edit-songs', (data)=> {
        this.model.data.songsId = data.id;
        patchValue(this.model.data.songsInfo, data);
        this.view.render(this.model.data);
      })
      window.eventHub.on('create-songs', ()=> {
        this.reset()
      })
      window.eventHub.on('songs-list-empty', ()=> {
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