<template>
  <div>
    <div>{{getUserId?'':''}}</div>
    <search style="position: fixed;top:0;z-index: 999"
            :results="results"
            v-model="value"
            auto-fixed
            position="fixed"
            top="0px"
            @keyup.native="search(value)"
            @on-cancel="cancelSearch"
            ref="search">
    </search>
    <!--<mt-search-->
      <!--style="height: 45px;"-->
      <!--v-model="value"-->
      <!--cancel-text="取消"-->
      <!--placeholder="搜索" @keyup.native="search(value)">-->
    <!--</mt-search>-->
    <div class="cont">
      <!--<div class="devide">任务状态</div>-->
      <div class="stateBox">
        <div data-num="4" @click="getTaskState($event)">
          <div class="num" style="color: #f44336;">{{stateNum.overtimeNum?stateNum.overtimeNum:0}}</div>
          <div class="stateText">已过期</div>
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
      <div class="devide">问题列表
        <div class="paiXu">排序:<span data-num="1" @click="orderTask($event)">按时间</span>&nbsp;<span data-num="2" @click="orderTask($event)">按等级</span></div>
      </div>
      <div class="taskBox">
        <div class="noData" v-if="taskListMsg.length === 0">暂无数据~</div>
        <div class="taskItem" v-if="taskListMsg.length > 0" v-for="(taskItem, index) in taskListMsg" v-bind:key="index" @click="toTaskDetailPage(taskItem.uid)">
          <div class="taskLf">
            <div class="taskName">{{taskItem.jobName}}<span v-bind:class="'state' + taskItem.status">{{taskItem.statusStr}}</span></div>
            <div class="taskPro" style="margin-top: 10px;"><span class="label">馈</span>&nbsp;{{taskItem.projectName}}</div>
            <div class="taskPro"><span class="label">提</span>&nbsp;{{taskItem.createrName}}</div>
            <div class="taskMsg">
              <span style="color: #ffb400;float: left;">级别: <span class="level">{{taskItem.jobLevel}}</span></span>&nbsp;&nbsp;&nbsp;&nbsp;
              <span style="color: chocolate;float: right">截止时间:{{taskItem.taskFinishDate}}</span>
            </div>
          </div>
          <div class="taskRt"><i class="el-icon-arrow-right" style="font-size: 22px;"></i></div>
        </div>
        <div style="text-align: center" v-if="taskListTotal > 10">
          <el-button icon="el-icon-plus" style="background-color: #fff;border: none;" @click="addMoreHistory()" v-bind:disabled="notMore">点击加载更多~</el-button>
        </div>
      </div>
    </div>
    <div class="otherFooter" @click="addNewQuestion()">
      <div><i style="font-size: 22px" class="el-icon-circle-plus-outline"></i> 提出问题</div>
    </div>
  </div>
</template>

