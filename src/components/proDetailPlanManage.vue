<template>
  <!--<div>这是计划管理页面</div>-->
  <div class="treeWrap">
    <div class="compBox">
      <proDetailPlanTreeComp v-bind:childrenData="treeData" v-bind:permissions="permissions" v-on:selectEmit="selectEmitFuc" v-on:addEmit="addEmitFuc" v-on:chakanEmit="chakanEmitFuc" v-on:delEmit="delClick"></proDetailPlanTreeComp>
    </div>
    <!--bgcover结束 计划详情 修改计划-->
    <div class="bgCover" v-if="detailformVisible">
      <div class="bgCoverCnt1">
        <h2>计划详情</h2>
        <div class="colose" @click="detailformClose()"><i class="el-icon-close"></i></div>
        <div class="bgCoverTabs">
          <!--计划form-->
          <div class="planTaskBox">
            <el-form ref="detailform" :model="detailform" :rules="editTaskRules" label-width="80px">
              <el-form-item label="计划名称" prop="name" maxlength="100" width="100">
                <el-input class="planNameIpt canedit" v-model="detailform.name" placeholder="请输入计划名称" v-bind:readonly="readonly"></el-input>
              </el-form-item>
              <el-form-item label="开始时间" prop="date1" style="margin-bottom: 16px">
                <div class="selectData" @click="getPlanSTime">{{detailform.date1}}</div>
                <!--<el-input class="planNameIpt canedit" v-model="detailform.date1" placeholder="请输入开始时间" v-bind:readonly="readonly" @focus="getPlanSTime"></el-input>-->
              </el-form-item>
              <el-form-item prop="date2" label="结束时间">
                <div class="selectData" @click="getPlanSTime">{{detailform.date2}}</div>
                <!--<el-input class="planNameIpt canedit" v-model="detailform.date2" placeholder="请输入结束时间" v-bind:readonly="readonly" @focus="getPlanETime"></el-input>-->
              </el-form-item>
              <el-form-item label="计划描述" maxlength="100" width="100">
                <el-input style="font-size: 12px;" class="planNameIpt canedit" :readonly="readonly" type="textarea" :rows="3" v-model="detailform.description"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button size="small" @click="detailformClose()">关闭</el-button>
                <el-button size="small" v-if="modifyBtnShow" @click="detailformModify()">{{editBtnText}}</el-button>
              </el-form-item>
            </el-form>
          </div>
          <!---->
        </div>
      </div>
    </div>
    <!--修改任务-->
    <div class="bgCover" v-if="modifyTaskVisible">
      <div class="bgCoverCnt2">
        <h2>修改任务</h2>
        <div class="bgCoverClose" @click="modifyTaskVisible = false"><i class="el-icon-close"></i></div>
        <div class="bgCoverTabs">
          <!--修改任务form-->
          <div class="planTaskBox">
            <el-form ref="modifyTask" :model="detailTaskform" :rules="editTaskRules" label-width="80px">
              <el-form-item label="任务名称" prop="jobName" maxlength="100" width="100">
                <el-input class="planNameIpt" v-model="detailTaskform.jobName"></el-input>
              </el-form-item>
              <el-form-item label="任务级别" prop="jobLevel" maxlength="100" width="100">
                <div class="ratestar" style="padding-top: 6px;">
                  <el-rate v-model="detailTaskform.jobLevel" v-on:change="levelChange($event)"></el-rate>
                </div>
              </el-form-item>
              <el-form-item label="开始时间" prop="taskStartDate">
                <div class="selectData" @click="getDetainStartTime">{{detailTaskform.taskStartDate}}</div>
                <!--<el-input class="planNameIpt canedit" v-model="detailTaskform.taskStartDate" placeholder="请输入开始时间" v-bind:readonly="readonly" @focus="getDetainStartTime"></el-input>-->
              </el-form-item>
              <el-form-item label="结束时间" prop="taskFinishDate">
                <div class="selectData" @click="getDetainEndTime">{{detailTaskform.taskFinishDate}}</div>
                <!--<el-input class="planNameIpt canedit" v-model="detailTaskform.taskFinishDate" placeholder="请输入结束时间" v-bind:readonly="readonly" @focus="getDetainEndTime"></el-input>-->
              </el-form-item>
              <el-form-item label="任务描述" maxlength="100" width="100">
                <el-input class="planNameIpt" type="textarea" :rows="2" v-model="detailTaskform.description"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="modifyTaskSub('modifyTask')">保存</el-button>
                <el-button @click="modifyTaskVisible = false">关 闭</el-button>
              </el-form-item>
            </el-form>
          </div>
          <!---->
        </div>
      </div>
    </div>
    <!---->
    <div class="bgCoverSelect" v-if="bgCoverSelectShow">
      <div class="selectCnt">
        <div class="selectTit">请选择操作的类型</div>
        <div class="selectItemBox">
          <div class="selectItem" v-if="currentTargetObj.proType==='0'?false:true" v-on:click="selectChakan()">查看</div>
          <div class="selectItem" v-on:click="selectAdd(currentTargetObj)">添加任务/计划</div>
          <div class="selectItem" v-if="currentTargetObj.proType==='0'?false:true" v-on:click="selectdel()">删除</div>
          <div class="selectItem"><div v-if="currentTargetObj.proType==='0'?false:true" v-on:click="selectModify()">修改</div></div>
        </div>
        <div class="closeSelect" v-on:click="closeSelect()">&#10005;</div>
      </div>
    </div>
  </div>
