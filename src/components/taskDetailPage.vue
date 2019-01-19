<template>
<div style="position: relative">
  <div>{{getStoreUserId?'':''}}</div>
  <!--完成-->
  <div class="modelFinished" v-if="isShowFinished">
    <form id="uploadFileFinish" enctype="multipart/form-data">
      <div class="modelFinishedCon" v-loading="loading">
        <div>
          <label><span style="color: red">*</span> 完成备注：</label>
        </div>
        <div>
          <textarea name="remark" id="myremark">已完成</textarea>
        </div>
        <div style="margin-top: 10px;"><label>上传附件：</label></div>
        <div>
          <input type="file" id="myfileFinish" name="myfile" value="">
          <input type="hidden" name="taskId" v-bind:value="taskId">
          <input type="hidden" name="userId" v-bind:value="userId">
        </div>
        <div style="text-align: center;margin-top: 16px;">
          <x-button mini action-type="button" @click.native="cancelUpload()">关闭</x-button>
          <x-button mini action-type="button" type="primary" @click.native="confirmUpload()">提交</x-button>
          <!--<a class="cancel" type="button" @click="cancelUpload()">关闭</a>-->
          <!--<a class="upload" type="button" @click="confirmUpload()">提交</a>-->
        </div>
      </div>
    </form>
  </div>
  <!--评论-->
  <div class="modelFinished" v-if="isShowComment">
    <form id="uploadFileComment" enctype="multipart/form-data">
      <div class="modelFinishedCon" v-loading="cloading">
        <div><label><span style="color: red">*</span> 评论：</label></div>
        <div><textarea name="content" id="myremarkComment" v-model="commentTextarea"></textarea></div>
        <div style="margin-top: 10px;"><label>上传附件：</label></div>
        <div>
          <input type="file" id="myfileComment" name="myfile" value="">
          <input type="hidden" name="rid" v-bind:value="taskId">
          <input type="hidden" name="rtype" v-bind:value="3">
          <input type="hidden" name="userId" v-bind:value="userId">
        </div>
        <div style="text-align: center;margin-top: 16px;">
          <x-button mini action-type="button" @click.native="cancelComment()">关闭</x-button>
          <x-button mini action-type="button" type="primary" @click.native="confirmComment()">提交</x-button>
          <!--<a class="cancel" type="button" @click="cancelComment()">关闭</a>-->
          <!--<a class="upload" type="button" @click="confirmComment()">提交</a>-->
        </div>
      </div>
    </form>
  </div>
  <!--移交-->
  <div class="modelFinished" v-if="isShowTurnOver">
      <div class="modelFinishedCon turnOver" v-loading="tloading">
        <div><label><span style="color: red">*</span> 任务移交人：</label></div>
        <div>
          <el-autocomplete style="width: 90%;margin: 10px 5%"
                           v-model="projectManager"
                           :fetch-suggestions="querySearchAsync"
                           placeholder="请输入移交人姓名"
                           :trigger-on-focus="false"
                           @select="handleSelect">
          </el-autocomplete>
        </div>
        <form id="uploadFileTurnOver" enctype="multipart/form-data">
          <div><label><span style="color: red">*</span> 移交备注：</label></div>
          <div><textarea name="remark" id="myremarkTurnOver"></textarea></div>
          <div style="margin-top: 10px;"><label>上传附件：</label></div>
          <div>
            <input type="file" id="myfileTurnOver" name="myfile" value="">
            <input type="hidden" name="taskId" v-bind:value="taskId">
            <input type="hidden" name="userId" v-bind:value="userId">
            <input type="hidden" name="transferUserId" v-bind:value="transferUserId">
            <input type="hidden" name="transferUserName" v-bind:value="transferUserName">
          </div>
          <div style="text-align: center;margin-top: 16px;">
            <x-button mini action-type="button" @click.native="cancelTurnOver()">关闭</x-button>
            <x-button mini action-type="button" type="primary" @click.native="confirmTurnOver()">移交</x-button>
            <!--<a class="cancel" type="button" @click="cancelTurnOver()">关闭</a>-->
            <!--<a class="upload" type="button" @click="confirmTurnOver()">移交</a>-->
          </div>
        </form>
      </div>
  </div>
  <div class="cont">
    <!--<div class="taskMsg">-->
      <!--<p>这是一个即将完成的项目，需要各个部门协调完成。需要各个部门协调完成,需要各个部门协调完成,需要各个部门协调完成</p>-->
    <!--</div>-->
    <!--<img style="position: absolute;top: 10px;right: 20px;width: 100px;" src="../../static/img/finish.png" alt="">-->
    <div class="taskList" style="background-color: #fff;position: relative;">
      <div v-if="taskDetailMsg.status && taskDetailMsg.status === '2'" style="position: absolute;top: 10px;right: 10px;width: 80px;">
        <img style="width: 100%;" src="../../static/img/finish.png" alt="">
      </div>
      <div v-if="taskDetailMsg.status && taskDetailMsg.status === '1'" style="position: absolute;top: 10px;right: 10px;width: 80px;">
        <img style="width: 100%;" src="../../static/img/doing.png" alt="">
      </div>
      <div v-if="taskDetailMsg.status && taskDetailMsg.status === '0'" style="position: absolute;top: 10px;right: 10px;width: 80px;">
        <img style="width: 100%;" src="../../static/img/unstart.png" alt="">
      </div>
      <div class="taskItem">
        <span class="label">任</span>
        <div class="taskCon"><span class="taskNameTitle">{{taskDetailMsg.jobName}}</span></div>
      </div>
      <div class="taskItem">
        <span class="label">附</span>
        <div class="taskCon">
          <div class="picPreSmall" style="width: 100px;" v-on:click="picPre(taskDetailMsg.previewUrl, taskDetailMsg.showName)" v-if="taskDetailMsg.imageOrNot===1?true:false">
            <img style="width: 100%" v-bind:src="taskDetailMsg.previewUrl" />
          </div>
          <span v-if="!taskDetailMsg.showName" style="color: #999">暂无附件</span>
          <span v-if="taskDetailMsg.showName">
            <a v-bind:href="taskDownUrl">{{taskDetailMsg.showName}} <i style="font-weight: bold !important; padding: 5px; color: chocolate;" class="el-icon-download"></i></a>
          </span>
        </div>
      </div>
      <div class="taskItem name" style="display: flex">
        <div style="display: flex; margin-right: 40px;">
          <div style="padding-top: 5px">
            <span class="label">创</span>
          </div>
          <div class="taskCon">
            <span class="peoName">{{taskDetailMsg.createrName}}</span>
          </div>
        </div>
        <!--<div style="display: inline-block;width: 40px"></div>-->
        <div style="display: flex">
          <div style="padding-top: 5px">
            <span class="label">责</span>
          </div>
          <div class="taskCon">
            <span class="peoName">{{taskDetailMsg.userName}}</span>
          </div>
        </div>
      </div>
      <div class="taskItem">
        <span class="label">始</span>
        <div class="taskCon"><span>{{taskDetailMsg.taskStartDate}} 开始</span></div>
      </div>
      <div class="taskItem" style="border-bottom: 1px solid #dfdfdf">
        <span class="label">止</span>
        <div class="taskCon"><span>{{taskDetailMsg.taskFinishDate}} 结束</span></div>
      </div>
    </div>
    <div class="taskMsg detail">
      <img src="../../static/img/detail.png" alt="">
      <p>{{taskDetailMsg.description}}</p>
    </div>
    <div class="history" style="border-top: 1px solid #dfdfdf">
      <div class="logBox">
        <div class="TimeLine" v-for="(history,index) in historyList" style="position: relative;" v-bind:key="history.index">
          <div class="quan">{{index+1}}</div>
          <div class="timeDate">{{history.oTime}}</div>
          <div class="timeCont">【{{history.oName}}】<span class="listColor">{{history.oContent}}</span>
            <div class="contBoxContentWrap">
              <div class="contBoxContent" v-if="history.comment">评论：{{history.comment}}</div>
              <div class="contBoxContent" v-if="history.uploads.length !== 0">
                <span class="filepre" v-on:click="picPre(history.uploads[0].previewUrl, history.uploads[0].showName)">附件:{{history.uploads[0].showName}}</span>
                <a v-bind:href="history.uploads[0].downLoadUrl"> 下载:<i style="font-weight: bold !important; padding: 5px; color: chocolate;" class="el-icon-download"></i></a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style="text-align: center; margin-top: 15px;" v-if="totalLog > 5">
        <el-button icon="el-icon-plus"  @click="addMoreHistory()" v-bind:disabled="notMore">加载更多</el-button>
      </div>
    </div>
  </div>
  <div class="footTab" v-if="firstTab">
    <el-button @click="startTask()" v-bind:type="canStart === true ? 'info' : 'primary'" v-bind:disabled="canStart" style="width: 25%;font-size: 15px;">开始</el-button>
    <el-button @click="turnOverTask()" v-bind:type="conTranslate === true ? 'info' : 'primary'" v-bind:disabled="conTranslate" style="width: 25%;font-size: 15px;">移交</el-button>
    <el-button @click="ConmentTask()" type="primary" style="width: 25%;font-size: 15px;">评论</el-button>
    <el-button @click="finishedTask()" v-bind:type="canFinished === true ? 'info' : 'primary'" v-bind:disabled="canFinished" v-if="!isAgainStart" style="width: 25%;font-size: 15px;">完成</el-button>
    <el-button @click="againStartTask()" v-bind:type="!isAgainStart === true ? 'info' : 'primary'" v-bind:disabled="!isAgainStart" v-if="isAgainStart" style="width: 25%;font-size: 15px;">重启</el-button>
  </div>
  <div class="footTab again" v-if="assignTab">
    <el-button @click="ConmentTask()" type="primary" style="width: 50%;font-size: 15px;">评论</el-button>
    <el-button @click="againStartTask()" v-bind:type="!isAgainStart === true ? 'info' : 'primary'" v-bind:disabled="!isAgainStart" style="width: 50%;font-size: 15px;">重启</el-button>
  </div>
  <el-dialog title="预览图片" width="90%" :visible.sync="picPreShow">
    <div style="width: 100%"><img style="width: 100%" v-bind:src="picPreUrl" alt=""></div>
  </el-dialog>
  <!--<div class="imgPreBox" v-on:click="imgPreBoxclick()" v-if="picPreShow"><div v-bind:style="{ marginTop: margintop + 'px' }" class="imgPre"><img v-bind:src="picPreUrl" /></div></div>-->
  <!--任务分解-->
  <div class="addNewPro" @click="taskDevide()"><img src="../../static/img/addtaskicon.png" alt=""></div>
  <!---->
