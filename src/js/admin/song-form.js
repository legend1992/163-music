import $ from '../../../node_modules/jquery/dist/jquery';
import { patchValue } from '../public/public-method';
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
      $('#save').removeClass('loading');
    },
    loading() {
      $('#save').addClass('loading');
    }
  };
  let model = {
    data: {
      songId: undefined,
      songInfo: {
        name: {value:'', require: true},
        singer: {value:''},
        url: {value:'', require: true}
      },
      loading: false
    },
    modify() {
      let Songs = AV.Object.createWithoutData('Songs', this.data.songId);
      for (let key in this.data.songInfo) {
        Songs.set(key, this.data.songInfo[key].value);
      }
      return Songs.save().then(function (data) {
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
      this.bindEvents();
      this.eventHubOn();
    },
    bindEvents() {
      this.saveSong();
      this.inputKeyUp();
    },
    saveSong() {
      this.view.el.on('click', '#save',(e)=> {
        for (let key in this.model.data.songInfo) {
          this.model.data.songInfo[key].value = this.view.el.find(`input[name=${key}]`).val()
        }
        if(this.verifyInfo(this.model.data.songInfo) && !this.loading) {
          this.loading = true;
          this.view.loading();
          if(this.model.data.songId) {
            this.model.modify().then((data)=> {
              setTimeout(() => {
                this.loading = false;
                window.eventHub.emit('modify-success', data);
                this.view.unLoading()
              }, 500);
            })
          }else {
            this.model.save().then((data)=> {
              setTimeout(() => {
                window.eventHub.emit('add-success', data);
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
    },
    reset() {
      this.model.reset();
      this.view.render(this.model.data);
    }
  }
  controller.init(view, model)
}