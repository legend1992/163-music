import '../../css/public/reset.scss';
import '../../css/index/song-play.scss';
import '../public/rem';
import $ from 'jquery';
import { querySongInfo } from '../public/service';
import { getUrlParam } from '../public/public-method';

{
  let view = {
    el: $('#app'),
    template: `
      <div id="background" style="background-image: url({{cover_url}})"></div>
      <audio src="{{url}}"></audio>
      <main>
        <section id="dist-wrapper" class="dist-wrapper">
          <div class="dist-inner">
            <img src="{{cover_url}}" alt="歌曲封面">
            <i id="play-button" class="play-button"></i>
          </div>
        </section>
        <section class="lyrics-section">
          <h4>{{name}}</h4>
          <div class="lyrics-wrapper">
            <div class="lyrics-inner-wrapper">
              <p>{{lyrics}}</p>
            </div>
          </div>
        </section>
      </main>
    `,
    render(songInfo) {
      let html = this.template;
      let { cover_url, name, lyrics, url } = songInfo;
      html = html.replace(`{{name}}`, name).replace(`{{lyrics}}`, lyrics).replace(/{{cover_url}}/g, cover_url).replace(`{{url}}`, url);
      this.el.html(html)
    }
  };
  let model = {
    data: {
      singing: false,
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
      this.bindEvents();
      this.model.querySongInfo(this.model.data.songsId).then((data)=> {
        this.model.data.songInfo = data;
        this.view.render(data)
      })
    },
    bindEvents() {
      this.view.el.on('click', '#play-button', (e)=> {
        if(!this.model.data.singing) {
          this.model.data.singing = true;
          e.stopPropagation();
          this.view.el.find('audio')[0].play()
        }
      })
      this.view.el.on('click', '#dist-wrapper', ()=> {
        if(this.model.data.singing) {
          this.model.data.singing = false;
          this.view.el.find('audio')[0].pause()
        }
      })
    }
  }
  controller.init(view, model)
}