<script>
import dd from '../../static/dingtalk/dingtalk'
import $ from 'jquery'
export default {
  name: 'addTaskOtherList',
  data () {
    return {
      results: [],
      value: '',
      stateNum: '',
      pNum: 1,
      projectUID: this.$store.state.projectUID,
      planId: this.$store.state.planId,
      notMore: false,
      taskListMsg: [],
      taskListTotal: '',
      nowUrl: this.$route.fullPath,
      userId: this.$store.state.userId,
      taskListData: {
        userId: this.$store.state.userId,
        projectUID: this.$store.state.projectUID,
        pageNum: 1,
        pageSize: 10,
        sType: '',
        jobName: '',
        sort: ''
      }
    }
  },
  created: function () {
    this.$store.commit('isTabShow', false)
    this.$store.commit('getNowUrl', 'task')
    this.$store.commit('setRouter', {name: 'taskListPage', path: '/taskListPage'})
    if (!this.$store.state.userId) {
      this.$store.commit('ddLogin', {recallback: 'false', ddgetcfg: 'getLaunchDDConfig'})
    }
    this.getTaskDetail()
    this.getTaskCondition()
  },
  watch: {
    value: function (val, oldVal) {
      this.taskListData.pageNum = 1
      this.pNum = 1
      this.taskListData.pageSize = 10
      this.search(val)
      if (val === '') {
        this.pNum = 1
        this.taskListData.pageNum = 1
        this.taskListData.pageSize = 10
        this.notMore = false
      }
    },
    taskListTotal: function (val, oVal) {
      if (val > 10) {
        this.notMore = false
      }
    },
    userId: function (newVal, oldVal) {
      if (newVal) {
        this.getTaskDetail()
        this.getTaskCondition()
        // 设置标题
        if (dd.version) {
          dd.biz.navigation.setTitle({
            title: '问题列表',
            onSuccess: function (result) {
              console.log(result)
            },
            onFail: function (errr) {
              console.log(errr)
            }
          })
        }
      }
    }
  },
  computed: {
    getUserId: function () {
      var that = this
      that.userId = that.$store.state.userId
      return that.$store.state.userId
    }
  },
  methods: {
    // 顶部搜索
    search: function (e) {
      // console.log('sezrchh:', e)
      this.taskListData.jobName = e
      this.getTaskDetail()
    },
    // 顶部搜索 取消
    cancelSearch: function (e) {
      // console.log('cancelSearch:', e)
      this.myProjectViewPayload.projectName = e
      this.getTaskDetail()
    },
    getTaskDetail: function (type) {
      var that = this
      that.ajax('/app/myLaunchTaskView', that.taskListData).then(res => {
        console.log('myTaskView:', res)
        if (res.code === 200) {
          console.log('myTaskView', res)
          if (type !== 'more') {
            that.taskListMsg = []
          }
          that.taskListMsg = that.taskListMsg.concat(res.data.list)
          that.taskListTotal = res.data.totalRow
          console.log('zong:', that.taskListTotal)
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
      console.log('pNum', this.pNum)
    },
    getTaskCondition: function () {
      var that = this
      that.ajax('/app/getLaunchTaskCondition', {userId: that.userId, projectUID: that.projectUID}).then(res => {
        if (res.code === 200) {
          console.log('getTaskCondition', res)
          that.stateNum = res.data
        }
      })
    },
    getTaskState: function (e) {
      var obg = e.currentTarget
      var that = this
      console.log(obg)
      var stateType = $(obg).attr('data-num')
      that.taskListData.sType = stateType
      $(obg).addClass('active')
      $(obg).siblings().removeClass('active')
      that.ajax('/app/myTaskView', that.taskListData).then(res => {
        if (res.code === 200) {
          this.getTaskDetail()
        }
      })
    },
    orderTask: function (e) {
      var that = this
      var obg = e.currentTarget
      var orderNum = $(obg).attr('data-num')
      that.taskListData.sort = orderNum
      console.log(obg)
      $(obg).addClass('now')
      $(obg).siblings().removeClass('now')
      that.ajax('/app/myTaskView', that.taskListData).then(res => {
        if (res.code === 200) {
          this.getTaskDetail()
        }
      })
    },
    toTaskDetailPage: function (uid) {
      if (uid) {
        this.$router.push('/taskDetailPage/' + uid)
      }
    },
    addNewQuestion: function () {
      this.$router.push('/addNewTaskOther')
    }
  }
}
</script>

<style scoped>
  a {
    color: #999;
  }
  .otherFooter{
    color: #fff;
    height: 50px;
    width: 100%;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 999;
    font-size: 17px;
    font-family: '黑体';
    text-align: center;
    line-height: 50px;
    background-color: #409EFF;
    border-top: 1px solid #e6e6e6;
  }
  .noData{
    height: 100px;
    line-height: 100px;
    text-align: center;
    font-size: 13px;
    color: #888;
  }
  .active p{
    color: #3a8ee6;
  }
  .paiXu .now{
    color: #53b5ff;
    background-color: #eaeaea;
  }
  /*.showMore{*/
  /*height: 30px;*/
  /*color: #999;*/
  /*width: 120px;*/
  /*text-align: center;*/
  /*margin: auto;*/
  /*font-size: 14px;*/
  /*line-height: 30px;*/
  /*background-color: #f1f1f1;*/
  /*}*/
  .state0{
    float: right;
    font-size: 14px;
    color: #e40707;
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
  .active{
    _background-color: #f5f5f5;
  }
  .mint-header .mint-button{
    color: #fff;
  }
  .cont{
    _position: relative;
    height: 100%;
    width: 100%;
    margin-top: 45px;
    padding-bottom: 20px;
    background-color: #f5f8fa;
  }
  .devide{
    color: #999;
    height: 30px;
    text-align: left;
    line-height: 30px;
    padding: 0 10px;
    font-family: '黑体';
    margin-top: 12px;
  }
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
  .num{
    font-size: 18px;
    font-family: '黑体';
    font-weight: bold;
  }
  .label{
    display: inline-block;
    width: 16px;
    height: 16px;
    font-size: 12px;
    text-align: center;
    line-height: 16px;
    border: 1px solid #ccc;
    border-radius: 8px;
  }
  .stateText{
    color: #999;
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
  }
  .taskRt{
    float: right;
    height: 100px;
    line-height: 100px;
    font-size: 20px;
    color: #999;
  }
  .taskLf{
    width: 90%;
    float: left;
  }
  .taskName{
    height: 20px;
    line-height: 20px;
    font-size: 16px;
    text-align: left;
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
    text-align: right;
    margin-top: 6px;
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
</style>
