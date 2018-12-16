import $ from '../../node_modules/jquery/dist/jquery';
import * as qiniu from 'qiniu-js';

{
  let view = {
    el: $('#footer')
  };
  let model = {
    data: {

    }
  };
  let controller = {
    init(view, model) {
      this.view = view;
      this.model = model;
      this.bindEvents();
      this.getToken();
    },
    bindEvents() {
      this.view.el.find('input[type="file"]').on('change', (e) => {
        console.log(e)
      })
    },
    getToken() {
      $.ajax({
        url: "http://localhost:8888/api/uptoken",
        success: (res) => {
          console.log(JSON.parse(res), typeof JSON.parse(res))
          let { token } = JSON.parse(res);
          var config = {
            useCdnDomain: false,
            disableStatisticsReport: false,
            retryCount: 6,
            region: undefined
          };
          var putExtra = {
            fname: "",
            params: {},
            mimeType: null
          };
          this.uploadWithSDK(token, putExtra, config);
        }
      })
    },
    uploadWithSDK(token, putExtra, config) {
      $("#select2").unbind("change").bind("change", function () {
        var file = this.files[0];
        var finishedAttr = [];
        var compareChunks = [];
        var observable;
        if (file) {
          var key = file.name;
          // 添加上传dom面板
          // var board = addUploadBoard(file, config, key, "");
          // if (!board) {
          //   return;
          // }
          // putExtra.params["x:name"] = key.split(".")[0];
          // board.start = true;
          // var dom_total = $(board)
          //   .find("#totalBar")
          //   .children("#totalBarColor");
          // 设置next,error,complete对应的操作，分别处理相应的进度信息，错误信息，以及完成后的操作
          var error = function (err) {
            // board.start = true;
            // $(board).find(".control-upload").text("继续上传");
            console.log(err);
            alert("上传出错")
          };
          var complete = function (res) {
            console.log(res)
          };
          var next = function (response) {
            var chunks = response.chunks || [];
            // var total = response.total;
            // 这里对每个chunk更新进度，并记录已经更新好的避免重复更新，同时对未开始更新的跳过
            for (var i = 0; i < chunks.length; i++) {
              if (chunks[i].percent === 0 || finishedAttr[i]) {
                continue;
              }
              if (compareChunks[i].percent === chunks[i].percent) {
                continue;
              }
              if (chunks[i].percent === 100) {
                finishedAttr[i] = true;
              }
              // $(board)
              //   .find(".fragment-group li")
              //   .eq(i)
              //   .find("#childBarColor")
              //   .css(
              //     "width",
              //     chunks[i].percent + "%"
              //   );
            }
            // $(board)
            //   .find(".speed")
            //   .text("进度：" + total.percent + "% ");
            // dom_total.css(
            //   "width",
            //   total.percent + "%"
            // );
            compareChunks = chunks;
          };
          var subObject = {
            next: next,
            error: error,
            complete: complete
          };
          var subscription;
          // 调用sdk上传接口获得相应的observable，控制上传和暂停
          observable = qiniu.upload(file, key, token, putExtra, config);
          // $(board)
          //   .find(".control-upload")
          //   .on("click", function() {
          //     if(board.start){
          //       $(this).text("暂停上传");
          //       board.start = false;
                subscription = observable.subscribe(subObject);
          //     }else{
          //       board.start = true;
          //       $(this).text("继续上传");
          //       subscription.unsubscribe();
          //     }
          //   });
        }
      })
    }
  }
  controller.init(view, model)
}
// var observable = qiniu.upload(file, key, token, putExtra, config)
// var subscription = observable.subscribe((data)=> {
//   console.log('next', data)
// }, (data)=> {
//   console.log('error', data)
// }, (data)=> {
//   console.log('complete', data)
// }) // 这样传参形式也可以
// 上传取消
// subscription.unsubscribe()