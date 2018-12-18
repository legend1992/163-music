(function (referWidth, draftWidth) {
  let multiple = draftWidth/referWidth;
  function setRootFontSize() {
    var root = document.documentElement;
    var i = root.clientWidth / referWidth;
    i = i > 2 ? 2 : i;
    root.style.fontSize = i * 100 / multiple + 'px';
  }
  setRootFontSize();
  window.onresize = setRootFontSize;
})(375, 750);