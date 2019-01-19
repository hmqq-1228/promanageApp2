<template>
  <div style="position: relative">
    <div>{{getUserId?'':''}}</div>
    <!--完成-->
    <div class="modelFinished" v-if="isShowFinished">
      <form id="uploadFileFinish" enctype="multipart/form-data">
        <div class="modelFinishedCon" v-loading="loading">
          <label><span style="color: red">*</span> 完成备注：</label>
          <textarea name="remark" id="myremark"></textarea>
          <label>上传附件：</label>
          <input type="file" id="myfileFinish" name="myfile" value="">
          <input type="hidden" name="taskId" v-bind:value="taskId">
          <input type="hidden" name="userId" v-bind:value="userId">
          <div style="text-align: center;margin-top: 16px;">
            <a class="cancel" type="button" @click="cancelUpload()">关闭</a>
            <a class="upload" type="button" @click="confirmUpload()">提交</a>
          </div>
        </div>
      </form>
    </div>
    <!--评论-->
    <div class="modelFinished" v-if="isShowComment">
      <form id="uploadFileComment" enctype="multipart/form-data">
        <div class="modelFinishedCon" v-loading="cloading">
          <label><span style="color: red">*</span> 评论：</label>
          <textarea name="content" id="myremarkComment"></textarea>
          <label>上传附件：</label>
          <input type="file" id="myfileComment" name="myfile" value="">
          <input type="hidden" name="rid" v-bind:value="taskId">
          <input type="hidden" name="rtype" v-bind:value="3">
          <input type="hidden" name="userId" v-bind:value="userId">
          <div style="text-align: center;margin-top: 16px;">
            <a class="cancel" type="button" @click="cancelComment()">关闭</a>
            <a class="upload" type="button" @click="confirmComment()">提交</a>
          </div>
        </div>
      </form>
    </div>
    <!--移交-->
    <div class="modelFinished" v-if="isShowTurnOver">
      <div style="height: 320px" class="modelFinishedCon" v-loading="tloading">
        <label><span style="color: red">*</span> 任务移交人：</label>
        <el-autocomplete style="width: 90%;margin: 10px 5%"
                         v-model="projectManager"
                         :fetch-suggestions="querySearchAsync"
                         placeholder="请输入移交人姓名"
                         :trigger-on-focus="false"
                         @select="handleSelect"
        ></el-autocomplete>
        <form id="uploadFileTurnOver" enctype="multipart/form-data">
          <label><span style="color: red">*</span> 移交备注：</label>
          <textarea name="remark" id="myremarkTurnOver"></textarea>
          <label>上传附件：</label>
          <input type="file" id="myfileTurnOver" name="myfile" value="">
          <input type="hidden" name="taskId" v-bind:value="taskId">
          <input type="hidden" name="userId" v-bind:value="userId">
          <input type="hidden" name="transferUserId" v-bind:value="transferUserId">
          <input type="hidden" name="transferUserName" v-bind:value="transferUserName">
          <div style="text-align: center;margin-top: 16px;">
            <a class="cancel" type="button" @click="cancelTurnOver()">关闭</a>
            <a class="upload" type="button" @click="confirmTurnOver()">移交</a>
          </div>
        </form>
      </div>
    </div>
    <div class="cont">
      <!--<div class="taskMsg">-->
      <!--<p>这是一个即将完成的项目，需要各个部门协调完成。需要各个部门协调完成,需要各个部门协调完成,需要各个部门协调完成</p>-->
      <!--</div>-->
      <!--<img style="position: absolute;top: 10px;right: 20px;width: 100px;" src="../../static/img/finish.png" alt="">-->
      <div class="taskList" style="background-color: #fff; margin-top: 20px;">
        <div class="taskItem">
          <span class="label">名</span>
          <div class="taskCon"><span style="font-weight: bold;">{{taskDetailMsg.jobName}}</span> <span v-bind:class="'state' + taskDetailMsg.status">({{taskDetailMsg.field1}})</span></div>
        </div>
        <div class="taskItem">
          <span class="label">附</span>
          <div class="taskCon">
            <div class="picPreSmall" style="width: 100px;" v-on:click="picPre(taskDetailMsg.previewUrl)" v-if="taskDetailMsg.imageOrNot===1?true:false">
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
              <span class="label">提</span>
            </div>
            <div class="taskCon">
              <span class="peoName">{{taskDetailMsg.createrName}}</span>
            </div>
          </div>
          <!--<div style="display: inline-block;width: 40px"></div>-->
          <div style="display: flex">
            <div style="padding-top: 5px">
              <span class="label">执</span>
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
        <div class="taskItem" style="border-bottom: 1px solid #ccc">
          <span class="label">止</span>
          <div class="taskCon"><span>{{taskDetailMsg.taskFinishDate}} 结束</span></div>
        </div>
      </div>
      <div class="taskMsg detail">
        <img src="../../static/img/detail.png" alt="">
        <p>{{taskDetailMsg.description}}</p>
      </div>
      <div class="history">
        <div class="logBox">
          <div class="TimeLine" v-for="(history,index) in historyList" style="position: relative;" v-bind:key="history.index">
            <div class="quan">{{index+1}}</div>
            <div class="timeDate">{{history.oTime}}</div>
            <div class="timeCont">【{{history.oName}}】<span class="listColor">{{history.oContent}}</span>
              <div class="contBoxContentWrap">
                <div class="contBoxContent" v-if="history.comment">评论：{{history.comment}}</div>
                <div class="contBoxContent" v-if="history.uploads.length !== 0">
                  附件：<a v-bind:href="downLoadUrl">{{history.uploads[0].showName}} <i style="font-weight: bold !important; padding: 5px; color: chocolate;" class="el-icon-download"></i></a>
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
    <div class="footTab">
      <mt-button @click="startTask()" v-bind:disabled="canStart" style="width: 25%;background-color: #0e78c7;color: #fff;font-size: 15px;">开始</mt-button>
      <mt-button @click="turnOverTask()" v-bind:disabled="conTranslate" style="width: 25%;background-color: #0e78c7;color: #fff;font-size: 15px;">移交</mt-button>
      <mt-button @click="ConmentTask()" style="width: 25%;background-color: #0e78c7;color: #fff;font-size: 15px;">评论</mt-button>
      <mt-button @click="finishedTask()" v-bind:disabled="canFinished" style="width: 25%;background-color: #0e78c7;color: #fff;font-size: 15px;">完成</mt-button>
    </div>
    <div class="imgPreBox" v-on:click="imgPreBoxclick()" v-if="picPreShow"><div v-bind:style="{ marginTop: margintop + 'px' }" class="imgPre"><img v-bind:src="picPreUrl" /></div></div>
  </div>
