<template>
    <div class="devideBox" v-loading="Dloading">
      <el-form ref="taskForm" :model="taskForm" :rules="rules" label-width="80px" style="padding-top: 20px;padding-bottom: 40px;">
        <el-form-item label="任务名称" prop="jobName" maxlength="100" width="100" style="margin-bottom: 20px;">
          <el-input class="planNameIpt" v-model="taskForm.jobName" placeholder="请输入任务名称" style="width: 100%;"></el-input>
        </el-form-item>
        <el-form-item label="任务级别" prop="jobLevel" maxlength="100" width="100" style="margin-bottom: 20px;">
          <div class="ratestar" style="padding-top: 8px;">
            <el-rate v-model="taskForm.jobLevel" v-on:change="rateChange($event)"></el-rate>
          </div>
        </el-form-item>
        <el-form-item label="任务指派" prop="value9" maxlength="100">
          <el-col>
            <el-select v-model="taskForm.value9" multiple filterable remote style="width: 100%;"
              :reserve-keyword="keywordTrue" placeholder="请输人员姓名或拼音"
              :remote-method="remoteMethod" :loading="loading2">
              <el-option v-for="item in options4" :key="item.ID" :label="item.Name + ' (' + item.jName + ')'"
              :value="item.Name + '(' + item.jName + ')' + '_' + item.ID">
              </el-option>
            </el-select>
          </el-col>
        </el-form-item>
        <el-form-item label="开始时间" prop="date1" style="margin-bottom: 20px;">
          <!--<el-input class="planNameIpt" required  @focus="selectTaskStartTime()" v-model="taskForm.date1" placeholder="请选择任务开始时间" style="width: 100%;"></el-input>-->
          <div class="selectData" @click="selectTaskStartTime">{{taskForm.date1}}</div>
        </el-form-item>
        <el-form-item label="结束时间" prop="date2" style="margin-bottom: 20px;">
          <div class="selectData" @click="selectTaskEndTime">{{taskForm.date2}}</div>
          <!--<el-input class="planNameIpt" required  @focus="selectTaskEndTime()" v-model="taskForm.date2" placeholder="请选择任务结束时间" style="width: 100%;"></el-input>-->
        </el-form-item>
        <el-form-item label="任务描述" prop="description" maxlength="100" width="100" style="margin-bottom: 20px;">
          <el-input style="width: 100%;" class="planNameIpt" type="textarea" :rows="2" v-model="taskForm.description"></el-input>
        </el-form-item>
        <form id="mytaskForm" enctype="multipart/form-data" style="padding-left: 12px;">
          <div style="font-size: 14px;color: #555;height: 30px;line-height: 30px;display: inline-block;">添加附件</div>&nbsp;&nbsp;
          <input type="file" id="devidemyfile" name="myfile" placeholder="请选择文件"/>
          <input type="hidden" name="formId" v-bind:value="formId">
          <div style="padding-left: 70px;font-size: 12px;height: 16px;color: #409eff">{{upLoadName}}</div>
        </form>
        <div class="devideBtn">
          <el-button style="margin-right: 20px;" type="primary" @click="onTaskSubmit('taskForm')">立即分解</el-button>
          <el-button @click="onPlanTaskCancel()">取消分解</el-button>
        </div>
      </el-form>
    </div>
</template>

