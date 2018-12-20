import $ from 'jquery';
const AV = require('leancloud-storage');
import { querySongsChildSong } from '../../public/service';

{
  let view = {
    el: $('#songs-like-section'),
    template: `
      <h1>歌曲列表</h1>
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
    }
  };
  let model = {
    data: {
      songsId: undefined,
      songsList: []
    },
    querySongsChildSong(songsId) {
      return new Promise((resolve)=> {
        querySongsChildSong(songsId, (data)=> {
          resolve(data)
        })
      })
    },
    // deleteSongSelectedSongsAll() {
    //   return new Promise((resolve)=> {
    //     deleteSongSelectedSongsAll(this.data.selectSongs, ()=> {
    //       resolve()
    //     })
    //   })
    // },
    reset() {}
  }
  let controller = {
    init(view, model) {
      this.view = view;
      this.model = model;
      this.eventHubOn();
    },
    querySongsChildSong() {
      this.model.querySongsChildSong(this.model.data.songsId).then((songsList)=> {
        this.model.data.songsList = songsList;
        this.view.render(songsList)
        console.log(songsList)
      })
    },
    bindEvents() {
    },
    eventHubOn() {
      window.eventHub.on('edit-songs-child', (songsId)=> {
        this.model.data.songsId = songsId;
        this.querySongsChildSong()
      })
    }
  }
  controller.init(view, model)
}