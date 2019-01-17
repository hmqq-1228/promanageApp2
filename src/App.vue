<template>
  <div id="app">
    <router-view/>
    <tabbar style="position: fixed;bottom: 0;" v-if="tabShowBottom">
      <tabbar-item link="/" v-bind:selected="isTabActive===0?true:false">
        <img slot="icon" src="../static/img/xiangmu.png">
        <img slot="icon-active" src="../static/img/xiangmuActive.png">
        <span slot="label">我的项目</span>
      </tabbar-item>
      <tabbar-item link="/myTaskListPage" v-bind:selected="isTabActive===1?true:false">
        <img slot="icon" src="../static/img/tasked.png">
        <img slot="icon-active" src="../static/img/taskActive.png">
        <span slot="label">我的任务</span>
      </tabbar-item>
      <tabbar-item link="/myCreatProjectPage" v-bind:selected="isTabActive===2?true:false">
        <img slot="icon" src="../static/img/my.png">
        <img slot="icon-active" src="../static/img/myActive.png">
        <span slot="label">我发起的</span>
      </tabbar-item>
      <tabbar-item link="/dataManagePage" v-bind:selected="isTabActive===3?true:false">
        <img slot="icon" src="../static/img/dateManage.png">
        <img slot="icon-active" src="../static/img/dateManageActive.png">
        <span slot="label">日程管理</span>
      </tabbar-item>
    </tabbar>
  </div>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      // select: 'dataManagePage'
    }
  },
  computed: {
    tabShowBottom () {
      return this.$store.state.tabShow
    },
    isTabActive () {
      return this.$store.state.nowUrl
    }
  },
  created: function () {
    this.getScrenHeight()
  },
  methods: {
    getScrenHeight () {
      var ht = parseInt($(window).height()) - 130
      this.$store.state.screenHeight = ht
      console.log('ht', ht)
    }
  }
}
</script>

<style>
#app {
  overflow: scroll;
  /*background-color: #fff;*/
  padding-bottom: 60px;
}
a{
  text-decoration: none;
}
*{
  padding: 0;
  margin: 0;
}
.weui-tabbar__item.weui-bar__item_on .weui-tabbar__label {
  color: #1296db !important;
}
.weui-cell{
  background-color: #fff;
}
.el-message-box{
  width: 80% !important;
}
.vux-datetime{
  color: #666;
}
.weui-cells:after{
  border-bottom: none !important;
}
.el-tabs__active-bar{
  width: 25% !important;
  transform: translateX(25%);
}
.el-tabs__item{
  width: 25%;
  padding: 0;
  text-align: center;
}
.el-tabs__nav{
  width: 100%;
}
.el-tabs--top.el-tabs--card .el-tabs__item:nth-child(2) {
   padding-left: 0;
}
.el-tabs--top.el-tabs--card .el-tabs__item:last-child {
  padding-right: 0;
}
.el-button+.el-button{
  margin-left: 0 !important;
}
.el-button{
  border-radius: 0 !important;
}
.selectData {
  -webkit-appearance: none;
  background-color: #fff;
  background-image: none;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  color: #606266;
  display: inline-block;
  font-size: inherit;
  height: 40px;
  line-height: 40px;
  outline: 0;
  padding: 0 15px;
  -webkit-transition: border-color .2s cubic-bezier(.645,.045,.355,1);
  transition: border-color .2s cubic-bezier(.645,.045,.355,1);
  width: 100%;
}
</style>
