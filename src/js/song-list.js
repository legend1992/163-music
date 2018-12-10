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
    render(list) {
      if(list.length) {
        list.map((item)=> {
          this.template += `<li data-song-id=${item.id}>${item.name}</li>`
        })
      }else {
        this.template = '<li>暂无歌曲</li>'
      }
      this.el.html(this.template)
    }
  };
  let model = {
    data: {
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
    },
    findAll() {
      this.model.findAll().then(()=> {
        this.view.render(this.model.data.songList)
      })
    },
    bindEvents() {
      this.view.el.on('click', 'li', (e)=> {
        let index = $(e.target).index();
        window.eventHub.emit('edit-song', JSON.parse(JSON.stringify(this.model.data.songList[index])))
      })
    }
  }
  controller.init(view, model)
}