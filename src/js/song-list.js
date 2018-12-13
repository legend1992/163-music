/**
 * this.model.data.selectedIdx可优化，直接改变被选中的li的class即可，每次重新渲染开销比较大
 */
import $ from '../../node_modules/jquery/dist/jquery';
const APP_ID = 'o3NC55gABAwll79UCrKnaCyx-gzGzoHsz';
const APP_KEY = 'k2y1XBiRCMC0JHQJ1TtSo2By';
const AV = require('leancloud-storage');
AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});
{
  let view = {
    el: $('#song-list'),
    template: ``,
    render(selectedIdx, list) {
      let html = this.template;
      if(list.length) {
        list.map((item, key)=> {
          html += `<li class="${key===selectedIdx ? 'active' : ''}" data-song-id=${item.id}>${item.name}</li>`
        })
      }else {
        html = '<li>暂无歌曲</li>'
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
      this.model.findAll().then(()=> {
        let { selectedIdx, songList } = this.model.data;
        this.view.render(selectedIdx, songList);
      })
    },
    bindEvents() {
      this.view.el.on('click', 'li', (e)=> {
        let index = $(e.target).index();
        if(this.model.data.selectedIdx !== index) {
          this.model.data.selectedIdx = index;
          let { selectedIdx, songList } = this.model.data;
          this.view.render(selectedIdx, songList);
          window.eventHub.emit('edit-song', JSON.parse(JSON.stringify(this.model.data.songList[index])))
        }
      })
    },
    eventHubOn() {
      window.eventHub.on('add-success', (data)=> {
        this.findAll()
      })
      window.eventHub.on('modify-success', (data)=> {
        this.findAll()
      })
      window.eventHub.on('create-song', ()=> {
        this.model.data.selectedIdx = -1;
        let { selectedIdx, songList } = this.model.data;
        this.view.render(selectedIdx, songList);
      })
    }
  }
  controller.init(view, model)
}