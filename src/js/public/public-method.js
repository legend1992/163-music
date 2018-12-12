module.exports = {
  patchValue(objA, objB) {
    for(let key in objB) {
      if(objA[key]) {
        objA[key].value = objB[key]
      }
    }
  }
}