module.exports = {
  patchValue(objA, objB) {
    for(let key in objB) {
      if(objA[key]) {
        objA[key].value = objB[key]
      }
    }
  },
  getUrlParam(name){
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r!=null) return unescape(r[2]);
    return null;
  }
}