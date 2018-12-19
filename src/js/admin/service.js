import $ from 'jquery'
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
export { getToken }