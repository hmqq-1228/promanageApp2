<template>
<div style="padding-bottom: 40px">
  <div class="Schedule">
    <div class="addNewPro" @click="toAddNewSchedule()"><img src="../../static/img/newaddSchedule.png" alt=""></div>
    <div class="header">
      <div class="headerCnt">
        <div class="headerCntTit">
          <div style="font-size: 22px;" class="el-icon-caret-left" v-on:click="monBefore()"></div>
          <div style="display: inline-block;width: 24%;" @click="selectYearMonth">
            <span style="font-size: 16px;">{{year}}</span><br>
            <span style="font-size: 22px;">{{month}} 月</span>
          </div>
          <div style="font-size: 22px;" class="el-icon-caret-right" v-on:click="monNext()"></div>
        </div>
      </div>
    </div>
    <div class="content">
      <div class="weekHeader">
        <div style="color: red" class="weekItem">日</div>
        <div class="weekItem">一</div>
        <div class="weekItem">二</div>
        <div class="weekItem">三</div>
        <div class="weekItem">四</div>
        <div class="weekItem">五</div>
        <div style="color: red" class="weekItem">六</div>
      </div>
      <div class="grids">
        <div class="grid" v-for="day in monGrids" :key="day.id" @click="selectDayTask(day.modelDay)">
          <div v-bind:class="day.classStyle">
            <div class="dayDate" v-bind:class="day.light?'light':''">{{day.date===0?'':day.date}} <span v-if="day.mark" style="color: red;">&bull;</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div style="margin-bottom: 20px;text-align: right;margin-right: 10px;padding-top: 10px;">
    <el-radio-group v-model="mySchedulePayload.radio6" size="mini" @change="getCheckType($event)">
      <el-radio-button data-showType="schedule" label="日程"></el-radio-button>
      <el-radio-button data-showType="task" label="任务"></el-radio-button>
      <el-radio-button data-showType="launchTask" label="发起"></el-radio-button>
    </el-radio-group>
  </div>
  <div class="scheduleList">
    <div class="scheduleItem" v-if="schedule.type > 1" v-for="(schedule, index) in scheduleMsgLists" v-bind:key="index" @click="toTaskDetail(schedule.type, schedule.id)">
      <div style="display: flex;justify-content: space-between">
        <div class="scheduleName">{{schedule.title}}</div>
        <div class="scheduleState" v-bind:class=" 'statusType' + schedule.status">{{schedule.statusStr}}</div>
      </div>
      <div style="display: flex;justify-content: space-between;padding-top: 10px">
        <div class="schedulePeo" style="color: #888;font-size: 14px;"><span class="label"><span v-if="schedule.type === 2">创</span><span v-if="schedule.type === 3">责</span></span> {{schedule.name}}</div>
        <div class="scheduleTime"><span class="label">止</span> {{schedule.endTime}}</div>
      </div>
    </div>
    <swipeout>
      <swipeout-item transition-mode="follow" v-if="schedule.type === 1" v-for="(schedule, index) in scheduleMsgLists" v-bind:key="index" @click="toTaskDetail(schedule.type, schedule.id)">
        <div slot="right-menu">
          <swipeout-button @click.native="updateSchedule(schedule.id)" type="primary">详情</swipeout-button>
          <swipeout-button @click.native="deleteSchedule(schedule.id)" type="warn">删除</swipeout-button>
        </div>
        <div slot="content" class="demo-content vux-1px-t">
          <div class="scheduleItem1">
            <div class="scheduleName1">{{schedule.title}}</div>
            <div class="scheduleTime1"><span class="label">止</span> {{schedule.endTime}}</div>
          </div>
        </div>
      </swipeout-item>
    </swipeout>
    <div style="text-align: center;color: #999;font-size: 13px;padding-top: 50px;" v-if="scheduleMsgLists.length === 0">
      <div>今天没有{{mySchedulePayload.radio6}}, 去看看其他工作吧~</div>
    </div>
  </div>
  <div style="text-align: center;margin-top: 20px;" v-if="taskListTotal > 10">
    <el-button icon="el-icon-plus" style="background-color: #fff;border: none;" @click="addMoreHistory()" v-bind:disabled="notMore">点击加载更多~</el-button>
  </div>
