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
  SongsList.find().then((songsList)=> {
    songsList = songsList.map((songs)=> {
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
export { getToken, findAllSongs, deleteData }