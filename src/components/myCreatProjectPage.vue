<template>
  <div class="hello">
    <search style="position: fixed;top:0;z-index: 999"
            :results="results"
            v-model="value"
            auto-fixed
            position="fixed"
            top="0px"
            @keyup.native="search(value)"
            @on-cancel="cancelSearch"
            ref="search"></search>
    <group gutter="44px">
      <div class="stateBox">
        <div data-num="4" @click="getTaskState($event)">
          <div class="num" style="color: #f44336;">{{stateNum.overtimeNum?stateNum.overtimeNum:0}}</div>
          <div class="stateText">已逾期</div>
        </div>
        <div data-num="0" @click="getTaskState($event)">
          <div class="num" style="color: #ffc107">{{stateNum.unstartNum?stateNum.unstartNum:0}}</div>
          <div class="stateText">未开始</div>
        </div>
        <div data-num="1" @click="getTaskState($event)">
          <div class="num" style="color: #26a2ff">{{stateNum.goingNum?stateNum.goingNum:0}}</div>
          <div class="stateText">进行中</div>
        </div>
        <div data-num="2" @click="getTaskState($event)">
          <div class="num" style="color: #27CF97">{{stateNum.finishNum?stateNum.finishNum:0}}</div>
          <div class="stateText">已完成</div>
        </div>
      </div>
    </group>
    <div class="devide">我发起的
      <div class="paiXu">排序:<span data-num="1" @click="orderTask($event)">按时间</span>&nbsp;<span data-num="2" @click="orderTask($event)">按等级</span></div>
    </div>
    <div class="taskBox">
      <div class="noData" v-if="taskListMsg.length === 0">暂无数据~</div>
      <div class="taskItem" v-if="taskListMsg.length > 0" v-for="(taskItem, index) in taskListMsg" v-bind:key="index" @click="toTaskDetailPage(taskItem.uid)">
        <div class="taskLf">
          <div class="taskName"><div class="taskNameMsg">{{taskItem.jobName}}</div><span v-bind:class="'state' + taskItem.status">{{taskItem.statusStr}}</span></div>
          <div class="taskPro" style="margin-top: 10px;"><span class="label">项</span>&nbsp;{{taskItem.projectName}}</div>
          <div class="taskPro"><span class="label">责</span>&nbsp;{{taskItem.createrName}}</div>
          <div class="taskMsg">
            <div style="color: #ffb400;width: 25%;">等级: <span class="level">{{taskItem.jobLevel}}</span></div>
            <div style="color: chocolate;width: 71%;text-align:right">截止时间: {{taskItem.taskFinishDate}}</div>
          </div>
        </div>
        <div class="taskRt"> <x-icon type="ios-arrow-right" class="arrowRight" size="30"></x-icon></div>
      </div>
      <div style="text-align: center" v-if="taskListTotal > 10">
        <el-button icon="el-icon-plus" style="background-color: #fff;border: none;" @click="addMoreHistory()" v-bind:disabled="notMore">点击加载更多~</el-button>
      </div>
      <div style="font-size: 13px;" v-if="taskListTotal > 10 && notMore">
        <divider style="color: #999;">我是有底线的</divider>
      </div>
    </div>
  </div>
</template>

