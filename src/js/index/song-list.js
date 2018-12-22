import $ from 'jquery';
const AV = require('leancloud-storage');
{
  let view = {
    el: $('#song-list'),
    template: ``,
    render(list) {
      let html = this.template;
      if(list.length) {
        html += '<ul>';
        list.map((item)=> {
          item.remark = item.remark ? '('+item.remark+')' : item.remark;
          html += `<li data-song-id=${item.id} title="${item.name}">
            <h4>${item.name}<span class="remark">${item.remark||''}</span></h4>
            <p><i class="icon-SQ icon"></i><span>${item.singer||'歌手(未知)'}</span> - <span>${item.album||'专辑(未知)'}</span></p>
            <i class="icon-play icon"></i>
          </li>`
        })
        html += '</ul>';
      }else {
        html = '<ul><li>暂无歌曲</li></ul>'
      }
      this.el.html(html)
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
    },
    findAll() {
      this.loading();
      setTimeout(() => {
        this.model.findAll().then(()=> {
          let { songList } = this.model.data;
          this.view.render(songList);
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