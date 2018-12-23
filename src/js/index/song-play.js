import '../../css/index/song-play.scss';
import '../public/rem';
import $ from 'jquery';
import { querySongInfo } from '../public/service';
import { getUrlParam } from '../public/public-method';

{
  console.log('sdfsfd')
  let view = {
    el: $('#app'),
    template: ``,
    render(songInfo) {
      let html = this.template;
      let { cover_url, name, intro } = songInfo;
      html += `</ul></div>`;
      this.el.html(html)
    }
  };
  let model = {
    data: {
      songsId: getUrlParam('id'),
      songInfo: {}
    },
    querySongInfo(songsId) {
      return new Promise((resolve)=> {
        querySongInfo(songsId, (data)=> {
          resolve(data)
        })
      })
    }
  }
  let controller = {
    init(view, model) {
      this.view = view;
      this.model = model;
      this.model.querySongInfo(this.model.data.songsId).then((data)=> {
        console.log(data)
        this.model.data.songInfo = data;
      });
    }
  }
  controller.init(view, model)
}