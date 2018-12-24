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
          <div id="dist-inner" class="dist-inner">
            <img src="{{cover_url}}" alt="歌曲封面">
          </div>
          <i id="play-button" class="play-button"></i>
        </section>
        <section class="lyrics-section">
          <h4>{{name}}</h4>
          <div class="lyrics-wrapper">
            <div class="lyrics-inner-wrapper">
              {{lyrics}}
            </div>
          </div>
        </section>
      </main>
    `,
    render(songInfo, fn) {
      let html = this.template;
      let { cover_url, name, lyricsArr, url } = songInfo;
      let lyricsHtml = '';
      lyricsArr.map((lyricsUnit, key)=> {
        let { lyrics } = lyricsUnit;
        lyricsHtml += key ? `<p>${lyrics}</p>` : `<p class="active">${lyrics}</p>`
      })
      html = html.replace(`{{name}}`, name).replace(`{{lyrics}}`, lyricsHtml).replace(/{{cover_url}}/g, cover_url).replace(`{{url}}`, url);
      this.el.html(html)
      fn()
    },
    translateLyrics(i) {
      this.el.find('.lyrics-inner-wrapper').css('transform', `translateY(-${1.5*(i)}em)`).find(`p:nth-child(${i+1})`).addClass('active')
    },
    play() {
      this.el.find('#dist-wrapper').addClass('playing').end().find('audio')[0].play()
    },
    pause(playTime) {
      let deg = playTime/20 * 360;
      this.el.find('#dist-wrapper').removeClass('playing').find('#dist-inner').css(
        'transform', `rotate(${deg}deg)`
      ).end().end().find('audio')[0].pause()
    },
    reset() {
      this.el.find('#dist-wrapper').removeClass('playing').find('#dist-inner').css(
        'transform', `rotate(0deg)`
      )
      this.el.find('.lyrics-inner-wrapper').css(
        'transform', 'translateY(0)'
      ).find('p:not(:nth-child(1))').removeClass('active')
    }
  };
  let model = {
    data: {
      singing: false,
      songsId: getUrlParam('id'),
      activeLyricsIndex: 0,
      startTime: 0,
      playTime: 0,
      songInfo: {
        lyricsArr: [{
          targetTime: 0,
          lyrics: ''
        }]
      }
    },
    reset() {
      this.data.singing = false;
      this.data.activeLyricsIndex = 0;
      this.data.playTime = 0;
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
        this.model.data.songInfo.lyricsArr = this.splitLyrics();
        this.view.render(data, ()=> {
          this.view.el.find('audio').on('timeupdate', (e)=> {
            let { lyricsArr } = this.model.data.songInfo;
            let { currentTime } = e.target;
            for(let i=0; i<lyricsArr.length; i++) {
              let { targetTime: currentTargetTime } = lyricsArr[i];
              let { targetTime: nextTargetTime } = lyricsArr[i+1] ? lyricsArr[i+1] : { targetTime: Infinity };
              if(currentTime >= currentTargetTime && currentTime <= nextTargetTime) {
                if(i>this.model.data.activeLyricsIndex) {
                  this.model.data.activeLyricsIndex = i;
                  this.view.translateLyrics(i)
                }
                break;
              }
            }
          }).on('ended', ()=> {
            this.model.reset()
            this.view.reset()
          })
        })
      })
    },
    splitLyrics() {
      let lyricsArr = this.model.data.songInfo.lyrics.split('\n');
      lyricsArr = lyricsArr.map((lyricsUnit)=> {
        let matches = lyricsUnit.match(/\[([\d:.]+)\](.+)/);
        let targetTime, lyrics;
        if(matches) {
          let time = matches[1].split(':');
          let minutes = parseInt(time[0], 10);
          let seconds = parseFloat(time[1], 10);
          targetTime = minutes * 60 + seconds;
          lyrics = matches[2].trim();
        }else {
          targetTime = 0;
          lyrics = lyricsUnit;
        }
        return {
          targetTime: targetTime,
          lyrics: lyrics
        }
      })
      return lyricsArr
    },
    bindEvents() {
      this.view.el.on('click', '#play-button', (e)=> {
        if(!this.model.data.singing) {
          this.model.data.singing = true;
          this.model.data.startTime = new Date().getTime()
          e.stopPropagation();
          this.view.play()
        }
      })
      this.view.el.on('click', '#dist-wrapper', ()=> {
        if(this.model.data.singing) {
          this.model.data.singing = false;
          this.model.data.playTime += (new Date().getTime() - this.model.data.startTime)/1000;
          this.view.pause(this.model.data.playTime)
        }
      })
    }
  }
  controller.init(view, model)
}