</template>

<script>
import $ from 'jquery'
export default {
  name: 'antherQuestionDetail',
  data () {
    return {
      isShow: false,
      notMore: false,
      loading: false,
      cloading: false,
      tloading: false,
      isShowComment: false,
      isShowFinished: false,
      isShowTurnOver: false,
      margintop: '',
      taskId: '',
      totalLog: 0,
      pNum: 1,
      canStart: false,
      canFinished: false,
      conTranslate: false,
      downLoadUrl: '',
      taskDownUrl: '',
      taskDetailMsg: '',
      projectManager: '',
      transferUserId: '',
      transferUserName: '',
      historyList: [],
      picPreUrl: '',
      picPreShow: false,
      userId: this.$store.state.userId,
      taskHistoryData: {
        userId: this.$store.state.userId,
        rid: this.$route.params.uid,
        rtype: 3,
        pageNum: 1,
        pageSize: 5
      }
    }
  },
  watch: {
    totalLog: function (val, oldVal) {
      console.log('totalLog', val)
      if (val > 5) {
        this.notMore = false
      }
    },
    userId: function (newVal, oldVal) {
      if (newVal) {
        this.getTaskDetailMsg()
        this.getTaskHistory()
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
  created: function () {
    var that = this
    this.taskId = this.$route.params.uid
    console.log('taskId', this.taskId)
    this.$store.commit('isTabShow', false)
    this.$store.commit('setRouter', {name: 'taskDetailPage', path: '/taskDetailPage/' + that.$route.params.uid})
    if (this.$store.state.userId) {
      // alert('userId存在')
      this.getTaskDetailMsg()
      this.getTaskHistory()
    } else {
      // alert('userId不存在')
      this.$store.commit('ddLogin', {recallback: 'false', ddgetcfg: 'getLaunchDDConfig'})
    }
  },
  methods: {
    getTaskDetailMsg: function () {
      var that = this
      that.ajax('/app/getTaskDetail', {uid: this.taskId, userId: that.userId}).then(res => {
        if (res.code === 200) {
          console.log('getTaskDetail', res)
          var permise = true
          // alert('res.dutyId:' + res.data.dutyId + ', that.userId:' + that.userId)
          if (res.data.dutyId !== that.userId) {
            permise = false
          }
          that.taskDetailMsg = res.data
          var downurl = that.$store.state.baseServiceUrl + '/file/downloadFile?realUrl=' + res.data.realUrl + '&showName=' + res.data.showName
          that.taskDownUrl = downurl
          if (permise) {
            if (res.data.status === '0') {
              that.canStart = false
              that.canFinished = true
              that.conTranslate = false
            } else if (res.data.status === '1') {
              that.canStart = true
              that.canFinished = false
              that.conTranslate = false
            } else if (res.data.status === '2') {
              that.canStart = true
              that.canFinished = true
              that.conTranslate = true
            }
          } else {
            that.canStart = true
            that.canFinished = true
            that.conTranslate = true
          }
        }
      })
    },
    getTaskHistory: function () {
      var that = this
      that.ajax('/app/getLogAndComment', that.taskHistoryData).then(res => {
        if (res.code === 200) {
          // that.historyList = res.data.list
          that.historyList = that.historyList.concat(res.data.list)
          console.log('log', res)
          that.totalLog = res.data.totalRow
          if (that.historyList.length === that.totalLog) {
            that.notMore = true
          }
          for (var i = 0; i < res.data.list.length; i++) {
            if (res.data.list[i].uploads.length > 0) {
              var downurl = that.$store.state.baseServiceUrl + '/file/downloadFile?realUrl=' + res.data.list[i].uploads[0].realUrl + '&showName=' + res.data.list[i].uploads[0].showName
              that.downLoadUrl = downurl
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
      console.log('pNum', this.pNum)
    },
    startTask: function () {
      var that = this
      this.ajax('/app/dealTask', {
        taskId: that.taskId,
        userId: that.userId
      }).then(res => {
        if (res.code === 200) {
          console.log(res)
          that.historyList = []
          this.getTaskDetailMsg()
          this.getTaskHistory()
          that.$toast({
            message: '任务已开始'
          })
        }
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
            that.$toast({
              message: '提交成功'
            })
            that.getTaskDetailMsg()
            that.historyList = []
            that.getTaskHistory()
            that.loading = false
            $('#textAreaFinish').val('')
            $('#myfileFinish').val('')
            that.isShowFinished = false
          } else {
            that.$toast({
              message: '提交失败'
            })
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
      $('#myremarkComment').val('')
      $('#myfileComment').val('')
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
          console.log(data)
          if (data.code === 200) {
            that.$toast({
              message: '评论成功'
            })
            that.getTaskDetailMsg()
            that.historyList = []
            that.getTaskHistory()
            that.cloading = false
            $('#myremarkComment').val('')
            $('#myfileComment').val('')
            that.isShowComment = false
          } else {
            that.$toast({
              message: '评论失败'
            })
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
          console.log(data)
          if (data.code === 200) {
            that.$toast({
              message: '移交成功'
            })
            that.getTaskDetailMsg()
            that.historyList = []
            that.getTaskHistory()
            that.tloading = false
            $('#myremarkTurnOver').val('')
            $('#myfileTurnOver').val('')
            that.isShowTurnOver = false
            that.$router.push('/taskListPage')
          } else {
            that.$toast({
              message: '移交失败'
            })
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
              that.$toast({message: '查无此人'})
              cb(aaaddd)
            }
          }
        })
      }
    },
    handleSelect (item) {
      console.log(item)
      this.transferUserId = item.userId
      this.transferUserName = item.value
    },
    // toOperation: function (e) {
    //   var obg = e.currentTarget
    //   console.log(obg)
    //   $(obg).addClass('active')
    //   $(obg).siblings().removeClass('active')
    // },
    picPre: function (src) {
      var preSmallWidth = $('.picPreSmall').width()
      var preSmallHeight = $('.picPreSmall').height()
      var winWidth = $(window).width()
      var preBigWidth = ''
      preBigWidth = parseInt(preSmallHeight) * parseInt(winWidth) / parseInt(preSmallWidth)
      this.picPreUrl = src
      this.picPreShow = true
      this.margintop = -(preBigWidth / 2)
    },
    imgPreBoxclick: function () {
      this.picPreShow = false
    }
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
    height: 250px;
    width: 80%;
    font-family: '黑体';
    background-color: #fff;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    z-index: 9999;
    padding: 10px;
  }
  .modelFinishedCon label{
    color: #666;
  }
  .modelFinishedCon textarea{
    height: 100px;
    width: 89%;
    margin: 0 5%;
    margin-top: 10px;
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
    height: 82px;
    padding: 6px 10px;
    font-family: '黑体';
    color: #888;
    line-height: 20px;
    background-color: #f5f5f5;
  }
  .taskMsg.detail > p{
    margin: 0;
    height: 80px;
    font-size: 14px;
    text-align: left;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp:4;
    overflow: hidden;
    padding-left: 10px;
  }
  /*.taskMsg p{*/
  /*margin: 0;*/
  /*font-size: 14px;*/
  /*text-align: left;*/
  /*display: -webkit-box;*/
  /*-webkit-box-orient: vertical;*/
  /*-webkit-line-clamp: 3;*/
  /*overflow: hidden;*/
  /*padding-left: 10px;*/
  /*}*/
  .taskMsg img{
    display: inline-block;
    float: left;
    width: 24px;
  }
  .taskItem{
    color: #999;
    text-align: left;
    padding: 10px;
    border-top: 1px solid #ccc;
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
</style>