<script>
import dd from '../../static/dingtalk/dingtalk'
export default {
  name: 'decompositionTask',
  data () {
    return {
      token: '',
      options4: [],
      startDate: '',
      minHour: '',
      nowMinte: '',
      startTimeNow: '',
      upLoadName: '暂无附件',
      Dloading: false,
      formId: '',
      taskId: this.$route.params.tId,
      pickerOptions0: {},
      moreUserSelectPayload: {
        projectManager: ''
      },
      taskForm: {
        jobLevel: 1,
        value9: '',
        date1: '',
        date2: '',
        jobName: '',
        description: ''
      },
      addTaskPayload: {
        projectUID: '',
        id: this.$route.params.tId,
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
      keywordTrue: false,
      loading2: false,
      rules: {
        name: [
          { required: true, message: '请输入项目名称', trigger: 'blur' }
        ],
        jobName: [
          { required: true, message: '请输入项目名称', trigger: 'blur' }
        ],
        value9: [
          { required: true, message: '请选择任务指派人', trigger: 'blur' }
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
  created: function () {
    this.$store.commit('isTabShow', false)
    if (!this.$store.state.userId) {
      this.$store.commit('ddLogin', {recallback: 'false', ddgetcfg: ''})
    }
    // 设置钉钉的标题
    if (dd.version) {
      dd.biz.navigation.setTitle({
        title: '分解任务',
        onSuccess: function (result) {
          console.log(result)
        },
        onFail: function (errr) {
          console.log(errr)
        }
      })
    }
    this.getNowDataTime()
    this.getTaskDetailMsg()
    this.settoken()
  },
  methods: {
    settoken: function () {
      this.ajax('/app/setToken', {}).then(res => {
        this.log('setToken:', res)
        this.token = res._jfinal_token
        this.log('this.token:', this.token)
      })
    },
    getTaskDetailMsg: function () {
      var that = this
      that.ajax('/app/getTaskDetail', {uid: this.taskId}).then(res => {
        console.log('getTaskDetail', res)
        that.addTaskPayload.projectUID = res.data.projectUID
      })
    },
    rateChange: function (val) {
      console.log(val)
      this.addTaskPayload.jobLevel = val
    },
    getNowDataTime: function () {
      var that = this
      var starTime = new Date()
      var staryear = starTime.getFullYear()
      var starmonth = (starTime.getMonth() + 1) < 10 ? '0' + (starTime.getMonth() + 1) : (starTime.getMonth() + 1)
      var starday = starTime.getDate() < 10 ? '0' + starTime.getDate() : starTime.getDate()
      var starHours = starTime.getHours() < 10 ? '0' + starTime.getHours() : starTime.getHours()
      var starMinut = starTime.getMinutes() < 10 ? '0' + starTime.getMinutes() : starTime.getMinutes()
      // var daySecond = nowEndData.getSeconds() < 10 ? '0' + nowEndData.getSeconds() : nowEndData.getSeconds()
      var nStar = Math.ceil(starMinut / 10)
      var ceilMintStar = nStar * 10
      if (ceilMintStar === 60) {
        ceilMintStar = '00'
        starHours = starHours + 1
      }
      that.startTimeNow = staryear + '-' + starmonth + '-' + starday + ' ' + starHours + ':' + ceilMintStar
      var startDay = staryear + '-' + starmonth + '-' + starday
      that.nowMinte = staryear + '-' + starmonth + '-' + starday + ' ' + starHours + ':' + starMinut
      that.startDate = startDay
      that.minHour = starHours
      that.taskForm.date1 = that.startTimeNow
      var getTime = new Date().getTime()
      var addTime = 60 * 60 * 1000
      var endTime = getTime + addTime
      var nowEndData = new Date(endTime)
      var yearEnd = nowEndData.getFullYear()
      var monthEnd = (nowEndData.getMonth() + 1) < 10 ? '0' + (nowEndData.getMonth() + 1) : (nowEndData.getMonth() + 1)
      var dayEnd = nowEndData.getDate() < 10 ? '0' + nowEndData.getDate() : nowEndData.getDate()
      var dayHours = nowEndData.getHours() < 10 ? '0' + nowEndData.getHours() : nowEndData.getHours()
      var dayMinte = nowEndData.getMinutes() < 10 ? '0' + nowEndData.getMinutes() : nowEndData.getMinutes()
      // var daySecond = nowEndData.getSeconds() < 10 ? '0' + nowEndData.getSeconds() : nowEndData.getSeconds()
      var n = Math.ceil(dayMinte / 10)
      var ceilMint = n * 10
      if (ceilMint === 60) {
        ceilMint = '00'
        dayHours = dayHours + 1
      }
      var lastTime = yearEnd + '-' + monthEnd + '-' + dayEnd + ' ' + dayHours + ':' + ceilMint
      that.taskForm.date2 = lastTime
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
    },
    selectTaskStartTime: function () {
      var that = this
      that.$vux.datetime.show({
        cancelText: '取消',
        confirmText: '确定',
        value: that.taskForm.date1,
        format: 'YYYY-MM-DD HH:mm',
        startDate: that.startDate,
        minuteList: ['00', '10', '20', '30', '40', '50'],
        onConfirm (val) {
          console.log('plugin confirm', val)
          // that.year = val.split('-')[0]
          // that.month = val.split('-')[1]
          var nowBinTime = new Date(that.nowMinte.replace(/-/g, '/')).getTime()
          var getSelectTime = new Date(val.replace(/-/g, '/')).getTime()
          if (getSelectTime < nowBinTime) {
            that.$message.warning('时间应大于当前时间')
            that.taskForm.date1 = that.startTimeNow
          } else {
            that.taskForm.date1 = val
          }
          var getTime = new Date(that.taskForm.date1.replace(/-/g, '/')).getTime()
          var addTime = 60 * 60 * 1000
          var endTime = getTime + addTime
          var nowEndData = new Date(endTime)
          var yearEnd = nowEndData.getFullYear()
          var monthEnd = (nowEndData.getMonth() + 1) < 10 ? '0' + (nowEndData.getMonth() + 1) : (nowEndData.getMonth() + 1)
          var dayEnd = nowEndData.getDate() < 10 ? '0' + nowEndData.getDate() : nowEndData.getDate()
          var dayHours = nowEndData.getHours() < 10 ? '0' + nowEndData.getHours() : nowEndData.getHours()
          var dayMinte = nowEndData.getMinutes() < 10 ? '0' + nowEndData.getMinutes() : nowEndData.getMinutes()
          // var daySecond = nowEndData.getSeconds() < 10 ? '0' + nowEndData.getSeconds() : nowEndData.getSeconds()
          var lastTime = yearEnd + '-' + monthEnd + '-' + dayEnd + ' ' + dayHours + ':' + dayMinte
          that.taskForm.date2 = lastTime
        },
        onShow () {
          console.log('plugin show')
        },
        onHide () {
          console.log('plugin hide')
        }
      })
    },
    selectTaskEndTime: function () {
      var that = this
      that.$vux.datetime.show({
        cancelText: '取消',
        confirmText: '确定',
        value: that.taskForm.date2,
        format: 'YYYY-MM-DD HH:mm',
        startDate: that.startDate,
        minuteList: ['00', '10', '20', '30', '40', '50'],
        onConfirm (val) {
          console.log('plugin confirm', val)
          // that.year = val.split('-')[0]
          // that.month = val.split('-')[1]
          var nowBinTime = new Date(that.taskForm.date1.replace(/-/g, '/')).getTime()
          var getSelectTime = new Date(val.replace(/-/g, '/')).getTime()
          if (getSelectTime < nowBinTime) {
            that.$message.warning('结束时间应大于开始时间')
            that.taskForm.date2 = that.taskForm.date1
          } else {
            that.taskForm.date2 = val
          }
        },
        onShow () {
          console.log('plugin show')
        },
        onHide () {
          console.log('plugin hide')
        }
      })
    },
    onTaskSubmit: function (taskForm) {
      var that = this
      var fileV = $('#devidemyfile').val()
      that.$refs[taskForm].validate((valid) => {
        if (valid) {
          that.user = ''
          console.log('value9', that.taskForm.value9)
          for (var i = 0; i < that.taskForm.value9.length; i++) {
            var lian = i === (that.taskForm.value9.length - 1) ? '' : '_'
            that.user = that.user + that.taskForm.value9[i].split('_')[0] + '-' + that.taskForm.value9[i].split('_')[1] + lian
          }
          that.Dloading = true
          that.addTaskPayload.users = that.user
          that.addTaskPayload.jobName = that.taskForm.jobName
          that.addTaskPayload.taskStartDate = that.taskForm.date1 + ':00'
          that.addTaskPayload.taskFinishDate = that.taskForm.date2 + ':00'
          that.addTaskPayload.description = that.taskForm.description
          that.addTaskPayload._jfinal_token = that.token
          that.addTaskPayload.formId = that.formId
          that.log('addTaskPayload:', that.addTaskPayload)
          var starTime = that.taskForm.date1
          var endTime = that.taskForm.date2
          var sT = new Date(starTime).getTime()
          var eT = new Date(endTime).getTime()
          if (sT > eT) {
            that.$message.warning('开始时间不能大于结束时间！')
            that.Dloading = false
          } else {
            that.ajax('/app/addTask', that.addTaskPayload).then(res => {
              if (res.code === 200) {
                that.formId = res.formId
                that.token = res._jfinal_token
                if (!fileV) {
                  that.Dloading = false
                  that.formId = ''
                  that.bgCoverShow = false
                  that.$message.success('任务分解成功！')
                  that.$router.push('/taskDetailPage/' + that.$route.params.tId)
                  that.formDataClear()
                } else {
                  that.delayfuc()
                }
              } else {
                that.Dloading = false
              }
            })
          }
        }
      })
    },
    delayfuc () {
      var that = this
      setTimeout(function () {
        that.uploadFile()
      }, 500)
    },
    uploadFile () {
      var that = this
      var url = that.$store.state.baseServiceUrl
      var formData = new FormData($('#mytaskForm')[0])
      var fileV = $('#devidemyfile').val()
      if (!fileV) {
        that.$message({
          type: 'error',
          message: '请选择上传文件！'
        })
      } else {
        $.ajax({
          type: 'post',
          url: url + '/file/uploadFileList',
          data: formData,
          cache: false,
          processData: false,
          contentType: false,
          crossDomain: true,
          xhrFields: {
            withCredentials: true
          }
        }).then(function (data) {
          // console.log('uploadFile:', data)
          if (data.code === 200) {
            that.$message({
              type: 'success',
              message: data.msg
            })
            that.Dloading = false
            that.formId = ''
            that.bgCoverShow = false
            that.formDataClear()
          } else if (data.code === 300) {
            that.$confirm('是否重新上传附件?', '文件上传失败', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              that.isDisabled = true
              that.Dloading = false
              that.bgCoverShow = true
            }).catch(() => {
              that.Dloading = false
              that.formId = ''
              that.bgCoverShow = false
              that.formDataClear()
              that.$router.push('/taskDetailPage/' + that.$route.params.tId)
            })
          }
          console.log(data)
        })
      }
    },
    onPlanTaskCancel () {
      var that = this
      that.isDisabled = false
      that.bgCoverShow = false
      that.formDataClear()
      that.$router.push('/taskDetailPage/' + that.$route.params.tId)
    },
    formDataClear: function () {
      $('#devidemyfile').val('')
      this.taskForm.state2 = ''
      this.taskForm.jobName = ''
      this.taskForm.description = ''
      this.taskForm.jobLevel = 1
      this.upLoadName = ''
      this.taskForm.value9 = []
      this.options4 = []
    }
  }
}
</script>

<style scoped>
  .devideBtn{
    text-align: center;
    margin-top: 40px;
    display: flex;
    justify-content: center !important;
  }
  .devideBox{
    background-color: #fff;
    padding: 0 10px;
    margin-top: 20px;
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
