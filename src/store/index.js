import Vue from 'vue'
import Vuex from 'vuex'
// import $ from "jquery";
import dd from '../../static/dingtalk/dingtalk'
// import $ from 'jquery'

Vue.use(Vuex)

var callNum = 0
const state = {
  debug: true,
  // 可用屏幕高
  screenHeight: 0,
  nodeMsg: '',
  // nodeType: '',
  currentTab: 'ProDetailBase',
  // 袁鹏
  // baseServiceUrl: 'http://yp.vaiwan.com:8081',
  // baseServiceUrl: 'http://10.0.5.29:8088',
  // 郭松恒
  // baseServiceUrl: 'http://gsh.vaiwan.com:8081',
  // baseServiceUrl: 'http://10.0.5.66:8089',
  // baseServiceUrl: 'http://pms.baho.cn:8080/pms',
  baseServiceUrl: 'http://ityp.baho.cn/pms',
  // baseServiceUrl: 'https://pms.baho.cn/pms',
  tabShow: true,
  ddGetConfigActionName: 'getDDConfig',
  otherList: 'other',
  loginData: '',
  userId2: '',
  userId: '',
  nowUrl: 'project',
  planId: 'P0f427250b8e5456284cd0dad10963c66',
  projectUID: 'S985f6fce4c314bdea9af55087557936c',
  testUserId: 'M5773D95A7D6CBE10',
  developUser: {
    dg: 'M5773D95A7D6CBE10',
    hm: 'M9AB565771B1BB50F'
  },
  testClickNum: 0,
  routerArr: [],
  message: 'MainPage',
  // 可预览的文件格式
  fileFormat: ['jpg', 'jpeg', 'png', 'gif']
}
function login (code) {
  $.ajax({
    url: state.baseServiceUrl + '/app/login',
    type: 'POST',
    dataType: 'JSON',
    data: {code: code},
    success: function (data) {
      // alert(JSON.stringify(data))
      // alert('钉钉免登录success:' + JSON.stringify(data))
      if (data.code === 200) {
        // alert('store,dingdingLogin2')
        state.userId = data.data.ID
        state.loginData = data
      } else {
        alert(data.msg)
      }
    },
    error: function (data) {
      alert(JSON.stringify(data))
    }
  })
}
function dingdingLogin (isrest) {
  // alert('dingdingLogin:' + isrest)
  // console.log('store,dingdingLogin')
  if (dd.version) {
    getDDConfig(isrest)
  } else {
    state.userId = state.testUserId
  }
}
// dingdingLogin('false')
function getDDConfig (isrest) {
  // alert('isrest:' + isrest)
  // alert('ddGetConfigActionName:' + state.ddGetConfigActionName)
  var isRest = isrest || 'false'
  $.ajax({
    url: state.baseServiceUrl + '/app/' + state.ddGetConfigActionName + '?isRest=' + isRest,
    type: 'GET',
    dataType: 'JSON',
    context: document.body,
    success: function (data) {
      // alert('data:' + JSON.stringify(data))
      dd.config({
        // 服务端传来的congfig信息
        agentId: data.data.agentid,
        corpId: data.data.corpId,
        timeStamp: data.data.timeStamp,
        nonceStr: data.data.nonceStr,
        signature: data.data.signature,
        // 所有需要使用到的jsapi需要在config的时候进行注册，写在这
        jsApiList: [
          'runtime.info', 'biz.contact.choose',
          'device.notification.confirm', 'device.notification.alert',
          'device.notification.prompt', 'biz.ding.post',
          'biz.util.openLink'
        ]
      })

      dd.error(function (err) {
        callNum += 1
        // alert('err' + JSON.stringify(err))
        if (callNum < 2) {
          dingdingLogin('true')
        } else {
          console.log('dd error: ', JSON.stringify(err))
        }
      })

      dd.ready(function () {
        dd.runtime.permission.requestAuthCode({
          corpId: data.data.corpId,
          onSuccess: function (result) {
            // alert(JSON.stringify(result))
            login(result.code)
          }
        })
      })
    },
    error: function (data) {
      console.log('err:', data)
    }
  })
}
const mutations = {
  currentTabSet (state, currentTab) {
    state.currentTab = currentTab
  },
  isTabShow (state, isShow) {
    state.tabShow = isShow
  },
  getNodeMsg (state, node) {
    state.nodeMsg = node
  },
  getNowUrl (state, name) {
    state.nowUrl = name
  },
  setRouter (state, obj) {
    var isExist = false
    for (var i = 0; i < state.routerArr.length; i++) {
      if (obj.name === state.routerArr[i].name) {
        isExist = true
        state.routerArr = state.routerArr.splice(i + 1)
      }
    }
    if (!isExist) {
      state.routerArr.push(obj)
    }
  },
  ddLogin (state, obj) {
    // dingdingLogin
    if (dd.version) {
      // alert('dd.version:' + dd.version)
      if (obj.ddgetcfg) {
        // alert('ConfigActionName;123:' + obj.ddgetcfg)
        state.ddGetConfigActionName = obj.ddgetcfg
      }
      dingdingLogin(obj.recallback)
    } else {
      state.userId = state.testUserId
    }
  }
}

export default new Vuex.Store({
  state,
  mutations
})
