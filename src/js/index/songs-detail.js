import '../../css/index/songs-detail.scss';
import '../../css/public/icon.scss';
import '../public/rem';
import $ from 'jquery';
import { querySongsChildSong, querySongsInfo } from '../public/service';
import { getUrlParam } from '../public/public-method';

{
  let view = {
    el: $('#app'),
    template: ``,
    render(songsInfo, songsChildList) {
      let html = this.template;
      let { cover_url, name, authur, label, intro } = songsInfo;
      let labels = label.split(',');
      let labelsHtml = '';
      labels.map((label)=> {
        labelsHtml += `<span>${label}</span>`
      })
      if(songsChildList && songsChildList.length) {
        html += `
        <div id="banner">
          <div class="top">
            <img src="${cover_url}" alt="封面">
            <div class="name-and-authur">
              <h1>${name}</h1>
              <span>${authur||'作者(无)'}</span>
            </div>
          </div>
          <div class="bottom">
            <div class="label">标签：${labelsHtml}</div>
            <p class="intro">简介：${intro}</p>
          </div>
        </div>
        <section class="song-list-wrapper list-wrapper">
          <h3>歌曲列表</h3>
          <ul class="song-list">`;
        songsChildList.map((child, key)=> {
          let { id, name, singer, remark, album } = child.song;
          remark = remark ? '('+remark+')' : remark;
          html += `<li data-song-id=${id} title="${name}"><i class="key">${key+1}</i>
            <h4>${name}<span class="remark">${remark||''}</span></h4>
            <p><i class="icon-SQ icon"></i><span>${singer||'歌手(未知)'}</span> - <span>${album||'专辑(未知)'}</span></p>
            <i class="icon-play icon"></i>
          </li>`
        })
        html += `</ul></div>`;
      }else {
        html += `未添加歌曲`;
      }
      this.el.html(html)
    },
    loading() {
      if(!this.el.find('.loader-wrapper1').length) {
        this.el.append('<div class="loader-wrapper1"><div class="loader">Loading...</div></div>');
      }
    }
  };
  let model = {
    data: {
      songsId: getUrlParam('id'),
      songsInfo: {}
    },
    querySongsInfo(songsId) {
      return new Promise((resolve)=> {
        querySongsInfo(songsId, (data)=> {
          resolve(data)
        })
      })
    },
    querySongsChildSong(songsId) {
      return new Promise((resolve)=> {
        querySongsChildSong(songsId, (data)=> {
          resolve(data)
        })
      })
    }
  }
  let controller = {
    init(view, model) {
      this.view = view;
      this.model = model;
      this.model.querySongsInfo(this.model.data.songsId).then((data)=> {
        this.model.data.songsInfo = data;
        this.querySongsChildSong();
      });
    },
    querySongsChildSong() {
      this.view.loading();
      setTimeout(() => {
        this.model.querySongsChildSong(this.model.data.songsId).then((songsChildList)=> {
          this.view.render(this.model.data.songsInfo, songsChildList)
        })
      }, 1000);
    }
  }
  controller.init(view, model)
}