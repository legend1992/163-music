/**
 * this.model.data.selectedIdx可优化，直接改变被选中的li的class即可，每次重新渲染开销比较大
 */
import $ from 'jquery';
import { deleteData, querySongSelectedSongs, deleteSongSelectedSongsAll } from '../../public/service';
const AV = require('leancloud-storage');
{
  let view = {
    el: $('#song-list'),
    template: ``,
    render(selectedIdx, list) {
      let html = this.template;
      if(list.length) {
        html += '<ul>';
        list.map((item, key)=> {
          html += `<li class="${key===selectedIdx ? 'active' : ''}" data-song-id=${item.id} title="${item.name}">${item.name}
            <svg class="ali-icon" aria-hidden="true" title="删除">
              <use xlink:href="#icon-delete"></use>
            </svg>
          </li>`
        })
        html += '</ul>';
      }else {
        html = '<div class="no-data">暂无歌曲</div>'
      }
      this.el.html(html)
    }
  };
  let model = {
    data: {
      selectedIdx: -1,
      songList: []
    },
    findAll() {
      let Songs = new AV.Query('Songs');
      return Songs.find().then((songs)=> {
        this.data.songList = songs.map((song)=> {
          return { id: song.id, ...song.attributes }
        })
      }, function (error) {
        console.error('歌曲列表获取失败:', error)
      });
    },
    deleteSong(id) {
      return new Promise((resolve)=> {
        deleteData({
          obj: 'Songs',
          id: id
        }, ()=> {
          resolve()
        })
      })
    },
  }
  let controller = {
    init(view, model) {
      this.view = view;
      this.model = model;
      this.findAll();
      this.bindEvents();
      this.eventHubOn();
    },
    findAll() {
      this.loading();
      setTimeout(() => {
        this.model.findAll().then(()=> {
          let { selectedIdx, songList } = this.model.data;
          this.view.render(selectedIdx, songList);
          if(this.model.data.selectedIdx === -1) {
            window.eventHub.emit('song-list-empty')
          }else {
            window.eventHub.emit('edit-song', JSON.parse(JSON.stringify(this.model.data.songList[this.model.data.selectedIdx])))
          }
        })
      }, 500);
    },
    deleteSongSelectedSongsAll(songId) {
      querySongSelectedSongs(songId, (data)=> {
        if(data && data.length) {
          deleteSongSelectedSongsAll(data)
        }
      })
    },
    loading() {
      if(!this.view.el.find('.loader-wrapper1').length) {
        this.view.el.append('<div class="loader-wrapper1"><div class="loader">Loading...</div></div>');
      }
    },
    bindEvents() {
      this.view.el.on('click', 'li', (e)=> {
        let index = $(e.currentTarget).index();
        if(e.target.nodeName==='LI') {
          this.model.data.selectedIdx = index;
          let { selectedIdx, songList } = this.model.data;
          this.view.render(selectedIdx, songList);
          window.eventHub.emit('edit-song', JSON.parse(JSON.stringify(this.model.data.songList[index])))
        }else {
          let songId = $(e.currentTarget).attr('data-song-id');
          this.deleteSong(songId, index)
        }
      })
    },
    deleteSong(songId, index) {
      this.loading();
      this.model.deleteSong(songId).then(()=> {
        this.deleteSongSelectedSongsAll(songId)
        if(index <= this.model.data.selectedIdx) {
          this.model.data.selectedIdx -= 1;
          if(this.model.data.selectedIdx === -1 && this.model.data.songList.length > 1) {
            this.model.data.selectedIdx = 0;
          }
        }
        this.findAll()
      }, (error)=> {
        console.log(error)
      })
    },
    eventHubOn() {
      window.eventHub.on('add-song-success', (data)=> {
        this.findAll()
      })
      window.eventHub.on('modify-song-success', (data)=> {
        this.findAll()
      })
      window.eventHub.on('create-song', ()=> {
        this.reset()
      })
    },
    reset() {
      this.model.data.selectedIdx = -1;
      let { selectedIdx, songList } = this.model.data;
      this.view.render(selectedIdx, songList);
    }
  }
  controller.init(view, model)
}