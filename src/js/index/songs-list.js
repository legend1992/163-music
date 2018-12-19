import $ from 'jquery';
const AV = require('leancloud-storage');
{
  let view = {
    el: $('#songs-list'),
    template: ``,
    render(list) {
      let html = this.template;
      if(list.length) {
        html += '<ul>';
        list.map((item)=> {
          html += `<li>
            <div class="img-wrapper"><img src="${item.cover_url}" alt="music1-cover"></div>
            <p>${item.name}</p>
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
      })
    }
  }
  let controller = {
    init(view, model) {
      this.view = view;
      this.model = model;
      this.findAll();
    },
    findAll() {
      this.loading();
      setTimeout(() => {
        this.model.findAll().then(()=> {
          let { songsList } = this.model.data;
          this.view.render(songsList);
        })
      }, 500);
    },
    loading() {
      if(!this.view.el.find('.loader-wrapper1').length) {
        this.view.el.append('<div class="loader-wrapper1"><div class="loader">Loading...</div></div>');
      }
    }
  }
  controller.init(view, model)
}