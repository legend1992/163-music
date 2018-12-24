import $ from 'jquery';
const AV = require('leancloud-storage');
import { findAllSongs, querySongSelectedSongs, deleteSongSelectedSongsAll } from '../../public/service';

{
  let view = {
    el: $('#song-like-section'),
    template: `
      <h1>加入歌单</h1>
    `,
    render(songsList) {
      let html = this.template;
      html += `<form>`;
      songsList.map((songs)=> {
        html += `<div class="row"><label><input type="checkbox" name="songs" value="${songs.id}">${songs.name}</label></div>`
      })
      html += `<div class="row require button-wrapper">
          <div class="explain" style="margin-left:5px;">请选择歌单</div>
          <span id="songs-save" class="button"><div class="loader-wrapper2"><div class="loader">Loading...</div></div>确定</span>
        </div></form>
      `;
      this.el.html(html)
    },
    unLoading() {
      this.el.find('#songs-save').removeClass('loading');
    },
    loading() {
      this.el.find('#songs-save').addClass('loading');
    },
    highlightInput() {
      this.el.find('.row.require').addClass('error')
    },
    downplayInput() {
      this.el.find('.row.require').removeClass('error')
    },
    checkInputStatus(selectSongs) {
      this.el.find('input:checkbox[name="songs"]').each((key, input)=> {
        input.checked = false;
        for(let i=0; i<selectSongs.length; i++) {
          if(input.value === selectSongs[i].songsId) {
            input.checked = true;
            break;
          }
        }
      })
    }
  };
  let model = {
    data: {
      selectSong: null,
      songsList: [],
      selectSongs: [],
      selectSongsEl: [],
      successIndex: 0
    },
    findAll() {
      return new Promise((resolve)=> {
        findAllSongs((data)=> {
          resolve(data)
        })
      })
    },
    querySongSelectedSongs(songId) {
      return new Promise((resolve)=> {
        querySongSelectedSongs(songId, (data)=> {
          resolve(data)
        })
      })
    },
    deleteSongSelectedSongsAll() {
      return new Promise((resolve)=> {
        deleteSongSelectedSongsAll(this.data.selectSongs, ()=> {
          resolve()
        })
      })
    },
    reset() {
      let { songsList } = this.data;
      this.data = {
        songsList: songsList,
        selectSong: null,
        selectSongs: [],
        selectSongsEl: [],
        successIndex: 0
      }
    }
  }
  let controller = {
    init(view, model) {
      this.view = view;
      this.model = model;
      this.eventHubOn();
      this.findAll();
      this.bindEvents();
    },
    findAll() {
      this.model.findAll().then((songsList)=> {
        this.model.data.songsList = songsList;
        this.view.render(songsList)
      })
    },
    bindEvents() {
      this.checkboxClick();
      this.saveClick();
    },
    checkboxClick() {
      this.view.el.on('click', 'input:checkbox[name="songs"]', ()=> {
        this.model.data.selectSongsEl = this.view.el.find('input:checkbox[name="songs"]:checked');
        if(this.model.data.selectSongsEl.length || this.model.data.selectSongs.length) {
          this.view.downplayInput()
        }else {
          this.view.highlightInput()
        }
      })
    },
    saveClick() {
      this.view.el.on('click', '#songs-save', ()=> {
        this.model.data.successIndex = 0;
        let { selectSongsEl, selectSongs } = this.model.data;
        if(selectSongsEl.length || selectSongs.length) {
          this.loading();
          this.model.deleteSongSelectedSongsAll().then(()=> {
            if(selectSongsEl.length) {
              selectSongsEl.each((key, songs)=> {
                this.saveSongs(songs.value)
              })
            }else {
              this.unLoading()
            }
          })
        }else {
          this.view.highlightInput()
        }
      })
    },
    saveSongs(songsId) {
      let { selectSong } = this.model.data;
      let targetSongsList = AV.Object.createWithoutData('SongsList', songsId);
      let songSongsObj = new AV.Object('songSongsObj');
      songSongsObj.set('song', selectSong.obj);
      songSongsObj.set('songName', selectSong.name);
      songSongsObj.set('songSinger', selectSong.singer);
      songSongsObj.set('songs', targetSongsList);
      songSongsObj.save().then(()=> {
        this.model.data.successIndex ++;
        if(this.model.data.successIndex===this.model.data.selectSongsEl.length) {
          this.unLoading();
          this.querySongSelectedSongs();
        }
      })
    },
    loading() {
      this.model.data.loading = true;
      this.view.loading();
    },
    unLoading() {
      setTimeout(() => {
        this.view.unLoading();
        this.model.data.loading = false;
      }, 1000)
    },
    querySongSelectedSongs() {
      this.model.querySongSelectedSongs(this.model.data.selectSong.id).then((data)=> {
        this.model.data.selectSongs = data;
        this.view.checkInputStatus(data);
        this.model.data.selectSongsEl = this.view.el.find('input:checkbox[name="songs"]:checked');
      })
    },
    reset() {
      this.model.reset();
      this.view.el.show();
      this.view.render(this.model.data.songsList);
    },
    eventHubOn() {
      window.eventHub.on('create-song', ()=> {
        this.view.el.hide()
      })
      window.eventHub.on('edit-song', (song)=> {
        this.reset();
        this.model.data.selectSong = {
          id: song.id,
          obj: AV.Object.createWithoutData('Songs', song.id),
          name: song.name,
          singer: song.singer
        }
        this.querySongSelectedSongs()
      })
    }
  }
  controller.init(view, model)
}