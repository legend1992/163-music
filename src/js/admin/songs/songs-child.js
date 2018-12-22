import $ from 'jquery';
import { querySongsChildSong, deleteSongsLikeSongAll } from '../../public/service';

{
  let view = {
    el: $('#songs-like-section'),
    template: `
      <h1>歌曲列表
        <span id="back" class="button right back">返回</span>
        <span id="songs-delete" class="button right delete"><div class="loader-wrapper2"><div class="loader">Loading...</div></div>删除</span>
      </h1>
    `,
    render(songsChildList) {
      let html = this.template;
      if(songsChildList && songsChildList.length) {
        html += `<form><div class="row"><label id="check-all"><input type="checkbox" value="true">全选</label></div>`;
        songsChildList.map((child, key)=> {
          let { id, name, singer } = child.song;
          html += `<div class="row"><label title="${name}&nbsp;-&nbsp;${singer}"><input type="checkbox" name="songs" value="${key}">${name}&nbsp;-&nbsp;${singer}</label></div>`
        })
        html += `</form>`;
      }else {
        html += `未添加歌曲`;
      }
      this.el.html(html)
    },
    show() {
      this.el.removeClass('hide')
    },
    hide() {
      this.el.addClass('hide')
    },
    loading() {
      if(!this.el.find('.loader-wrapper1').length) {
        this.el.append('<div class="loader-wrapper1"><div class="loader">Loading...</div></div>');
      }
    },
    buttonUnLoading() {
      this.el.find('#songs-delete').removeClass('loading');
    },
    buttonLoading() {
      this.el.find('#songs-delete').addClass('loading');
    }
  };
  let model = {
    data: {
      templateShow: false,
      songsId: undefined,
      songsChildList: [],
      selectSong: [],
      buttonLoading: false
    },
    querySongsChildSong(songsId) {
      return new Promise((resolve)=> {
        querySongsChildSong(songsId, (data)=> {
          resolve(data)
        })
      })
    },
    deleteSongsLikeSongAll() {
      return new Promise((resolve)=> {
        deleteSongsLikeSongAll(this.data.selectSong, ()=> {
          resolve()
        })
      })
    },
    reset() {
      this.data.selectSong = []
    }
  }
  let controller = {
    init(view, model) {
      this.view = view;
      this.model = model;
      this.bindEvents();
      this.eventHubOn();
    },
    querySongsChildSong() {
      this.view.loading();
      setTimeout(() => {
        this.model.querySongsChildSong(this.model.data.songsId).then((songsChildList)=> {
          this.model.data.songsChildList = songsChildList;
          this.view.render(songsChildList)
        })
      }, 1000);
    },
    bindEvents() {
      this.view.el.on('click', '#back', ()=> {
        this.model.data.templateShow = !this.model.data.templateShow;
        this.view.hide()
      })
      this.view.el.on('click', '#check-all', ()=> {
        let allChecked = this.view.el.find('#check-all input')[0].checked;
        let allSongInput = this.view.el.find('input:checkbox[name="songs"]');
        allSongInput.each((key, songInput)=> {
          songInput.checked = allChecked
        })
      })
      this.view.el.on('click', 'input:checkbox[name="songs"]', ()=> {
        let allCheckedInputLength = this.view.el.find('input:checkbox[name="songs"]:checked').length;
        let allChecked = allCheckedInputLength===this.model.data.songsChildList.length ? true : false;
        this.view.el.find('#check-all input')[0].checked = allChecked;
      })
      this.view.el.on('click', '#songs-delete', ()=> {
        if(!this.model.data.buttonLoading) {
          let allCheckedInput = this.view.el.find('input:checkbox[name="songs"]:checked');
          if(allCheckedInput.length) {
            this.model.reset();
            this.model.data.buttonLoading = true;
            this.view.buttonLoading();
            allCheckedInput.each((key, input)=> {
              this.model.data.selectSong.push(this.model.data.songsChildList[input.value])
            })
            setTimeout(() => {
              this.model.deleteSongsLikeSongAll().then(()=> {
                this.model.data.buttonLoading = false;
                this.view.buttonUnLoading();
                this.querySongsChildSong()
              })
            }, 500);
          }
        }
      })
    },
    eventHubOn() {
      window.eventHub.on('edit-songs', (data)=> {
        if(this.model.data.templateShow) {
          this.model.data.songsId = data.id;
          this.querySongsChildSong()
        }
      })
      window.eventHub.on('edit-songs-child', (songsId)=> {
        this.model.data.templateShow = !this.model.data.templateShow;
        if(this.model.data.templateShow) {
          this.view.show();
          this.model.data.songsId = songsId;
          this.querySongsChildSong()
        }else {
          this.view.hide()
        }
      })
    }
  }
  controller.init(view, model)
}