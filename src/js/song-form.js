import $ from '../../node_modules/jquery/dist/jquery';
const AV = require('leancloud-storage');
const Songs = AV.Object.extend('Songs');

{
  let view = {
    el: $('#section'),
    template: `
      <h1>新建歌曲</h1>
      <form>
        <div class="row require">
          <label>
            <span>歌名</span><input type="text" placeholder="请输入歌名" name="name">
          </label>
          <div class="explain">请输入歌名</div>
        </div>
        <div class="row">
          <label>
            <span>歌手</span><input type="text" placeholder="请输入歌手名" name="singer">
          </label>
        </div>
        <div class="row require">
          <label>
            <span>歌曲外链</span><input type="text" placeholder="请输入歌曲外链" name="url">
          </label>
          <div class="explain">请输入歌曲外链</div>
        </div>
        <div class="row button-wrapper">
          <span id="save" class="button">提交</span>
        </div>
      </form>
    `,
    render() {
      this.el.html(this.template)
    },
    highlightInput(key) {
      this.el.find(`input[name=${key}]`).closest('.row').addClass('error')
    }
  };
  let model = {
    data: {
      isAddSong: true,
      songId: '',
      songInfo: {
        name: {value:'', require: true},
        singer: {value:''},
        url: {value:'', require: true}
      }
    },
    save() {
      let Songs = new Songs();
      for (let key in this.data.songInfo) {
        Songs.set(key, this.data.songInfo[key].value);
      }
      Songs.save().then(function (data) {
        console.log('New object created with objectId: ' + data.id);
      }, function (error) {
        console.error('Failed to save data, with error message: ' + error.message);
      });
    }
  }
  let controller = {
    init(view, model) {
      this.view = view;
      this.model = model;
      this.view.render();
      this.bindEvents();
      this.eventHubOn();
    },
    bindEvents() {
      this.saveSong();
      this.inputKeyUp();
    },
    saveSong() {
      this.view.el.find('#save').click(()=> {
        for (let key in this.model.data.songInfo) {
          this.model.data.songInfo[key].value = this.view.el.find(`input[name=${key}]`).val()
        }
        if(this.verifyInfo(this.model.data.songInfo)) {
          this.model.save();
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
        this.model.data.isAddSong = false;
        this.model.data.songInfo = data;
      })
    }
  }
  controller.init(view, model)
}