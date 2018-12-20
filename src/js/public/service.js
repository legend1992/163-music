import $ from 'jquery';
const AV = require('leancloud-storage');
function getToken(fn, _this) {
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
      fn.call(_this, token, putExtra, config);
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
    console.log(childSong)
    childSong = childSong.map((selected) => {
      return { id: selected.id, songId: selected.attributes.song.id }
    })
    fn(childSong)
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
export { getToken, findAllSongs, deleteData, querySongSelectedSongs, querySongsChildSong, deleteSongSelectedSongsAll }