/**
 * this.model.data.selectedIdx可优化，直接改变被选中的li的class即可，每次重新渲染开销比较大
 */
import $ from 'jquery';
const AV = require('leancloud-storage');
{
  let view = {
    el: $('#songs-list'),
    template: ``,
    render(selectedIdx, list) {
      let html = this.template;
      if(list.length) {
        html += '<ul>';
        list.map((item, key)=> {
          html += `<li class="${key===selectedIdx ? 'active' : ''}" data-songs-id=${item.id} title="${item.name}">${item.name}
            <svg class="ali-icon" aria-hidden="true" title="删除">
              <use xlink:href="#icon-delete"></use>
            </svg>
          </li>`
        })
        html += '</ul>';
      }else {
        html = '<div class="no-data">暂无歌单</div>'
      }
      this.el.html(html)
    }
  };
  let model = {
    data: {
      selectedIdx: -1,
      songsList: []
    },
    findAll() {
      let SongsList = new AV.Query('SongsList');
      return SongsList.find().then((songsList)=> {
        this.data.songsList = songsList.map((songs)=> {
          return { id: songs.id, ...songs.attributes }
        })
      }, function (error) {
        console.error('歌单列表获取失败:', error)
      });
    },
    deleteSong(id) {
      let songs = AV.Object.createWithoutData('SongsList', id);
      return songs.destroy().then(function (success) {
        return success
      }, function (error) {
        return error
      })
    }
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
          let { selectedIdx, songsList } = this.model.data;
          this.view.render(selectedIdx, songsList);
          if(this.model.data.selectedIdx === -1) {
            window.eventHub.emit('songs-list-empty')
          }else {
            window.eventHub.emit('edit-songs', JSON.parse(JSON.stringify(this.model.data.songsList[this.model.data.selectedIdx])))
          }
        })
      }, 500);
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
          let { selectedIdx, songsList } = this.model.data;
          this.view.render(selectedIdx, songsList);
          window.eventHub.emit('edit-songs', JSON.parse(JSON.stringify(this.model.data.songsList[index])))
        }else {
          let songsId = $(e.currentTarget).attr('data-songs-id');
          this.deleteSong(songsId, index)
        }
      })
    },
    deleteSong(songsId, index) {
      this.loading();
      this.model.deleteSong(songsId).then(()=> {
        console.log('删除成功');
        this.findAll()
        if(index <= this.model.data.selectedIdx) {
          this.model.data.selectedIdx -= 1;
          if(this.model.data.selectedIdx === -1 && this.model.data.songList.length > 1) {
            this.model.data.selectedIdx = 0;
          }
        }
      }, (error)=> {
        console.log(error)
      })
    },
    eventHubOn() {
      window.eventHub.on('add-songs-success', (data)=> {
        this.findAll()
      })
      window.eventHub.on('modify-songs-success', (data)=> {
        this.findAll()
      })
      window.eventHub.on('create-songs', ()=> {
        this.reset()
      })
    },
    reset() {
      this.model.data.selectedIdx = -1;
      let { selectedIdx, songsList } = this.model.data;
      this.view.render(selectedIdx, songsList);
    }
  }
  controller.init(view, model)
}