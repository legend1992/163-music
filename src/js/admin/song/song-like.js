import $ from 'jquery';
const AV = require('leancloud-storage');
import { findAllSongs } from '../../public/service';

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
      html += `<div class="row button-wrapper">
          <span id="songs-save" class="button"><div class="loader-wrapper2"><div class="loader">Loading...</div></div>确定</span>
        </div></form>
      `;
      this.el.append(html)
    },
    unLoading() {
      this.el.find('#songs-save').removeClass('loading');
    },
    loading() {
      this.el.find('#songs-save').addClass('loading');
    }
  };
  let model = {
    data: {
      selectSong: null,
      songsList: []
    },
    findAll() {
      return new Promise((resolve)=> {
        findAllSongs((data)=> {
          resolve(data)
        })
      })
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
        console.log(songsList)
        this.view.render(songsList)
      })
    },
    bindEvents() {
      this.view.el.on('click', '#songs-save', ()=> {
        let selectSongsEl = this.view.el.find('input:checkbox[name="songs"]:checked');
        if(selectSongsEl.length) {
          this.model.data.loading = true;
          this.view.loading();
          selectSongsEl.each((key, songs)=> {
            this.saveSongs(songs.value)
          })
        }else {
          console.log('请先选择歌单')
        }
      })
    },
    saveSongs(songsId) {
      let { selectSong } = this.model.data;
      let targetSongsList = AV.Object.createWithoutData('SongsList', songsId);
      console.log(selectSong)
      selectSong.set('dependent', targetSongsList);
      selectSong.save().then((data)=> {
        console.log(data)
      })
    },
    eventHubOn() {
      window.eventHub.on('edit-song', (song)=> {
        this.model.data.selectSong = AV.Object.createWithoutData('Songs', song.id)
      })
    }
  }
  controller.init(view, model)
}