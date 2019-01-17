import $ from 'jquery'
import store from '@/store'
// import router from '@/router'
const install = function (Vue, options) {
  Vue.prototype.ajax = function (actionName, postData) {
    var baseurl
    if (postData.payload) {
      postData.payload = JSON.parse(postData.payload)
      postData.payload.userId = store.state.userId
      postData.payload = JSON.stringify(postData.payload)
    } else {
      postData.userId = store.state.userId
    }
    baseurl = store.state.baseServiceUrl + actionName
    return $.ajax({
      url: baseurl,
      type: 'POST',
      async: true,
      xhrFields: {
        withCredentials: true,
        useDefaultXhrHeader: false
      },
      crossDomain: true,
      data: postData,
      success: function (data) {
        if (data.code === 201) {
          // alert('ajax:' + data.code)
          // store._mutations.ddLogin[0]()
        }
      }
    })
  }
  Vue.prototype.log = function (mark, cont) {
    if (store.state.debug) {
      if (cont) {
        return window.console.log(mark, cont)
      } else {
        return window.console.log(mark)
      }
    }
  }
  Vue.prototype.alert = function (test) {
    if (store.state.debug) {
      return window.alert(test)
    }
  }
  Vue.prototype.isImage = function (fileName) {
    var geshi = fileName.substr(-4).indexOf('.') > -1 ? fileName.toLowerCase().substr(-3) : fileName.toLowerCase().substr(-4)
    var isImg = false
    for (var i = 0; i < store.state.fileFormat.length; i++) {
      if (store.state.fileFormat[i] === geshi) {
        isImg = true
      }
    }
    return isImg
  }
}
export default {
  install
}