<script>
import dd from '../../static/dingtalk/dingtalk'
export default {
  name: 'myCreatProjectPage',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      results: [],
      value: '',
      stateNum: '',
      pNum: 1,
      notMore: false,
      taskListMsg: [],
      taskListTotal: '',
      userId: this.$store.state.userId,
      taskListData: {
        userId: this.$store.state.userId,
        pageNum: 1,
        pageSize: 10,
        sType: '',
        jobName: '',
        sort: ''
      }
    }
  },
  watch: {
    taskListTotal: function (val, oVal) {
      if (val > 10) {
        this.notMore = false
      }
    }
  },
  created: function () {
    this.$store.commit('getNowUrl', 2)
    this.$store.commit('isTabShow', true)
    if (!this.$store.state.userId) {
      this.$store.commit('ddLogin', {recallback: 'false', ddgetcfg: ''})
    }
    // 设置钉钉的标题
    if (dd.version) {
      dd.biz.navigation.setTitle({
        title: '我发起的',
        onSuccess: function (result) {
          console.log(result)
        },
        onFail: function (errr) {
          console.log(errr)
        }
      })
    }
    this.settoken()
    this.getTaskDetail()
    this.getTaskCondition()
  },
  methods: {
    settoken: function () {
      this.ajax('/app/setToken', {}).then(res => {
        this.log('setToken:', res)
        this.token = res._jfinal_token
        this.log('this.token:', this.token)
      })
    },
    getTaskDetail: function (type) {
      var that = this
      that.ajax('/app/myLaunchTaskView', that.taskListData).then(res => {
        // console.log('myTaskView:', res)
        if (res.code === 200) {
          console.log('myTaskView', res)
          if (type !== 'more') {
            that.taskListMsg = []
          }
          that.taskListMsg = that.taskListMsg.concat(res.data.list)
          that.taskListTotal = res.data.totalRow
          // console.log('zong:', that.taskListTotal)
          if (that.taskListMsg.length === that.taskListTotal) {
            that.notMore = true
          }
        }
      })
    },
    addMoreHistory: function () {
      this.pNum++
      this.taskListData.pageNum = this.pNum
      this.getTaskDetail('more')
      // console.log('pNum', this.pNum)
    },
    getTaskCondition: function () {
      var that = this
      that.ajax('/app/getLaunchTaskCondition', {userId: that.userId}).then(res => {
        if (res.code === 200) {
          // console.log('getTaskCondition', res)
          that.stateNum = res.data
        }
      })
    },
    search: function (e) {
      // console.log('sezrchh:', e)
      this.taskListData.jobName = e
      this.getTaskDetail()
    },
    cancelSearch: function (e) {
      console.log('cancelSearch:', e)
      this.taskListData.jobName = e
      this.getTaskDetail()
    },
    getTaskState: function (e) {
      var obg = e.currentTarget
      var that = this
      // console.log(obg)
      var stateType = $(obg).attr('data-num')
      that.taskListData.sType = stateType
      $(obg).addClass('active')
      $(obg).siblings().removeClass('active')
      that.getTaskDetail()
    },
    orderTask: function (e) {
      var that = this
      var obg = e.currentTarget
      var orderNum = $(obg).attr('data-num')
      that.taskListData.sort = orderNum
      // console.log(obg)
      $(obg).addClass('now')
      $(obg).siblings().removeClass('now')
      that.getTaskDetail()
    },
    toTaskDetailPage: function (uid) {
      if (uid) {
        this.$router.push('/taskDetailPage/' + uid)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .stateBox{
    width: 100%;
    display: flex;
    padding: 15px 0;
    background-color: #fff;
    justify-content: flex-start;
    border-bottom: 1px solid #e6e6e6;
  }
  .stateBox>div{
    width: 25%;
    text-align: center;
    border-left: 1px solid #e6e6e6;
  }
  .stateBox>div:nth-child(1){
    border-left: none;
  }
  .noData{
    height: 100px;
    line-height: 100px;
    text-align: center;
    font-size: 13px;
    color: #888;
  }
  .num{
    font-size: 18px;
    font-family: '黑体';
    font-weight: bold;
  }
  .stateText{
    color: #999;
    font-size: 15px;
    font-family: '黑体';
  }
  .active .stateText{
    color: #26a2ff
  }
  .taskBox{
    width: 96%;
    margin: 0 auto;
  }
  .taskItem{
    height: 100px;
    border-radius: 4px;
    box-shadow: 2px 2px 4px #ddd;
    border-top: 1px solid #ddd;
    border-left: 1px solid #ddd;
    padding: 6px 10px;
    color: #666;
    font-family: '黑体';
    margin-bottom: 12px;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
  }
  .taskRt{
    width: 6%;
    height: 100px;
    line-height: 100px;
  }
  .arrowRight{
    color: #999;
  }
  .taskLf{
    width: 92%;
  }
  .taskName{
    height: 20px;
    line-height: 20px;
    font-size: 16px;
    text-align: left;
  }
  .taskNameMsg{
    display: inline-block;
    width: 80%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .taskPro{
    height: 16px;
    line-height: 16px;
    font-size: 14px;
    color: #999;
    margin-top: 8px;
    text-align: left;
  }
  .taskMsg{
    color: #999;
    height: 20px;
    line-height: 20px;
    font-size: 13px;
    margin-top: 6px;
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
  .level{
    color: #fff;
    font-size: 14px;
    background-color: #ffb400;
    height: 16px;
    line-height: 16px;
    width: 16px;
    display: inline-block;
    border-radius: 8px;
    text-align: center;
  }
  .state0{
    float: right;
    font-size: 14px;
    color: #ffb400;
  }
  .state1{
    float: right;
    font-size: 14px;
    color: #53b5ff;
  }
  .state2{
    float: right;
    font-size: 14px;
    color: #27CF97;
  }
  .label{
    display: inline-block;
    color: chocolate;
    width: 16px;
    height: 16px;
    font-size: 12px;
    text-align: center;
    line-height: 16px;
    border: 1px solid #ccc;
    border-radius: 8px;
  }
  .devide{
    color: #999;
    height: 40px;
    text-align: left;
    line-height: 40px;
    padding: 0 10px;
    font-family: '黑体';
  }
  .paiXu{
    float: right;
    font-size: 13px;
  }
  .paiXu span{
    color: #3a8ee6;
    width: 40px;
    text-align: center;
    cursor: pointer;
    display: inline-block;
    border-radius: 4px;
    height: 20px;
    line-height: 20px;
  }
</style>