</div>
</template>

<script>
import dd from '../../static/dingtalk/dingtalk'
import $ from 'jquery'
export default {
  name: 'taskDetailPage',
  data () {
    return {
      token: '',
      formId: '',
      user: '',
      hhh: false,
      isAgainStart: false,
      screenHt: this.$store.state.screenHeight,
      bgCoverHt: 0,
      upLoadName: '',
      defaultTime: '',
      disabledStarTime: '',
      disabledEndTime: '',
      pickerOptions0: {},
      keywordTrue: false,
      isDisabled: false,
      bgCoverShow: false,
      Dloading: false,
      isShow: false,
      notMore: false,
      loading: false,
      cloading: false,
      tloading: false,
      loading2: false,
      options4: [],
      isShowComment: false,
      isShowFinished: false,
      isShowTurnOver: false,
      margintop: '',
      taskId: '',
      totalLog: 0,
      pNum: 1,
      canStart: false,
      againStart: false,
      canFinished: false,
      assignTab: false,
      firstTab: true,
      conTranslate: false,
      showAgainStart: false,
      downLoadUrl: '',
      taskDownUrl: '',
      taskDetailMsg: '',
      projectManager: '',
      transferUserId: '',
      transferUserName: '',
      historyList: [],
      picPreUrl: '',
      picPreShow: false,
      commentTextarea: '',
      userId: this.$store.state.userId,
      taskHistoryData: {
        userId: this.$store.state.userId,
        rid: this.$route.params.uid,
        rtype: 3,
        pageNum: 1,
        pageSize: 5
      },
      addTaskPayload: {
        projectUID: '',
        id: this.$route.params.uid,
        formId: '',
        jobName: '',
        jobLevel: 1,
        taskStartDate: '',
        taskFinishDate: '',
        userId: this.$store.state.userId,
        userIdTransfer: '',
        _jfinal_token: '',
        userNameTransfer: ''
      },
      taskForm: {
        jobName: '',
        userName: '',
        jobLevel: 1,
        value9: [],
        date1: '',
        date2: '',
        state2: '',
        description: '',
        taskUserId: ''
      },
      autoCompleteAddTaskPayload: {
        projectManager: ''
      },
      moreUserSelectPayload: {
        projectManager: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入项目名称', trigger: 'blur' }
        ],
        jobName: [
          { required: true, message: '请输入项目名称', trigger: 'blur' }
        ],
        value9: [
          { required: true, message: '请选择任务指派人', trigger: 'change' }
        ],
        jobLevel: [
          { required: true, message: '请选择任务等级', trigger: 'change' }
        ],
        date1: [
          { type: 'string', required: true, message: '请选择开始日期', trigger: 'change' }
        ],
        date2: [
          { type: 'string', required: true, message: '请选择结束日期', trigger: 'change' }
        ]
      }
    }
  },
  watch: {
    totalLog: function (val, oldVal) {
      // console.log('totalLog', val)
      if (val > 5) {
        this.notMore = false
      }
    },
    userId: function (newVal, oldVal) {
      // console.log('totalLog', val) userId
      if (newVal) {
        this.getTaskDetailMsg()
        this.getTaskHistory()
      }
    }
  },
  computed: {
    getStoreUserId: function () {
      var that = this
      that.userId = that.$store.state.userId
      return that.$store.state.userId
    }
  },
  created: function () {
    var that = this
    this.settoken()
    this.taskId = this.$route.params.uid
    // console.log('taskId', this.taskId)
    this.$store.commit('isTabShow', false)
    this.$store.commit('setRouter', {name: 'taskDetailPage', path: '/taskDetailPage/' + that.$route.params.uid})
    if (this.$store.state.userId) {
      // alert('userId存在')
      this.queryUserInfo()
      this.getTaskHistory()
    } else {
      // alert('userId不存在')
      this.$store.commit('ddLogin', {recallback: 'false', ddgetcfg: ''})
    }
    // 设置钉钉的标题
    if (dd.version) {
      dd.biz.navigation.setTitle({
        title: '任务详情',
        onSuccess: function (result) {
          this.log(result)
        },
        onFail: function (errr) {
          this.log(errr)
        }
      })
    }
  },
  methods: {
    settoken: function () {
      this.ajax('/app/setToken', {}).then(res => {
        this.log('setToken:', res)
        this.token = res._jfinal_token
        this.log('this.token:', this.token)
      })
    },
    setScreenHeight () {
      if (this.screenHt > 576) {
        this.hhh = false
      } else {
        this.hhh = true
        this.bgCoverHt = this.screenHt
      }
    },
    queryUserInfo: function () {
      var that = this
      this.ajax('/app/getUserInfo', {userId: that.$store.state.userId}).then(res => {
        if (res.code === 200) {
          this.getTaskDetailMsg()
        } else {
          this.$store.commit('ddLogin')
          this.log('myProjectView:code=>', res.code)
        }
      })
    },
    getTaskDetailMsg: function () {
      var that = this
      that.ajax('/app/getTaskDetail', {uid: this.taskId, userId: that.userId}).then(res => {
        this.log('getTaskDetail:', res)
        if (res.code === 200) {
          console.log('getTaskDetail', res)
          var permise = true
          if (res.data.dutyId !== that.userId) {
            permise = false
            that.firstTab = false
            that.assignTab = true
          } else {
            that.assignTab = false
            that.firstTab = true
          }
          that.taskDetailMsg = res.data
          that.isAgainStart = res.data.isRestart
          var st = ''
          if (res.data.taskStartDate) {
            st = res.data.taskStartDate.split(' ')[0] + ' 00:00:00'
          }
          var et = res.data.taskFinishDate
          var sT = new Date(st.replace(/-/g, '/'))
          var eT = new Date(et.replace(/-/g, '/'))
          that.defaultTime = sT
          that.taskForm.date1 = res.data.taskStartDate
          that.taskForm.date2 = res.data.taskFinishDate
          that.disabledStarTime = sT.getTime()
          that.disabledEndTime = eT.getTime()
          this.pickerOptions0.disabledDate = function (time) {
            return time.getTime() < that.disabledStarTime || time.getTime() > that.disabledEndTime
          }
          that.addTaskPayload.projectUID = res.data.projectUID
          var downurl = that.$store.state.baseServiceUrl + '/file/downloadFile?realUrl=' + res.data.realUrl + '&showName=' + res.data.showName
          that.taskDownUrl = downurl
          if (permise) {
            if (res.data.status === '0') {
              that.canStart = false
              that.canFinished = true
              that.conTranslate = false
              that.againStart = true
              that.showAgainStart = false
            } else if (res.data.status === '1') {
              that.canStart = true
              that.canFinished = false
              that.conTranslate = false
              that.againStart = true
              that.showAgainStart = true
            } else if (res.data.status === '2') {
              that.canStart = true
              that.canFinished = true
              that.conTranslate = true
              that.againStart = false
              that.showAgainStart = true
            }
          } else {
            that.canStart = false
            that.canFinished = false
            that.conTranslate = false
            that.againStart = false
          }
        }
      })
    },
    getTaskHistory: function () {
      var that = this
      that.ajax('/app/getLogAndComment', that.taskHistoryData).then(res => {
        this.log('getLogAndComment:', res)
        if (res.code === 200) {
          // that.historyList = res.data.list
          that.historyList = that.historyList.concat(res.data.list)
          // console.log('log', res)
          that.totalLog = res.data.totalRow
          if (that.historyList.length === that.totalLog) {
            that.notMore = true
          }
          for (var i = 0; i < res.data.list.length; i++) {
            if (res.data.list[i].uploads.length > 0) {
              var downurl = that.$store.state.baseServiceUrl + '/file/downloadFile?realUrl=' + res.data.list[i].uploads[0].realUrl + '&showName=' + res.data.list[i].uploads[0].showName
              // that.downLoadUrl = downurl
              res.data.list[i].uploads[0].downLoadUrl = downurl
            }
          }
        }
      })
    },
    doneAction: function () {
      this.isShow = false
    },
    addMoreHistory: function () {
      this.pNum++
      this.taskHistoryData.pageNum = this.pNum
      this.getTaskHistory()
      // console.log('pNum', this.pNum)
    },
    startTask: function () {
      var that = this
      this.ajax('/app/dealTask', {
        taskId: that.taskId,
        userId: that.userId
      }).then(res => {
        if (res.code === 200) {
          // console.log(res)
          that.historyList = []
          that.taskHistoryData.pageNum = 1
          that.getTaskDetailMsg()
          that.getTaskHistory()
          that.$message.success('任务已开始！')
        }
      })
    },
    // 重启
    againStartTask: function () {
      var that = this
      that.$confirm('是否重新使用此任务？', '', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        that.ajax('/app/restartTask', {taskId: that.taskId, userId: that.userId}).then(res => {
          if (res.code === 200) {
            console.log('restartTask', res)
            that.taskHistoryData.pageNum = 1
            that.getTaskDetailMsg()
            that.getTaskHistory()
            that.$message.success('重启成功！')
          }
        })
      }).catch(() => {
        // that.loading = false
      })
    },
    // 完成
    finishedTask: function () {
      // var that = this
      this.isShowFinished = true
    },
    cancelUpload: function () {
      $('#myremark').val('')
      $('#myfileFinish').val('')
      this.isShowFinished = false
    },
    confirmUpload: function () {
      var that = this
      var url = that.$store.state.baseServiceUrl
      var formData = new FormData($('#uploadFileFinish')[0])
      var finishV = $('#myremark').val()
      if (finishV) {
        that.loading = true
        $.ajax({
          type: 'POST',
          url: url + '/app/finishTask',
          data: formData,
          cache: false,
          processData: false,
          contentType: false,
          crossDomain: true,
          xhrFields: {
            withCredentials: true
          }
        }).then(function (data) {
          if (data.code === 200) {
            that.$message.success('提交成功！')
            that.taskHistoryData.pageNum = 1
            that.getTaskDetailMsg()
            that.historyList = []
            that.getTaskHistory()
            that.loading = false
            $('#myremark').val('')
            $('#myfileFinish').val('')
            that.isShowFinished = false
          } else {
            that.$message.error('提交失败！')
            that.loading = false
          }
        })
      } else {
        that.$message.warning('备注不能为空！')
      }
    },
    // 评论
    ConmentTask: function () {
      this.isShowComment = true
    },
    cancelComment: function () {
      $('#myfileComment').val('')
      this.commentTextarea = ''
      this.isShowComment = false
    },
    confirmComment: function () {
      var that = this
      var url = that.$store.state.baseServiceUrl
      var formData = new FormData($('#uploadFileComment')[0])
      var commentV = $('#myremarkComment').val()
      if (commentV) {
        that.cloading = true
        $.ajax({
          type: 'POST',
          url: url + '/app/addOrEditComment',
          data: formData,
          cache: false,
          processData: false,
          contentType: false,
          crossDomain: true,
          xhrFields: {
            withCredentials: true
          }
        }).then(function (data) {
          // console.log(data)
          if (data.code === 200) {
            that.$message.success('评论成功！')
            that.taskHistoryData.pageNum = 1
            that.getTaskDetailMsg()
            that.historyList = []
            that.getTaskHistory()
            that.cloading = false
            that.commentTextarea = ''
            $('#myfileComment').val('')
            that.isShowComment = false
          } else {
            that.$message.error('评论成功！')
            that.cloading = false
          }
        })
      } else {
        that.$message.warning('评论不能为空！')
      }
    },
    // 移交
    turnOverTask: function () {
      this.isShowTurnOver = true
    },
    cancelTurnOver: function () {
      $('#myremarkTurnOver').val('')
      $('#myfileTurnOver').val('')
      this.projectManager = ''
      this.isShowTurnOver = false
    },
    confirmTurnOver: function () {
      var that = this
      var url = that.$store.state.baseServiceUrl
      var formData = new FormData($('#uploadFileTurnOver')[0])
      var turnV = $('#myremarkTurnOver').val()
      if (turnV && that.projectManager) {
        that.tloading = true
        $.ajax({
          type: 'POST',
          url: url + '/app/turnOverTask',
          data: formData,
          cache: false,
          processData: false,
          contentType: false,
          crossDomain: true,
          xhrFields: {
            withCredentials: true
          }
        }).then(function (data) {
          // console.log(data)
          if (data.code === 200) {
            that.$message.success('移交成功！')
            that.getTaskDetailMsg()
            that.historyList = []
            that.getTaskHistory()
            that.tloading = false
            that.projectManager = ''
            $('#myremarkTurnOver').val('')
            $('#myfileTurnOver').val('')
            that.isShowTurnOver = false
            that.$router.push('/myTaskListPage')
          } else {
            that.$message.error('移交失败！')
            that.tloading = false
          }
        })
      } else {
        that.$message.warning('移交人和备注不能为空！')
      }
    },
    querySearchAsync (queryString, cb) {
      var that = this
      if (queryString) {
        that.projectManager = queryString
        this.ajax('/app/autoCompleteNames', {projectManager: that.projectManager}).then(res => {
          if (res.code === 200) {
            var dddarr = []
            if (res.msg.length > 0) {
              for (var i = 0; i < res.msg.length; i++) {
                var obj = {}
                obj.value = res.msg[i].Name + ' (' + res.msg[i].jName + ')'
                obj.userId = res.msg[i].ID
                // obj.jName = res.msg[i].jName
                dddarr.push(obj)
              }
              // 调用 callback 返回建议列表的数据
              cb(dddarr)
            } else {
              var aaaddd = []
              that.$message.warning('查不到该人员！')
              cb(aaaddd)
            }
          }
        })
      }
    },
    handleSelect (item) {
      // console.log(item)
      this.transferUserId = item.userId
      this.transferUserName = item.value
    },
    picPre: function (url, imgName) {
      if (url) {
        if (this.isImage(imgName)) {
          this.picPreUrl = url
          this.picPreShow = true
        }
      } else {
        this.$message('地址无效')
      }
    },
    imgPreBoxclick: function () {
      this.picPreShow = false
    },
    // onPlanTaskCancel () {
    //   var that = this
    //   that.isDisabled = false
    //   that.bgCoverShow = false
    //   that.formDataClear()
    // },
    rateChange: function (rateval) {
      this.addTaskPayload.jobLevel = rateval
    },
    // handleSelectUser (item) {
    //   this.addTaskPayload.userIdTransfer = item.userId
    //   this.addTaskPayload.userNameTransfer = item.value
    // },
    taskDevide () {
      // this.bgCoverShow = true
      // this.setScreenHeight()
      var tId = this.$route.params.uid
      if (tId) {
        this.$router.push('/decompositionTask/' + tId)
      }
    },
    formDataClear: function () {
      this.taskForm.state2 = ''
      this.taskForm.jobName = ''
      this.taskForm.date1 = ''
      this.taskForm.date2 = ''
      this.taskForm.description = ''
      this.taskForm.jobLevel = 1
      this.upLoadName = ''
      this.taskForm.value9 = []
      this.options4 = []
    },
    remoteMethod (query) {
      var that = this
      this.log('query:', query)
      if (query !== '') {
        this.loading2 = true
        that.moreUserSelectPayload.projectManager = query
        this.ajax('/app/autoCompleteNames', that.moreUserSelectPayload).then(res => {
          that.log('autoCompleteNames:', res)
          if (res.code === 200) {
            that.options4 = res.msg
            console.log('options4', that.options4)
            this.loading2 = false
          }
        })
      } else {
        this.options4 = []
      }
    }
    // 创建添加任务
    // onTaskSubmit: function (taskForm) {
    //   var that = this
    //   var fileV = $('#devidemyfile').val()
    //   that.$refs[taskForm].validate((valid) => {
    //     if (valid) {
    //       that.user = ''
    //       console.log('value9', that.taskForm.value9)
    //       for (var i = 0; i < that.taskForm.value9.length; i++) {
    //         var lian = i === (that.taskForm.value9.length - 1) ? '' : '_'
    //         that.user = that.user + that.taskForm.value9[i].split('_')[0] + '-' + that.taskForm.value9[i].split('_')[1] + lian
    //       }
    //       that.Dloading = true
    //       that.addTaskPayload.users = that.user
    //       that.addTaskPayload.jobName = that.taskForm.jobName
    //       that.addTaskPayload.taskStartDate = that.taskForm.date1
    //       that.addTaskPayload.taskFinishDate = that.taskForm.date2
    //       that.addTaskPayload.description = that.taskForm.description
    //       that.addTaskPayload._jfinal_token = that.token
    //       that.addTaskPayload.formId = that.formId
    //       that.log('addTaskPayload:', that.addTaskPayload)
    //       that.ajax('/app/addTask', that.addTaskPayload).then(res => {
    //         if (res.code === 200) {
    //           that.formId = res.formId
    //           that.token = res._jfinal_token
    //           if (!fileV) {
    //             that.Dloading = false
    //             that.formId = ''
    //             that.bgCoverShow = false
    //             that.$message.success('任务分解成功！')
    //             that.formDataClear()
    //           } else {
    //             that.delayfuc()
    //           }
    //         } else {
    //           that.Dloading = false
    //         }
    //       })
    //     }
    //   })
    // },
    // delayfuc () {
    //   var that = this
    //   setTimeout(function () {
    //     that.uploadFile()
    //   }, 500)
    // },
    // uploadFile () {
    //   var that = this
    //   var url = that.$store.state.baseServiceUrl
    //   var formData = new FormData($('#mytaskForm')[0])
    //   var fileV = $('#devidemyfile').val()
    //   if (!fileV) {
    //     that.$message({
    //       type: 'error',
    //       message: '请选择上传文件！'
    //     })
    //   } else {
    //     $.ajax({
    //       type: 'post',
    //       url: url + '/file/uploadFileList',
    //       data: formData,
    //       cache: false,
    //       processData: false,
    //       contentType: false,
    //       crossDomain: true,
    //       xhrFields: {
    //         withCredentials: true
    //       }
    //     }).then(function (data) {
    //       // console.log('uploadFile:', data)
    //       if (data.code === 200) {
    //         that.$message({
    //           type: 'success',
    //           message: data.msg
    //         })
    //         that.Dloading = false
    //         that.formId = ''
    //         that.bgCoverShow = false
    //         that.formDataClear()
    //       } else if (data.code === 300) {
    //         that.$confirm('是否重新上传附件?', '文件上传失败', {
    //           confirmButtonText: '确定',
    //           cancelButtonText: '取消',
    //           type: 'warning'
    //         }).then(() => {
    //           that.isDisabled = true
    //           that.Dloading = false
    //           that.bgCoverShow = true
    //         }).catch(() => {
    //           that.Dloading = false
    //           that.formId = ''
    //           that.bgCoverShow = false
    //           that.formDataClear()
    //         })
    //       }
    //       console.log(data)
    //     })
    //   }
    // }
  }
}
</script>