</div>
</template>

<script>
import dd from '../../static/dingtalk/dingtalk'
export default {
  name: 'dataManagePage',
  data () {
    return {
      radio: '1',
      pNum: 1,
      year: 2018,
      month: 1,
      defultTime: '',
      schEditId: '',
      Dloading: false,
      Uloading: false,
      notMore: false,
      isCanEditMsg: true,
      realDay: '',
      nowHours: '',
      nowMinte: '',
      nowScond: '',
      nowDayTime: '',
      crruDayTimeSond: '',
      taskListTotal: 0,
      // scheduleFormVisible: false,
      // scheduleUpdateVisible: false,
      weekDay: 0, // 某月的一号是周几
      dateOneFormart: '', // 某月1号的格式化日期
      monthMax: 31,
      monGrids: [],
      scheduleList: [],
      scheduleMsgLists: [],
      allScheduleTaskId: [],
      scheduleListPayload: {
        userId: this.$store.state.userId,
        month: '',
        year: ''
      },
      mySchedulePayload: {
        userId: this.$store.state.userId,
        schedule: true,
        task: false,
        launchTask: false,
        pageNum: 1,
        pageSize: 10,
        radio6: '日程',
        date: ''
      }
    }
  },
  created: function () {
    this.$store.commit('getNowUrl', 3)
    this.$store.commit('isTabShow', true)
    // this.$store.commit('setRouter', {name: 'mySchedulePage', path: '/mySchedulePage'})
    if (!this.$store.state.userId) {
      this.$store.commit('ddLogin', {recallback: 'false', ddgetcfg: ''})
    }
    // 设置钉钉的标题
    if (dd.version) {
      dd.biz.navigation.setTitle({
        title: '我的日程',
        onSuccess: function (result) {
          console.log(result)
        },
        onFail: function (errr) {
          console.log(errr)
        }
      })
    }
    var dateObj = new Date()
    this.year = dateObj.getFullYear()
    this.month = dateObj.getMonth() + 1
    if (this.month < 10) {
      this.month = '0' + this.month
    }
    this.realDay = dateObj.getDate()
    if (this.realDay < 10) {
      this.realDay = '0' + this.realDay
    }
    this.nowHours = dateObj.getHours()
    if (this.nowHours < 10) {
      this.nowHours = '0' + this.nowHours
    }
    this.nowMinte = dateObj.getMinutes()
    if (this.nowMinte < 10) {
      this.nowMinte = '0' + this.nowMinte
    }
    this.nowScond = dateObj.getSeconds()
    if (this.nowScond < 10) {
      this.nowScond = '0' + this.nowScond
    }
    this.nowDayTime = this.year + '-' + this.month + '-' + this.realDay
    this.crruDayTimeSond = this.year + '-' + this.month + '-' + this.realDay + ' ' + this.nowHours + ':' + this.nowMinte + ':' + this.nowScond
    // 日期挂载
    this.dateMountInit(this.monDateOneFormart())
    // 获取日程列表
    this.selectDayTask(this.nowDayTime)
    this.settoken()
  },
  watch: {
    taskListTotal: function (val, oVal) {
      if (val > 10) {
        this.notMore = false
      }
    }
  },
  methods: {
    settoken: function () {
      this.ajax('/app/setToken', {}).then(res => {
        this.token = res._jfinal_token
      })
    },
    // 选择年月
    selectYearMonth: function () {
      var that = this
      that.$vux.datetime.show({
        cancelText: '取消',
        confirmText: '确定',
        format: 'YYYY-MM',
        value: that.year + '-' + that.month,
        onConfirm (val) {
          console.log('plugin confirm', val.split('-')[0])
          that.year = val.split('-')[0]
          that.month = val.split('-')[1]
          that.dateMountInit(that.monDateOneFormart())
        },
        onShow () {
          console.log('plugin show')
        },
        onHide () {
          console.log('plugin hide')
        }
      })
    },
    // 获取某月的天数
    getMonDays: function () {
      var that = this
      var d = new Date(that.year, that.month, 0)
      return d.getDate()
    },
    // 某月1号的格式化日期
    monDateOneFormart: function () {
      this.dateOneFormart = this.year + '-' + this.month + '-' + '01' + ' 00:00:00'
      return this.dateOneFormart
    },
    // 日期挂载到格子初始化
    dateMountInit: function (dateFormart) {
      var that = this
      this.monGrids = []
      var myDate = new Date(dateFormart.replace(/-/g, '/'))
      this.month = myDate.getMonth() + 1
      this.monthMax = this.getMonDays()
      var weekDay = myDate.getDay()
      that.weekDay = weekDay
      // 请求体赋值
      that.scheduleListPayload.year = that.year
      that.scheduleListPayload.month = that.month
      // 日程接口调用
      this.ajax('/appSchedule/getScheduleList', that.scheduleListPayload).then(res => {
        if (res.code === 200) {
          // this.log(0)
          that.scheduleList = res.data.list
          for (var i = 0; i < 42; i++) {
            var obj = {
              light: false,
              classStyle: '',
              date: 0,
              modelDay: '',
              allMon: '',
              totalNum: 0,
              mark: false,
              dayTaskList: [],
              id: 'id_' + that.month + '_' + i
            }
            if (i >= weekDay) {
              if (i - (weekDay - 1) <= that.monthMax) {
                obj.date = i - (weekDay - 1)
                obj.allMon = that.month
                var allDay
                var modMon
                if (obj.date < 10) {
                  allDay = '0' + obj.date
                } else {
                  allDay = obj.date
                }
                if (obj.allMon < 10) {
                  modMon = '0' + obj.allMon
                } else {
                  modMon = obj.allMon
                }
                obj.modelDay = that.year + '-' + modMon + '-' + allDay
              }
            }
            this.monGrids.push(obj)
          }
          for (var n = 0; n < that.monGrids.length; n++) {
            if (that.monGrids[n].modelDay === that.nowDayTime) {
              that.monGrids[n].light = true
            }
            for (var j = 0; j < that.scheduleList.length; j++) {
              if (that.scheduleList[j].jobNum > 0 || that.scheduleList[j].launchJobNum > 0 || that.scheduleList[j].scheduleNum > 0) {
                if (that.monGrids[n].modelDay === that.scheduleList[j].scheduleDate.split(' ')[0]) {
                  that.monGrids[n].mark = true
                }
              }
            }
          }
        } else {
        }
      })
    },
    // 切换日程、任务、发起
    getCheckType: function (e) {
      this.pNum = 1
      this.mySchedulePayload.pageNum = this.pNum
      this.scheduleMsgLists = []
      this.mySchedulePayload.radio6 = e
      this.selectDayTask(this.mySchedulePayload.date)
    },
    // 加载更多
    addMoreHistory: function () {
      var that = this
      this.pNum++
      this.mySchedulePayload.pageNum = this.pNum
      that.mySchedulePayload.date = this.mySchedulePayload.date
      if (that.mySchedulePayload.radio6 === '日程') {
        that.mySchedulePayload.schedule = true
        that.mySchedulePayload.task = false
        that.mySchedulePayload.launchTask = false
      } else if (that.mySchedulePayload.radio6 === '任务') {
        that.mySchedulePayload.schedule = false
        that.mySchedulePayload.task = true
        that.mySchedulePayload.launchTask = false
      } else if (that.mySchedulePayload.radio6 === '发起') {
        that.mySchedulePayload.schedule = false
        that.mySchedulePayload.task = false
        that.mySchedulePayload.launchTask = true
      }
      this.ajax('/appSchedule/getScheduleDetailList', that.mySchedulePayload).then(res => {
        if (res.code === 200) {
          that.scheduleMsgLists = that.scheduleMsgLists.concat(res.data.list)
          that.taskListTotal = res.data.totalRow
          if (that.scheduleMsgLists.length === that.taskListTotal) {
            that.notMore = true
          }
        }
      })
    },
    // 点击每天查询日程、任务
    selectDayTask: function (day) {
      if (day) {
        var that = this
        that.pNum = 1
        that.mySchedulePayload.pageNum = 1
        this.scheduleMsgLists = []
        that.mySchedulePayload.date = day
        if (that.mySchedulePayload.radio6 === '日程') {
          that.mySchedulePayload.schedule = true
          that.mySchedulePayload.task = false
          that.mySchedulePayload.launchTask = false
        } else if (that.mySchedulePayload.radio6 === '任务') {
          that.mySchedulePayload.schedule = false
          that.mySchedulePayload.task = true
          that.mySchedulePayload.launchTask = false
        } else if (that.mySchedulePayload.radio6 === '发起') {
          that.mySchedulePayload.schedule = false
          that.mySchedulePayload.task = false
          that.mySchedulePayload.launchTask = true
        }
        for (var n = 0; n < that.monGrids.length; n++) {
          if (that.monGrids[n].modelDay === day) {
            that.monGrids[n].classStyle = 'selectedDay'
          } else if (that.monGrids[n].modelDay !== day) {
            that.monGrids[n].classStyle = ''
          }
        }
        this.ajax('/appSchedule/getScheduleDetailList', that.mySchedulePayload).then(res => {
          if (res.code === 200) {
            that.scheduleMsgLists = that.scheduleMsgLists.concat(res.data.list)
            that.taskListTotal = res.data.totalRow
            if (that.scheduleMsgLists.length === that.taskListTotal) {
              that.notMore = true
            } else if (that.scheduleMsgLists.length < that.taskListTotal) {
              that.notMore = false
            }
          }
        })
      }
    },
    // 新增日程
    toAddNewSchedule: function () {
      var that = this
      that.$router.push('/addNewSchedule')
    },
    // 获取日程详情
    updateSchedule: function (schid) {
      var that = this
      // that.isCanEditMsg = true
      that.schEditId = schid
      console.log('that.schEditId', that.schEditId)
      if (that.schEditId) {
        that.$router.push('/scheduleDetail/' + that.schEditId)
      }
    },
    // 删除
    deleteSchedule: function (schid) {
      var that = this
      var schId = schid
      that.$confirm('是否删除此日程？', '', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        that.ajax('/appSchedule/delSchedule', {sdId: schId}).then(res => {
          if (res.code === 200) {
            that.$message.success('删除成功！')
            that.isCanEditMsg = true
            that.scheduleMsgLists = []
            that.selectDayTask(that.mySchedulePayload.date)
            that.dateMountInit(that.monDateOneFormart())
          }
        })
      }).catch(() => {
        // that.loading = false
      })
    },
    toTaskDetail: function (type, sId) {
      var that = this
      if (type === 1) {
        return false
      } else if (type > 1) {
        if (sId) {
          that.$router.push('/taskDetailPage/' + sId)
        }
      }
    },
    // 上一个月
    monBefore: function () {
      this.scheduleMsgLists = []
      if (this.month === 1) {
        this.year = this.year - 1
        this.month = 12
      } else {
        this.month = this.month - 1
      }
      this.dateMountInit(this.monDateOneFormart())
    },
    // 下一个月
    monNext: function () {
      this.scheduleMsgLists = []
      if (this.month === 12) {
        this.year = this.year + 1
        this.month = 1
      } else {
        this.month = this.month + 1
      }
      this.dateMountInit(this.monDateOneFormart())
    }
  }
}
</script>