</template>

<script>
import proDetailPlanTreeComp from './proDetailPlanTreeComp.vue'
export default {
  name: 'proDetailPlanManage',
  props: ['proID'],
  components: {
    proDetailPlanTreeComp
  },
  data () {
    return {
      hhh: false,
      msg: '',
      editBtnText: '保存',
      // 根据权限 控制修改按钮是否显示
      modifyBtnShow: false,
      // 根据修改按钮状态（修改、保存）设置按钮功能（显示变换或是提交）是否是提交按钮
      modifyBtnSub: true,
      // 是否只读
      readonly: true,
      token: '',
      treeData: '',
      user: '',
      options4: [],
      defaultTime: '',
      bgCoverShow: false,
      loading: false,
      loading2: false,
      isDisabled: false,
      screenHt: this.$store.state.screenHeight,
      bgCoverHt: 0,
      activeNameBgCover: 'first',
      panshow: false,
      bgCoverSelectShow: false,
      currentTargetObj: {},
      pickerOptions0: {
        canSee: 'CanSee',
        canEdit: 'CanEdit'
      },
      endDate: '',
      resultEShow: '',
      childStartDate: '',
      childStartTime: '',
      childStartDateShow: '',
      currentBanTime: '',
      endDate2: '',
      resultEShow2: '',
      childStartDate2: '',
      childStartTime2: '',
      childStartDateShow2: '',
      formId: '',
      upLoadName: '',
      disabledStarTime: '',
      disabledEndTime: '',
      currentClickId: '',
      nodeType: '',
      detailformVisible: false,
      modifyTaskVisible: false,
      permissions: {},
      beishu: 0,
      autoCompleteAddTaskPayload: {
        projectManager: '',
        userId: this.$store.state.userId
      },
      queryManagePlanPayload: {
        userId: this.$store.state.userId,
        projectUID: ''
      },
      delPlanOrTaskPayload: {
        id: ''
      },
      editTaskPayload: {
        id: '1',
        jobName: '',
        jobLevel: 1,
        taskStartDate: '',
        taskFinishDate: '',
        description: '',
        _jfinal_token: ''
      },
      editPlanPayload: {
        id: '1',
        name: '',
        start: '',
        finish: '',
        description: '',
        _jfinal_token: ''
      },
      detailTaskform: {
        id: '',
        jobName: '',
        jobLevel: 2,
        taskStartDate: '2018-10-10 00:00:00',
        taskFinishDate: '2018-10-10 00:00:00',
        description: ''
      },
      detailform: {
        name: '',
        dataList: [],
        date1: '',
        date2: '',
        description: ''
      },
      editTaskRules: {
        name: [
          { required: true, message: '请输入项目名称', trigger: 'blur' }
        ],
        date1: [
          { type: 'string', required: true, message: '请选择开始日期', trigger: 'change' }
        ],
        date2: [
          { type: 'string', required: true, message: '请选择结束日期', trigger: 'change' }
        ],
        jobName: [
          { required: true, message: '请输入项目名称', trigger: 'blur' }
        ],
        jobLevel: [
          { required: true, message: '请选择任务等级', trigger: 'change' }
        ],
        taskStartDate: [
          { type: 'string', required: true, message: '请选择开始日期', trigger: 'change' }
        ],
        taskFinishDate: [
          { type: 'string', required: true, message: '请选择结束日期', trigger: 'change' }
        ]
      }
    }
  },
  created: function () {
    // var that = this
    this.log('height', this.screenHt)
    // console.log('TreeTest5-created')
    // var pid = that.$route.params.pid || that.proID
    // this.$store.commit('setRouterName', {name: '项目计划管理', parentName: 'proDetails', url: '/proDetails/' + pid})
    this.queryManagePlan5()
    this.settoken()
  },
  updated: function () {
    this.getPos()
  },
  mounted: function () {
    // this.getPos()
  },
  methods: {
    settoken: function () {
      this.ajax('/app/setToken', {}).then(res => {
        this.token = res._jfinal_token
      })
    },
    setScreenHeight () {
      if (this.screenHt > 620) {
        this.hhh = false
      } else {
        this.hhh = true
        this.bgCoverHt = this.screenHt
      }
    },
    // 获取任务详情
    modifyTaskShowDetail: function (e) {
      var that = this
      this.bgCoverSelectShow = false
      this.modifyTaskVisible = true
      this.ajax('/app/getTaskDetail', {uid: e}).then(res => {
        this.log('getTaskDetail:', res)
        if (res.code === 200) {
          that.detailTaskform.jobName = res.data.jobName
          that.detailTaskform.jobLevel = parseInt(res.data.jobLevel)
          // that.detailTaskform.taskStartDate = res.data.taskStartDate
          that.detailTaskform.taskFinishDate = res.data.taskFinishDate
          that.detailTaskform.description = res.data.description
          // that.form.date2 = res.data.endDate
          // that.taskForm.date2 = res.data.endDate
          // 今天时间戳
          var nowTime = new Date().getTime()
          // 今天
          var dataNow = new Date()
          var yearnow = dataNow.getFullYear()
          var monthnow = (dataNow.getMonth() + 1) < 10 ? '0' + (dataNow.getMonth() + 1) : (dataNow.getMonth() + 1)
          var daynow = dataNow.getDate() < 10 ? '0' + dataNow.getDate() : dataNow.getDate()
          var Minutenow = dataNow.getMinutes() < 10 ? '0' + dataNow.getMinutes() : dataNow.getMinutes()
          var hoursnow = dataNow.getHours() < 10 ? '0' + dataNow.getHours() : dataNow.getHours()
          var n = Math.ceil(Minutenow / 10)
          var MinutenowF = n * 10
          // 开始时间戳
          var parentStar = new Date(res.data.taskStartDate.replace(/-/g, '/')).getTime()
          // 结束时间
          var parentEnd = new Date(res.data.taskFinishDate.replace(/-/g, '/'))
          var yearE = parentEnd.getFullYear()
          var monthE = (parentEnd.getMonth() + 1) < 10 ? '0' + (parentEnd.getMonth() + 1) : (parentEnd.getMonth() + 1)
          var dayE = parentEnd.getDate() < 10 ? '0' + parentEnd.getDate() : parentEnd.getDate()
          var MinuteE = parentEnd.getMinutes() < 10 ? '0' + parentEnd.getMinutes() : parentEnd.getMinutes()
          var hoursE = parentEnd.getHours() < 10 ? '0' + parentEnd.getHours() : parentEnd.getHours()
          var resultE = yearE + '-' + monthE + '-' + dayE
          that.endDate = resultE
          var resultEShow = yearE + '-' + monthE + '-' + dayE + ' ' + hoursE + ':' + MinuteE
          that.resultEShow = resultEShow
          console.log(nowTime, parentStar)
          if (nowTime > parentStar) {
            that.childStartTime = nowTime
            if (MinutenowF === 60) {
              MinutenowF = '00'
              hoursnow = hoursnow + 1
            }
            that.detailTaskform.taskStartDate = yearnow + '-' + monthnow + '-' + daynow + ' ' + hoursnow + ':' + MinutenowF + ':00'
            that.detailTaskform.taskStartDate = yearnow + '-' + monthnow + '-' + daynow + ' ' + hoursnow + ':' + MinutenowF + ':00'
          } else {
            that.childStartTime = parentStar
            that.detailTaskform.taskStartDate = res.data.taskStartDate
            that.detailTaskform.taskStartDate = res.data.taskStartDate
          }
          // 禁用最小时间
          var nowEndData = new Date(that.childStartTime)
          var yearEnd = nowEndData.getFullYear()
          var monthEnd = (nowEndData.getMonth() + 1) < 10 ? '0' + (nowEndData.getMonth() + 1) : (nowEndData.getMonth() + 1)
          var dayEnd = nowEndData.getDate() < 10 ? '0' + nowEndData.getDate() : nowEndData.getDate()
          var MinuteSt = nowEndData.getMinutes() < 10 ? '0' + nowEndData.getMinutes() : nowEndData.getMinutes()
          var hoursSt = nowEndData.getHours() < 10 ? '0' + nowEndData.getHours() : nowEndData.getHours()
          var resultEnd = yearEnd + '-' + monthEnd + '-' + dayEnd
          var minMum = Math.ceil(MinuteSt / 10)
          var MinuteStF = minMum * 10
          if (MinuteStF === 60) {
            MinuteStF = '00'
            hoursSt = hoursSt + 1
          }
          var resultEndShow = yearEnd + '-' + monthEnd + '-' + dayEnd + ' ' + hoursSt + ':' + MinuteStF
          that.childStartDateShow = resultEndShow
          that.childStartDate = resultEnd
        }
      })
    },
    getDetainStartTime: function () {
      var that = this
      console.log(that.childStartDate, that.endDate)
      that.$vux.datetime.show({
        cancelText: '取消',
        confirmText: '确定',
        value: that.detailTaskform.taskStartDate,
        format: 'YYYY-MM-DD HH:mm',
        minuteList: ['00', '10', '20', '30', '40', '50'],
        startDate: that.childStartDate,
        endDate: that.endDate,
        onConfirm (val) {
          var currentTime = new Date().getTime()
          var maxTime = new Date(that.endDate.replace(/-/g, '/')).getTime()
          var sectTime = new Date(val.replace(/-/g, '/')).getTime()
          if (sectTime > maxTime) {
            that.$message.warning('选择时间应小于结束时间')
            that.detailTaskform.taskStartDate = that.childStartDateShow + ':00'
          } else if (sectTime < currentTime) {
            that.$message.warning('选择时间应大于当前时间')
            that.detailTaskform.taskStartDate = that.childStartDateShow + ':00'
          } else {
            that.detailTaskform.taskStartDate = val + ':00'
          }
        }
      })
    },
    getDetainEndTime: function () {
      var that = this
      console.log(that.childStartDate)
      that.$vux.datetime.show({
        cancelText: '取消',
        confirmText: '确定',
        value: that.detailTaskform.taskFinishDate,
        format: 'YYYY-MM-DD HH:mm',
        minuteList: ['00', '10', '20', '30', '40', '50'],
        startDate: that.childStartDate,
        endDate: that.endDate,
        onConfirm (val) {
          var currentTime = new Date().getTime()
          var maxTime = new Date(that.endDate.replace(/-/g, '/')).getTime()
          var sectTime = new Date(val.replace(/-/g, '/')).getTime()
          var startTine = new Date(that.detailTaskform.taskStartDate.replace(/-/g, '/')).getTime()
          if (sectTime > maxTime) {
            that.$message.warning('选择时间应小于上级结束时间')
            that.detailTaskform.taskFinishDate = that.resultEShow + ':00'
          } else if (sectTime < startTine) {
            that.$message.warning('选择时间应大于开始时间')
            that.detailTaskform.taskFinishDate = that.resultEShow + ':00'
          } else if (sectTime < currentTime) {
            that.$message.warning('选择时间应大于当前时间')
            that.detailTaskform.taskFinishDate = that.resultEShow + ':00'
          } else {
            that.detailTaskform.taskFinishDate = val + ':00'
          }
        }
      })
    },
    // 修改任务
    modifyTaskSub: function (formName) {
      var that = this
      this.$refs[formName].validate((valid) => {
        if (valid) {
          that.loading = true
          that.editTaskPayload.id = that.currentClickId
          that.editTaskPayload.jobLevel = this.detailTaskform.jobLevel
          that.editTaskPayload.jobName = this.detailTaskform.jobName
          that.editTaskPayload.taskStartDate = this.detailTaskform.taskStartDate
          that.editTaskPayload.taskFinishDate = this.detailTaskform.taskFinishDate
          that.editTaskPayload.description = this.detailTaskform.description
          that.editTaskPayload._jfinal_token = this.token
          that.ajax('/app/editTask', that.editTaskPayload).then(res => {
            that.log('editTask:', res)
            if (res.code === 200) {
              that.$message.success('保存成功！')
              that.modifyTaskVisible = false
              that.token = res._jfinal_token
              that.loading = false
              that.queryManagePlan5()
            } else {
              that.loading = false
            }
          })
        }
      })
    },
    levelChange: function (rateval) {
      this.detailTaskform.jobLevel = rateval
    },
    testDiv () {
      var routerNameArr = this.$store.state.routerNameArr
      var routerNameArr0 = this.$store.state.routerNameArr[0].name
      var routerName = this.$store.state.routerName
      console.log('routerName:', routerName)
      console.log('routerNameArr[0].name:', routerNameArr0)
      console.log('routerNameArr:', routerNameArr)
    },
    sortNumber: function (a, b) {
      return b - a
    },
    getPos: function () {
      var that = this
      var x = $('.item-line')
      var c = $('.compBox')
      var itemLeftArr = []
      for (var i = 0; i < x.length; i++) {
        if (x[i].offsetLeft) {
          itemLeftArr.push(x[i].offsetLeft)
        }
      }
      var itemSort = itemLeftArr.sort(that.sortNumber)
      var chazhi = 0
      if (c[0] && c[0].offsetLeft) {
        chazhi = ((itemSort[0] - c[0].offsetLeft) / 50) - 4
      }
      if (chazhi > 0) {
        that.beishu = parseInt(chazhi)
        that.$emit('beishuEmit', that.beishu)
        this.log('beishu: ', that.$store.state.beishu)
      }
    },
    handleClickPlanTask: function (tab) {
    },
    rateChange: function (rateval) {
      this.addTaskPayload.jobLevel = rateval
    },
    forFuc: function (obj) {
      var that = this
      if (obj && obj.member && obj.member.length > 0) {
        obj.children = obj.children.concat(obj.member)
      }
      var planIcon = parseInt(obj.projectType) < 2 ? 'plan-icon' : 'task-icon'
      obj.planIcon = planIcon
      if (obj.projectType === '0') {
        // j
      } else if (obj.projectType === '1') {
        // j
      } else if (obj.projectType === '2') {
        // taskLevelBg = 'taskLevelVal01'
        var taskLevelBg = ''
        var statusValColor = ''
        if (parseInt(obj.jobLevel) <= 2) {
          taskLevelBg = 'taskLevelVal01'
        } else if (parseInt(obj.jobLevel) >= 5) {
          taskLevelBg = 'taskLevelVal03'
        } else {
          taskLevelBg = 'taskLevelVal02'
        }
        // 任务状态 字体颜色
        if (parseInt(obj.statusCode) === 0) {
          statusValColor = 'taskStatus01'
        } else if (parseInt(obj.statusCode) === 1) {
          statusValColor = 'taskStatus02'
        } else {
          statusValColor = 'taskStatus03'
        }
        // if () {}
        obj.taskLevelBg = taskLevelBg
        obj.statusValColor = statusValColor
      }
      for (var i = 0; i < obj.children.length; i++) {
        if (obj.children[i] !== null) {
          that.forFuc(obj.children[i])
        } else {
          obj.children = []
        }
      }
      return obj
    },
    // 计划管理 新的树形结构
    queryManagePlan5: function () {
      var that = this
      that.queryManagePlanPayload.projectUID = that.$route.params.pid || that.proID
      this.ajax('/app/managePlan', that.queryManagePlanPayload).then(res => {
        // console.log('managePlan:', res)
        if (res.code === 200) {
          res.msg[0].isProName = true
          that.token = res._jfinal_token
          if (res.authority === 0) {
            that.permissions.canSee = 'notCanSee'
            that.permissions.canEdit = 'notCanEdit'
          } else if (res.authority === 1) {
            that.permissions.canSee = 'CanSee'
            that.permissions.canEdit = 'notCanEdit'
          } else if (res.authority === 2) {
            that.permissions.canSee = 'CanSee'
            that.permissions.canEdit = 'CanEdit'
          }
          that.treeData = that.forFuc(res.msg[0])
        } else {
          this.log('managePlan:', res.msg)
        }
      })
    },
    showDetail (e) {
      var that = this
      this.detailformVisible = true
      this.ajax('/app/getPlanDetail', {id: e}).then(res => {
        console.log('getPlanDetail:', res)
        if (res.code === 200) {
          that.detailform.name = res.msg.name
          // that.detailform.date1 = res.msg.start
          that.detailform.date2 = res.msg.finish
          that.detailform.description = res.msg.description
          // 今天时间戳
          var nowTime = new Date().getTime()
          // 今天
          var dataNow = new Date()
          var yearnow = dataNow.getFullYear()
          var monthnow = (dataNow.getMonth() + 1) < 10 ? '0' + (dataNow.getMonth() + 1) : (dataNow.getMonth() + 1)
          var daynow = dataNow.getDate() < 10 ? '0' + dataNow.getDate() : dataNow.getDate()
          var Minutenow = dataNow.getMinutes() < 10 ? '0' + dataNow.getMinutes() : dataNow.getMinutes()
          var hoursnow = dataNow.getHours() < 10 ? '0' + dataNow.getHours() : dataNow.getHours()
          var n = Math.ceil(Minutenow / 10)
          var MinutenowF = n * 10
          // 开始时间戳
          var parentStar = new Date(res.msg.start.replace(/-/g, '/')).getTime()
          // 结束时间
          var parentEnd = new Date(res.msg.finish.replace(/-/g, '/'))
          var yearE = parentEnd.getFullYear()
          var monthE = (parentEnd.getMonth() + 1) < 10 ? '0' + (parentEnd.getMonth() + 1) : (parentEnd.getMonth() + 1)
          var dayE = parentEnd.getDate() < 10 ? '0' + parentEnd.getDate() : parentEnd.getDate()
          var MinuteE = parentEnd.getMinutes() < 10 ? '0' + parentEnd.getMinutes() : parentEnd.getMinutes()
          var hoursE = parentEnd.getHours() < 10 ? '0' + parentEnd.getHours() : parentEnd.getHours()
          var resultE = yearE + '-' + monthE + '-' + dayE
          that.endDate2 = resultE
          var resultEShow = yearE + '-' + monthE + '-' + dayE + ' ' + hoursE + ':' + MinuteE
          that.resultEShow2 = resultEShow
          console.log(nowTime, parentStar)
          if (nowTime > parentStar) {
            that.childStartTime2 = nowTime
            if (MinutenowF === 60) {
              MinutenowF = '00'
              hoursnow = hoursnow + 1
            }
            that.detailform.date1 = yearnow + '-' + monthnow + '-' + daynow + ' ' + hoursnow + ':' + MinutenowF + ':00'
            that.detailform.date1 = yearnow + '-' + monthnow + '-' + daynow + ' ' + hoursnow + ':' + MinutenowF + ':00'
            that.currentBanTime = yearnow + '-' + monthnow + '-' + daynow + ' ' + hoursnow + ':' + MinutenowF + ':00'
          } else {
            that.childStartTime2 = parentStar
            that.detailform.date1 = res.msg.start
            that.detailform.date1 = res.msg.start
          }
          // 禁用最小时间
          var nowEndData = new Date(that.childStartTime2)
          var yearEnd = nowEndData.getFullYear()
          var monthEnd = (nowEndData.getMonth() + 1) < 10 ? '0' + (nowEndData.getMonth() + 1) : (nowEndData.getMonth() + 1)
          var dayEnd = nowEndData.getDate() < 10 ? '0' + nowEndData.getDate() : nowEndData.getDate()
          var MinuteSt = nowEndData.getMinutes() < 10 ? '0' + nowEndData.getMinutes() : nowEndData.getMinutes()
          var hoursSt = nowEndData.getHours() < 10 ? '0' + nowEndData.getHours() : nowEndData.getHours()
          var resultEnd = yearEnd + '-' + monthEnd + '-' + dayEnd
          var minMum = Math.ceil(MinuteSt / 10)
          var MinuteStF = minMum * 10
          if (MinuteStF === 60) {
            MinuteStF = '00'
            hoursSt = hoursSt + 1
          }
          var resultEndShow = yearEnd + '-' + monthEnd + '-' + dayEnd + ' ' + hoursSt + ':' + MinuteStF
          that.childStartDateShow2 = resultEndShow
          that.childStartDate2 = resultEnd
        }
      })
    },
    getPlanSTime: function () {
      var that = this
      console.log(that.detailform.date1)
      that.$vux.datetime.show({
        cancelText: '取消',
        confirmText: '确定',
        value: that.detailform.date1,
        format: 'YYYY-MM-DD HH:mm',
        minuteList: ['00', '10', '20', '30', '40', '50'],
        startDate: that.childStartDate2,
        endDate: that.endDate2,
        onConfirm (val) {
          var currentTime = new Date().getTime()
          var maxTime = new Date(that.endDate2.replace(/-/g, '/')).getTime()
          var sectTime = new Date(val.replace(/-/g, '/')).getTime()
          if (sectTime > maxTime) {
            that.$message.warning('选择时间应小于结束时间')
            that.detailform.date1 = that.childStartDateShow2 + ':00'
          } else if (sectTime < currentTime) {
            that.$message.warning('选择时间应大于当前时间')
            that.detailform.date1 = that.childStartDateShow2 + ':00'
          } else {
            that.detailform.date1 = val + ':00'
          }
        }
      })
    },
    getPlanETime: function () {
      var that = this
      that.$vux.datetime.show({
        cancelText: '取消',
        confirmText: '确定',
        value: that.detailform.date2,
        format: 'YYYY-MM-DD HH:mm',
        minuteList: ['00', '10', '20', '30', '40', '50'],
        startDate: that.childStartDate2,
        endDate: that.endDate2,
        onConfirm (val) {
          var currentTime = new Date().getTime()
          var maxTime = new Date(that.endDate2.replace(/-/g, '/')).getTime()
          var sectTime = new Date(val.replace(/-/g, '/')).getTime()
          var startTine = new Date(that.detailform.date1.replace(/-/g, '/')).getTime()
          if (sectTime > maxTime) {
            that.$message.warning('选择时间应小于上级结束时间')
            that.detailform.date2 = that.resultEShow2 + ':00'
          } else if (sectTime < startTine) {
            that.$message.warning('选择时间应大于开始时间')
            that.detailform.date2 = that.resultEShow2 + ':00'
          } else if (sectTime < currentTime) {
            that.$message.warning('选择时间应大于当前时间')
            that.detailform.date2 = that.resultEShow2 + ':00'
          } else {
            that.detailform.date2 = val + ':00'
          }
        }
      })
    },
    delClick: function (obj) {
      // console.log('TreeTest5:delClick:', obj)
      var that = this
      if (that.permissions.canEdit === 'CanEdit') {
        if (obj.proType === '0') {
          // console.log('项目根节点不可删除！')
        } else {
          that.$confirm('删除本条会包括本条及其包含内容，确定删除？', '', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            // 新的计划树 删除计划或者任务
            that.delPlanOrTaskPayload.id = obj.nodeid
            // console.log('delPlanOrTaskPayload.id:', that.delPlanOrTaskPayload.id)
            this.ajax('/general/delPlanOrTask', that.delPlanOrTaskPayload).then(res => {
              // console.log('delPlanOrTask:', res)
              if (res.code === 200) {
                that.queryManagePlan5()
              }
            })
          }).catch(() => {
            // that.loading = false
          })
        }
      } else {
        this.$message('不具备相关操作权限')
      }
    },
    chakanEmitFuc: function (obj) {
      // console.log('eeeeee:', obj)
      var that = this
      if (that.permissions.canSee === 'CanSee') {
        var nodeid = obj.nodeid
        var proType = obj.proType
        if (parseInt(proType) === 1) {
          that.detailformVisible = true
          that.showDetail(nodeid)
        } else if (parseInt(proType) === 2) {
          that.$router.push('/taskDetailPage/' + nodeid)
        }
      } else {
        this.$message('不具备相关操作权限')
      }
    },
    selectdel: function () {
      var that = this
      if (that.permissions.canEdit === 'CanEdit') {
        if (that.currentTargetObj.proType === '0') {
          // console.log('项目根节点不可删除！')
        } else {
          that.$confirm('删除本条会包括本条及其包含内容，确定删除？', '', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            // 新的计划树 删除计划或者任务
            that.delPlanOrTaskPayload.id = that.currentTargetObj.nodeid
            this.ajax('/app/delPlanOrTask', that.delPlanOrTaskPayload).then(res => {
              // console.log('delPlanOrTask:', res)
              this.bgCoverSelectShow = false
              if (res.code === 200) {
                that.queryManagePlan5()
                // this.bgCoverSelectShow = false
              }
            })
          }).catch(() => {
            // that.loading = false
          })
        }
      } else {
        this.$message('不具备相关操作权限')
      }
    },
    selectAdd: function (msg) {
      var that = this
      if (that.permissions.canEdit === 'CanEdit') {
        var pnid = that.$route.params.pid
        that.$router.push({name: 'addNewPlanOrTask', params: {nodeId: msg.nodeid, proType: msg.proType, pnid: pnid}})
      } else {
        this.$message('不具备相关操作权限')
      }
    },
    selectChakan: function () {
      var that = this
      if (that.permissions.canSee === 'CanSee') {
        var nodeid = that.currentTargetObj.nodeid
        var proType = that.currentTargetObj.proType
        if (parseInt(proType) === 1) {
          that.detailformVisible = true
          that.bgCoverSelectShow = false
          that.showDetail(nodeid)
        } else if (parseInt(proType) === 2) {
          that.bgCoverSelectShow = false
          that.$router.push('/taskDetailPage/' + nodeid)
        }
      } else {
        this.$message('不具备相关操作权限')
      }
    },
    // 选择修改
    selectModify: function () {
      var that = this
      if (that.permissions.canSee === 'CanSee') {
        if (parseInt(that.currentTargetObj.proType) === 1) {
          that.bgCoverSelectShow = false
          // that.detailformVisible = true
          that.modifyBtnShow = true
          that.readonly = false
          that.showDetail(that.currentTargetObj.nodeid)
        } else if (parseInt(that.currentTargetObj.proType) === 2) {
          this.modifyTaskShowDetail(that.currentTargetObj.nodeid)
        }
      } else {
        this.$message('不具备相关操作权限')
      }
    },
    // 初始化 变量 状态
    setIniData: function () {
      var that = this
      // 计划详情 input只读
      that.readonly = true
      // 计划详情表单
      that.detailformVisible = false
      // 计划详情 底部修改提交按钮
      that.modifyBtnShow = false
      // 操作选项 （查看 添加 删除 修改）
      that.bgCoverSelectShow = false
    },
    // 关闭 选择操作项
    closeSelect: function () {
      var that = this
      that.setIniData()
    },
    // 关闭 计划详情 关闭按钮
    detailformClose: function () {
      this.setIniData()
    },
    selectEmitFuc: function (obj) {
      this.log('obj:', obj)
      var that = this
      that.bgCoverSelectShow = true
      that.currentTargetObj = obj
      var nodeid = obj.nodeid
      var proType = obj.proType
      this.currentClickId = nodeid
      this.nodeType = proType
      // this.$emit('selectEmit', obj)
    },
    addEmitFuc: function (obj) {
      var that = this
      if (that.permissions.canEdit === 'CanEdit') {
        var nodeid = obj.nodeid
        var proType = obj.proType
        this.currentClickId = nodeid
        this.nodeType = proType
        if (proType === '2') {
          that.panshow = true
          that.activeNameBgCover = 'second'
        } else {
          that.panshow = false
          that.activeNameBgCover = 'first'
        }
        that.addPlanPayload.id = that.currentClickId
        that.addTaskPayload.id = that.currentClickId
        that.addPlanPayload.projectUID = that.$route.params.pid || that.proID
        that.addTaskPayload.projectUID = that.$route.params.pid || that.proID
        that.bgCoverShow = true
        this.ajax('/app/getParentTime', {parentId: nodeid, type: proType}).then(res => {
          // console.log('getParentTime:', res)
          if (res.code === 200) {
            var st = ''
            if (res.data.startDate) {
              st = res.data.startDate.split(' ')[0] + ' 00:00:00'
            }
            var et = res.data.endDate
            var sT = new Date(st.replace(/-/g, '/'))
            var eT = new Date(et.replace(/-/g, '/'))
            that.defaultTime = sT
            that.disabledStarTime = sT.getTime()
            that.disabledEndTime = eT.getTime()
            this.pickerOptions0.disabledDate = function (time) {
              return time.getTime() < that.disabledStarTime || time.getTime() > that.disabledEndTime
            }
          }
        })
      } else {
        this.$message('不具备相关操作权限')
      }
    },
    // 修改计划 提交
    detailformModify: function () {
      this.modifySub('detailform')
    },
    // 修改点击了保存
    modifySub: function (formName) {
      // this.alert('计划点击了保存')
      var that = this
      this.$refs[formName].validate((valid) => {
        if (valid) {
          that.loading = true
          that.editPlanPayload.id = that.currentClickId
          that.editPlanPayload.name = this.detailform.name
          that.editPlanPayload.start = this.detailform.date1
          that.editPlanPayload.finish = this.detailform.date2
          that.editPlanPayload.description = this.detailform.description
          that.editPlanPayload._jfinal_token = this.token
          that.ajax('/app/editPlan', that.editPlanPayload).then(res => {
            that.log('editPlan:', res)
            if (res.code === 200) {
              that.$message({
                message: '修改成功',
                type: 'success'
              })
              that.detailformVisible = false
              that.token = res._jfinal_token
              that.queryManagePlan5()
              // that.modifyTaskShowDetail()
              that.modifyBtnShow = false
              that.loading = false
            } else {
              that.loading = false
            }
          })
        }
      })
    }
  }
}
</script>