<style scoped>
  .model,.modelFinished{
    position: fixed;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0, 0.5);
    z-index: 999;
  }
  .taskNameTitle{
    font-weight: bold;
    float: left;
    width: 75%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .cancel{
    height: 36px;
    font-size: 15px;
    padding: 8px 10px;
    background-color: #ccc;
  }
  .el-input__inner{
    height: 34px !important;
  }
  .upload{
    color: #fff;
    height: 36px;
    font-size: 15px;
    padding: 8px 10px;
    background-color: #0e78c7;
  }
  .modelFinishedCon{
    _height: 250px;
    width: 80%;
    font-family: '黑体';
    background-color: #fff;
    position: absolute;
    top: 50%;
    left: 10%;
    border-radius: 6px;
    box-sizing: border-box;
    margin-top: -160px;
    z-index: 9999;
    padding: 20px;
  }
  .modelFinishedCon.turnOver{
    margin-top: -190px;
  }
  .modelFinishedCon label{
    color: #666;
  }
  .modelFinishedCon textarea{
    height: 100px;
    width: 89%;
    margin: 0 5%;
    margin-top: 10px;
    padding: 10px;
    box-sizing: border-box;
  }
  .modelFinishedCon input{
    margin-top: 10px;
  }
  .cont{
    position: relative;
    height: 100%;
    width: 100%;
    margin-bottom: 20px;
    background-color: #f5f8fa;
  }
  .taskMsg{
    height: 102px;
    padding: 6px 10px;
    font-family: '黑体';
    color: #888;
    line-height: 20px;
    background-color: #f5f8fe;
  }
  .taskMsg.detail > p{
    margin: 0;
    max-height: 100px;
    font-size: 14px;
    text-align: left;
    overflow: scroll;
    overflow-x: hidden;
    padding-left: 10px;
  }
  .taskMsg img{
    display: inline-block;
    float: left;
    width: 20px;
  }
  .taskItem{
    color: #999;
    text-align: left;
    padding: 10px;
    border-top: 1px solid #dfdfdf;
  }
  .taskItem.name{
    padding: 6px 10px;
  }
  .label{
    display: inline-block;
    color: #aaa;
    width: 20px;
    height: 20px;
    font-size: 10px;
    text-align: center;
    line-height: 20px;
    border: 1px solid #ccc;
    border-radius: 10px;
  }
  .taskCon{
    display: inline-block;
    font-size: 14px;
    color: #666;
    font-weight: 500;
    padding-left: 10px;
    width: 85%;
  }
  .peoName{
    display: inline-block;
    color: #fff;
    width: 32px;
    height: 32px;
    font-size: 10px;
    /*-webkit-transform: scale(0.5);*/
    text-align: center;
    line-height: 32px;
    border-radius: 16px;
    background-color: #0e78c7;
  }
  .peoNameAdd{
    display: inline-block;
    color: #999;
    width: 30px;
    height: 30px;
    font-size: 13px;
    text-align: center;
    line-height: 30px;
    border-radius: 15px;
    border: 1px solid #ccc;
  }
  .logBox{
    text-align: left;
    padding: 10px 20px;
    background-color: #fff;
  }
  .quan{
    width: 14px;
    height: 14px;
    border: 1px solid #3a8ee6;
    border-radius: 8px;
    display: inline-block;
    line-height:14px;
    text-align: center;
    font-size: 10px;
    color: #3a8ee6;
  }
  .timeDate{
    display: inline-block;
    margin-left: 10px;
    position: absolute;
    top: 4px;
    color: #666;
    font-weight: bold;
  }
  .TimeLine .timeCont{
    padding-top: 10px;
    margin-left: 8px;
    border-left: 1px solid #ddd;
    padding-left: 16px;
    font-size: 14px;
    color: #999;
    padding-bottom: 8px;
  }
  .contBoxContentWrap{
    margin-top: 6px;
    margin-bottom: 6px;
    background-color: #f5f5f5;
  }
  .contentHide .contBoxContentWrap{
    display: none;
  }
  .contentHide .contBoxContent{
    display: none;
  }
  .contentShow .contBoxContent{
    display: block;
  }
  .contBoxContent{
    color: #999;
    font-size: 12px;
    padding-left: 8px;
    line-height: 22px;
  }
  .TimeLine:last-of-type .timeCont{
    border-left: none;
  }
  .footTab{
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 40px;
    line-height: 40px;
    display: flex;
    background-color: #f5f5f5;
    justify-content: flex-start;
    border-top: 1px solid #ccc;
    z-index: 99;
  }
  .footTab.again{
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 40px;
    line-height: 40px;
    display: flex;
    background-color: #f5f5f5;
    justify-content: flex-start;
    border-top: 1px solid #ccc;
    z-index: 99;
  }
  .mint-button{
    border-radius: 0 !important;
  }
  .footTab>div{
    width: 25%;
    height: 40px;
    color: #999;
    font-size: 16px;
    text-align: center;
    font-family: '黑体';
    border-left: 1px solid #ccc;
  }
  .footTab .active{
    color: #fff;
    background-color: #0e78c7;
  }
  .state0{
    display: inline-block;
    font-size: 14px;
    color: #e40707;
    margin-left: 10px;
  }
  .state1{
    display: inline-block;
    font-size: 14px;
    color: #53b5ff;
    margin-left: 10px;
  }
  .state2{
    display: inline-block;
    font-size: 14px;
    color: #27CF97;
    margin-left: 10px;
  }
  .imgPreBox{
    width: 100%;
    height: 100%;
    position: fixed;
    left: 0;
    top: 0;
    background: rgba(0,0,0,0.7);
  }
  .imgPre{
    width: 100%;
    position: absolute;
    top: 50%;
  }
  .imgPre img{
    width: 100%;
  }
  div img{
    width: 100%;
  }
  .filepre{
    color: #3a8ee6;
    margin-right: 10px;
    cursor: pointer;
  }
  .addNewPro{
    position: fixed;
    right: 0;
    width: 22px;
    top: 35%;
    z-index: 100;
  }
  .addNewPro img{
    width: 100%;
  }
  /*bgcover*/
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
    padding: 20px;
    margin-top: 15px;
    overflow: scroll;
    padding-bottom: 30px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }
  .colose {
    float: right;
    margin: -40px -33px;
    font-size: 20px;
    color: #409EFF;
    height: 20px;
    width: 20px;
    text-align: center;
    cursor: pointer;
  }
</style>
