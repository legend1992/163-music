import $ from 'jquery';
const APP_ID = 'o3NC55gABAwll79UCrKnaCyx-gzGzoHsz';
const APP_KEY = 'k2y1XBiRCMC0JHQJ1TtSo2By';
const AV = require('leancloud-storage');
AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});
function getToken(fn) {
  $.ajax({
    url: "http://localhost:8888/api/uptoken",
    success: (res) => {
      let { token } = JSON.parse(res);
      let config = {
        useCdnDomain: false,
        disableStatisticsReport: false,
        retryCount: 6,
        region: undefined
      };
      let putExtra = {
        fname: "",
        params: {},
        mimeType: null
      };
      fn(token, putExtra, config);
    }
  })
}
function findAllSongs(fn) {
  let SongsList = new AV.Query('SongsList');
  SongsList.find().then((songsList) => {
    songsList = songsList.map((songs) => {
      return { id: songs.id, ...songs.attributes }
    })
    fn(songsList)
  }, function (error) {
    console.error('歌单列表获取失败:', error)
  })
}
function deleteData(param, fn) {
  let { obj, id } = param;
  let songs = AV.Object.createWithoutData(obj, id);
  songs.destroy().then(function () {
    fn()
  }, function (error) {
    console.error('删除失败:', error)
  })
}
function querySongSelectedSongs(songId, fn) {
  let song = AV.Object.createWithoutData('Songs', songId);
  let query = new AV.Query('songSongsObj');
  query.equalTo('song', song);
  query.find().then(function (selectedSongs) {
    selectedSongs = selectedSongs.map((selected) => {
      return { id: selected.id, songsId: selected.attributes.songs.id }
    })
    fn(selectedSongs)
  })
}
function querySongsChildSong(songsId, fn) {
  let songs = AV.Object.createWithoutData('SongsList', songsId);
  let query = new AV.Query('songSongsObj');
  query.equalTo('songs', songs);
  query.find().then(function (childSong) {
    childSong = childSong.map((songSongs) => {
      let { id, attributes: {song: { id : songId }, songName, songSinger }} = songSongs;
      return { 
        id: id,
        song: {
          id: songId,
          name: songName,
          singer: songSinger
        }
      }
    })
    fn(childSong)
  })
}
function querySongsInfo(songsId, fn) {
  var query = new AV.Query('SongsList');
  query.get(songsId).then((songs)=> {
    fn({ id: songs.id, ...songs.attributes })
  }, (error)=> {
    console.log('获取歌单信息失败', error)
  })
}
function deleteSongSelectedSongsAll(selectSongs, fn) {
  let objects = selectSongs.map((songs)=> {
    return AV.Object.createWithoutData('songSongsObj', songs.id)
  })
  AV.Object.destroyAll(objects).then(function () {
    fn()
  }, function (error) {
    console.log('批量删除歌曲选中歌单失败', error)
  })
}
function deleteSongsLikeSongAll(selectSong, fn) {
  let objects = selectSong.map((song)=> {
    return AV.Object.createWithoutData('songSongsObj', song.id)
  })
  AV.Object.destroyAll(objects).then(function () {
    fn()
  }, function (error) {
    console.log('批量删除歌单中歌曲失败', error)
  })
}
function querySongInfo(songId, fn) {
  var query = new AV.Query('Songs');
  query.get(songId).then((song)=> {
    fn({ id: song.id, ...song.attributes })
  }, (error)=> {
    console.log('获取歌曲信息失败', error)
  })
}
export { 
  getToken,
  findAllSongs,
  deleteData,
  querySongSelectedSongs,
  querySongsChildSong,
  deleteSongSelectedSongsAll,
  deleteSongsLikeSongAll,
  querySongsInfo,
  querySongInfo
}