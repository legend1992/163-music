import $ from '../../node_modules/jquery/dist/jquery';
import { patchValue } from './public/public-method';
const AV = require('leancloud-storage');
const SaveSongsObj = AV.Object.extend('Songs');

{
  let view = {
    el: $('#section'),
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
        <div class="row require">
          <label>
            <span>歌曲外链</span><input type="text" placeholder="请输入歌曲外链" name="url" value="__url__">
          </label>
          <div class="explain">请输入歌曲外链</div>
        </div>
        <div class="row button-wrapper">
          <span id="save" class="button">提交</span>
        </div>
      </form>
    `,
    render(songId, songInfo) {
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
    }
  };
  let model = {
    data: {
      songId: undefined,
      songInfo: {
        name: {value:'', require: true},
        singer: {value:''},
        url: {value:'', require: true}
      }
    },
    modify() {
      let Songs = AV.Object.createWithoutData('Songs', this.data.songId);
      for (let key in this.data.songInfo) {
        Songs.set(key, this.data.songInfo[key].value);
      }
      Songs.save().then(function (data) {
        window.eventHub.emit('modify-success', data)
      }, function (error) {
        console.error('Failed to ModifySongsObj: ' + error.message);
      })
    },
    save() {
      let Songs = new SaveSongsObj();
      for (let key in this.data.songInfo) {
        Songs.set(key, this.data.songInfo[key].value);
      }
      Songs.save().then(function (data) {
        window.eventHub.emit('add-success', data)
      }, function (error) {
        console.error('Failed to SaveSongsObj: ' + error.message);
      });
    },
    reset() {
      this.data.songId = undefined;
      this.data.songInfo = {
        name: {value:'', require: true},
        singer: {value:''},
        url: {value:'', require: true}
      }
    }
  }
  let controller = {
    init(view, model) {
      this.view = view;
      this.model = model;
      this.view.render(this.model.data.songId, this.model.data.songInfo);
      this.bindEvents();
      this.eventHubOn();
    },
    bindEvents() {
      this.saveSong();
      this.inputKeyUp();
    },
    saveSong() {
      this.view.el.on('click', '#save',()=> {
        for (let key in this.model.data.songInfo) {
          this.model.data.songInfo[key].value = this.view.el.find(`input[name=${key}]`).val()
        }
        if(this.verifyInfo(this.model.data.songInfo)) {
          if(this.model.data.songId) {
            this.model.modify()
          }else {
            this.model.save()
          }
        };
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
      this.view.el.find('.row.require input[type="text"]').keyup((e)=> {
        let row = $(e.target).closest('.row');
        if(e.target.value) {
          if(row.hasClass('error')) {
            row.removeClass('error')
          }
        }else {
          row.addClass('error')
        }
      })
    },
    eventHubOn() {
      window.eventHub.on('edit-song', (data)=> {
        this.model.data.songId = data.id;
        let { songId, songInfo } = this.model.data;
        patchValue(songInfo, data);
        this.view.render(songId, songInfo);
      })
      window.eventHub.on('create-song', ()=> {
        this.model.reset();
        let { songId, songInfo } = this.model.data;
        this.view.render(songId, songInfo);
      })
    }
  }
  controller.init(view, model)
}