<style scoped>
  .compBox{
    background-color: #fff;
    padding: 15px 10px;
    box-sizing: border-box;
    border-bottom: 1px solid #e6e6e6;
  }
  .treeWrap>.compBox>.child-item{
    margin-left:0
  }
  /* 以下是bgcover */
  .bgCover{
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    position: fixed;
    left: 0;
    top: 0;
    z-index: 100;
  }
  .bgCoverCnt{
    width: 90%;
    background-color: #fff;
    position: relative;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    padding: 15px;
    margin-top: 15px;
    overflow: scroll;
    padding-bottom: 30px;
    box-sizing: border-box;
  }
  .bgCoverCnt1{
    width: 90%;
    _height: 300px;
    background-color: #fff;
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -45%;
    margin-top: -250px;
    padding: 20px;
    box-sizing: border-box;
  }
  .bgCoverCnt1 h2{
    font-size: 16px;
    color: #666;
    font-family: '黑体';
  }
  .colose {
    margin: 0px;
    font-size: 20px;
    color: #409EFF;
    height: 20px;
    width: 20px;
    text-align: center;
    cursor: pointer;
  }
  .bgCoverCnt .colose{
    position: absolute;
    right: 15px;
    z-index: 300;
  }
  .bgCoverCnt1 .colose{
    position: absolute;
    top: 20px;
    right: 15px;
    z-index: 300;
  }
  .planTaskBox{
    padding-top: 30px;
  }
  .el-form-item--mini.el-form-item, .el-form-item--small.el-form-item{
    margin-bottom: 16px;
  }
  .el-form-item{
    margin-bottom: 20px;
  }
  .el-date-editor.el-input, .el-date-editor.el-input__inner{
    width: 100%;
  }
  .el-col-6{
    width: 300px;
  }
  .el-autocomplete{
    width: 300px;
  }
  /* 以上是bgcover*/
  /* bgcoverSelect  操作选项*/
  .bgCoverSelect{
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    position: fixed;
    left: 0;
    top: 0;
    z-index: 100;
  }
  .selectCnt{
    width: 70%;
    margin: 0 auto;
    margin-top: 50%;
    padding: 10px 15px;
    padding-bottom: 17px;
    position: relative;
    box-sizing: border-box;
    background-color: #fff;
  }
  .selectTit{
    padding: 15px 0;
    text-align: center;
  }
  .selectItemBox{
    color: #3a8ee6;
    font-family: "黑体";
    font-size: 14px;
    padding: 15px;
  }
  .selectItem{
    text-align: center;
    border-top: 1px solid #e6e6e6;
    padding: 12px 15px;
  }
  /*.selectItem:nth-child(4){*/
    /*border-bottom: 1px solid #e6e6e6;*/
  /*}*/
  .closeSelect{
    position: absolute;
    right: 10px;
    top: 10px;
    width: 20px;
    color: #3a8ee6;
    height: 20px;
    text-align: center;
  }
  /**/
  .bgCoverCnt2{
    width: 90%;
    background-color: #fff;
    position: absolute;
    left: 5%;
    top: 50%;
    box-sizing: border-box;
    margin-top: -250px;
    padding: 20px;
  }
  .bgCoverCnt2 h2{
    font-size: 16px;
    color: #666;
    font-family: '黑体';
  }
  .bgCoverClose{
    margin: 0px;
    font-size: 20px;
    color: #409EFF;
    height: 20px;
    width: 20px;
    text-align: center;
    cursor: pointer;
    position: absolute;
    top: 10px;
    right: 10px;
  }
</style>