<style scoped>
  .Schedule{
    background-color: #f1f6fa;
    border-bottom: 1px solid #dfdfdf;
  }
  .selectedDay{
    border-radius: 50%;
    width: 32px;
    margin: 0 auto;
    background-color: #d5d5d5;
  }
  .header{
    padding:5px 10px;
    background-color: #409eff;
    position: fixed;
    width: 100%;
    top: 0;
  }
  .weekItem{
    width: 13.4%;
  }
  .addNewPro{
    position: fixed;
    right: 0;
    width: 22px;
    top: 33%;
    z-index: 100;
  }
  .addNewPro img{
    width: 100%;
  }
  .headerCnt{
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin: 0 auto;
  }
  .headerCntTit{
    width: 100%;
    color: #fff;
    background-color: #409eff;
    text-align: center;
  }
  .headerCntTit span{
    font-size: 22px;
  }
  .content{
    width: 100%;
    margin: 0 auto;
    background-color: #fff;
    border-radius: 6px;
    _min-height: 700px;
  }
  .weekHeader{
    display: flex;
    text-align: center;
    padding: 5px 0;
    font-family: '黑体';
    height: 40px;
    color: #666;
    line-height: 40px;
    justify-content: space-between;
    border-bottom: 1px solid #ddd;
  }
  .grids{
    display: flex;
    flex-wrap: wrap;
    margin-top: 10px;
    justify-content: space-between;
  }
  .grid{
    width: 13.4%;
    height: 34px;
    color: #666;
    margin-top: 10px;
    box-sizing: border-box;
  }
  .label{
    display: inline-block;
    color: chocolate;
    width: 16px;
    height: 16px;
    font-size: 10px;
    text-align: center;
    line-height: 16px;
    border: 1px solid chocolate;
    border-radius: 10px;
  }
  .scheduleItem {
    /*display: flex;*/
    color: #666;
    font-family: '黑体';
    padding:10px;
    background-color: #fff;
    border-bottom: 1px dashed #ddd;
    /*justify-content: space-between;*/
  }
  .scheduleItem1 {
    display: flex;
    color: #666;
    height: 40px;
    font-family: '黑体';
    padding: 0 10px;
    line-height: 40px;
    background-color: #fff;
    border-bottom: 1px dashed #ddd;
    justify-content: space-between;
  }
  .scheduleItem:nth-of-type(1){
    border-top: 1px dashed #ddd;
  }
  .scheduleItem1:nth-of-type(1){
    border-top: 1px dashed #ddd;
  }
  .scheduleName{
    font-size: 16px;
    width: 76%;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
  }
  .scheduleName1{
    font-size: 15px;
    width: 50%;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
  }
  .scheduleState{
    width: 22%;
    font-size: 14px;
    text-align: right;
  }
  .scheduleState1{
    width: 22%;
    font-size: 14px;
    text-align: right;
    padding-top: 6px;
  }
  .schedulePeo {
    width: 50%;
    font-size: 16px;
  }
  .scheduleTime{
    font-size: 14px;
    width: 50%;
    text-align: right;
  }
  .scheduleTime1{
    font-size: 14px;
    text-align: center;
  }
  /*.grid.light{*/
  /*_border: 1px solid red;*/
  /*background-color: #3a8ee6;*/
  /*}*/
  .dayDate{
    text-align: center;
    margin: 0 auto;
    height: 32px;
    width: 32px;
    border-radius: 16px;
    line-height: 32px;
  }
  .dayDate.light{
    color: #fff;
    border-radius: 16px;
    width: 32px;
    height: 32px;
    line-height: 32px;
    margin: 0 auto;
    background-color: rgba(38, 162, 255, 0.63);
  }
  .statusType0{
    color: #ffc107;
  }
  .statusType1{
    color: #26a2ff;
  }
  .statusType2{
    color: #27CF97;
  }
  /*.taskItem:hover{*/
  /*background-color: #cde7fb;*/
  /*}*/
</style>
