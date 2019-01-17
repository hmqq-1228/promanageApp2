// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import { Confirm, Swipeout, SwipeoutItem, SwipeoutButton, DatetimePlugin, Group, Search, XButton, Grid, GridItem, DatetimeRange, Tabbar, TabbarItem, Actionsheet, XSwitch, XCircle, Divider, Selector, XInput, Datetime } from 'vux'
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import store from './store'
import router from './router'
import ajax from './assets/ajax/ajax.js'
import $ from 'jquery'

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(ajax)
Vue.use(DatetimePlugin)
Vue.component('x-button', XButton)
Vue.component('search', Search)
Vue.component('group', Group)
Vue.component('grid', Grid)
Vue.component('grid-item', GridItem)
Vue.component('tabbar', Tabbar)
Vue.component('x-switch', XSwitch)
Vue.component('tabbar-item', TabbarItem)
Vue.component('datetime-range', DatetimeRange)
Vue.component('actionsheet', Actionsheet)
Vue.component('x-circle', XCircle)
Vue.component('divider', Divider)
Vue.component('selector', Selector)
Vue.component('x-input', XInput)
Vue.component('datetime', Datetime)
Vue.component('swipeout', Swipeout)
Vue.component('confirm', Confirm)
Vue.component('swipeout-item', SwipeoutItem)
Vue.component('swipeout-button', SwipeoutButton)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  $,
  components: { App },
  template: '<App/>'
})
