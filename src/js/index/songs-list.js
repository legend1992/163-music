import $ from 'jquery';
import { findAllSongs } from '../public/service';
{
  let view = {
    el: $('#songs-list'),
    template: ``,
    render(list) {
      let html = this.template;
      if(list.length) {
        html += '<ul>';
        list.map((item)=> {
          html += `<li><a href="./songs-detail.html?id=${item.id}">
            <div class="img-wrapper"><img src="${item.cover_url}" alt="music1-cover"></div>
            <p>${item.name}</p>
          </a></li>`
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
      this.findAll();
    },
    findAll() {
      this.loading();
      setTimeout(() => {
        this.model.findAll().then((songsList)=> {
          this.model.data.songsList = songsList;
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