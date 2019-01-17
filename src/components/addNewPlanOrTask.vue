<template>
    <div style="background-color: #fff;" v-loading="loading">
      <el-tabs v-model="activeNameBgCover" type="card">
        <el-tab-pane label="增加计划" name="first" v-bind:disabled="panshow">
          <!--计划form-->
          <div class="planTaskBox">
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
              <el-form-item label="计划名称" prop="name" maxlength="100" width="100" style="margin-bottom: 30px;">
                <el-input v-model="form.name"  placeholder="请输入计划名称"></el-input>
              </el-form-item>
              <el-form-item label="开始时间" prop="date1" style="margin-bottom: 30px;">
                <div class="selectData" @click="getPlanStartTime">{{form.date1}}</div>
                <!--<el-input v-model="form.date1"  placeholder="请输入开始时间" @focus="getPlanStartTime"></el-input>-->
              </el-form-item>
              <el-form-item label="结束时间" prop="date2" style="margin-bottom: 30px;">
                <div class="selectData" @click="getPlanEndTime">{{form.date2}}</div>
                <!--<el-input v-model="form.date2"  placeholder="请输入开始时间" @focus="getPlanEndTime"></el-input>-->
              </el-form-item>
              <el-form-item label="计划描述" prop="description" maxlength="100" width="100" style="margin-bottom: 30px;">
                <el-input class="planNameIpt" type="textarea" :rows="2" v-model="form.description"></el-input>
              </el-form-item>
              <div style="text-align: center">
                <el-button type="primary" @click="onPlanSubmit('form')">立即创建</el-button>
                <el-button @click="onPlanCancel()">取消</el-button>
              </div>
            </el-form>
          </div>
          <!---->
        </el-tab-pane>
        <el-tab-pane label="增加任务" name="second">
          <!--任务form-->
          <div class="planTaskBox" style="position: relative;padding-top: 0;">
            <el-form ref="taskForm" :rules="rules" :model="taskForm" label-width="80px">
              <el-form-item label="任务名称" prop="jobName" maxlength="100" width="100">
                <el-input class="planNameIpt" v-model="taskForm.jobName" placeholder="请输入任务名称"></el-input>
              </el-form-item>
              <el-form-item label="任务级别" prop="jobLevel" maxlength="100" width="100">
                <div class="ratestar" style="padding-top: 6px;">
                  <el-rate v-model="taskForm.jobLevel" v-on:change="rateChange($event)"></el-rate>
                </div>
              </el-form-item>
              <el-form-item label="任务指派" prop="value9" maxlength="100" width="100">
                <el-col>
                  <el-select v-model="taskForm.value9" multiple filterable remote style="width: 100%;"
                             :reserve-keyword="false" placeholder="请输人员姓名或拼音"
                             :remote-method="remoteMethod" :loading="loading2">
                    <el-option v-for="item in options4" :key="item.ID" :label="item.Name + ' (' + item.jName + ')'"
                               :value="item.Name + '(' + item.jName + ')' + '_' + item.ID">
                    </el-option>
                  </el-select>
                </el-col>
              </el-form-item>
              <el-form-item label="开始时间" prop="date1">
                <div class="selectData" @click="getTaskStartTime">{{taskForm.date1}}</div>
                <!--<el-input class="planNameIpt" v-model="taskForm.date1" placeholder="请输入开始时间" @focus="getTaskStartTime"></el-input>-->
              </el-form-item>
              <el-form-item label="结束时间" prop="date2">
                <div class="selectData" @click="getTaskEndTime">{{taskForm.date2}}</div>
                <!--<el-input class="planNameIpt" v-model="taskForm.date2" placeholder="请输入结束时间" @focus="getTaskEndTime"></el-input>-->
              </el-form-item>
              <el-form-item label="任务描述" prop="description" maxlength="100" width="100">
                <el-input class="planNameIpt" type="textarea" :rows="2" v-model="taskForm.description"></el-input>
              </el-form-item>
              <el-form-item style="height: 30px;" label="任务附件">
                <form id="mytaskForm" enctype="multipart/form-data">
                  <input type="file" id="myfile" name="myfile" placeholder="请选择文件" style="width: 175px;"/>
                  <input type="hidden" name="formId" v-bind:value="formId">
                  <!--<el-button style="background-color: #409EFF;color: #fff;border: none;border-radius: 4px;padding: 4px;" @click="uploadFile()">立即上传</el-button>-->
                  <div style="padding-left: 70px;font-size: 12px;height: 16px;color: #409eff">{{upLoadName}}</div>
                </form>
              </el-form-item>
              <div style="text-align: center">
                <el-button type="primary" @click="onTaskSubmit('taskForm')">立即创建</el-button>
                <el-button @click="onTaskCancel()">取消</el-button>
              </div>
            </el-form>
          </div>
          <!---->
        </el-tab-pane>
      </el-tabs>
    </div>
</template>

<script>
import dd from '../../static/dingtalk/dingtalk'
export default {
  name: 'addNewPlanOrTask',
  data () {
    return {
      activeNameBgCover: 'first',
      panshow: false,
      loading: false,
      loading2: false,
      endDate: '',
      minHours: '',
      nodeid: this.$route.params.nodeId,
      nodeType: this.$route.params.proType,
      projectUID: this.$route.params.pnid,
      childStartTime: '',
      childStartDate: '',
      childStartDateShow: '',
      resultEShow: '',
      formId: '',
      token: '',
      options4: [],
      upLoadName: '',
      form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        description: '',
        resource: '',
        desc: ''
      },
      taskForm: {
        jobName: '',
        userName: '',
        jobLevel: 1,
        date1: '',
        date2: '',
        value9: [],
        description: '',
        taskUserId: ''
      },
      addPlanPayload: {
        projectUID: '1',
        id: '1',
        name: '',
        start: '',
        finish: '',
        description: '',
        userId: this.$store.state.userId,
        _jfinal_token: '',
        duration: '2'
      },
      moreUserSelectPayload: {
        projectManager: ''
      },
      addTaskPayload: {
        projectUID: '1',
        id: '1',
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
    var that = this
    this.$store.commit('isTabShow', false)
    if (!this.$store.state.userId) {
      this.$store.commit('ddLogin', {recallback: 'false', ddgetcfg: ''})
    }
    // 设置钉钉的标题
    if (dd.version) {
      dd.biz.navigation.setTitle({
        title: '新建',
        onSuccess: function (result) {
          console.log(result)
        },
        onFail: function (errr) {
          console.log(errr)
        }
      })
    }
    this.settoken()
    console.log('proType', that.nodeType)
    console.log('nodeid', that.nodeid)
    console.log('project', that.projectUID)
    if (that.$route.params.proType === '2') {
      that.panshow = true
      that.activeNameBgCover = 'second'
    } else {
      that.panshow = false
      that.activeNameBgCover = 'first'
    }
    this.getPlanTime()
  },
  methods: {
    settoken: function () {
      this.ajax('/app/setToken', {}).then(res => {
        this.token = res._jfinal_token
      })
    },
    getPlanTime: function () {
      var that = this
      this.ajax('/app/getParentTime', {parentId: that.nodeid, type: that.nodeType}).then(res => {
        this.log('getParentTime:', res)
        if (res.code === 200) {
          that.form.date2 = res.data.endDate
          that.taskForm.date2 = res.data.endDate
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
          if (MinutenowF === 60) {
            MinutenowF = '00'
            hoursnow = hoursnow + 1
          }
          // 开始时间戳
          var parentStar = new Date(res.data.startDate.replace(/-/g, '/')).getTime()
          // 结束时间
          var parentEnd = new Date(res.data.endDate.replace(/-/g, '/'))
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
            that.form.date1 = yearnow + '-' + monthnow + '-' + daynow + ' ' + hoursnow + ':' + MinutenowF + ':00'
            that.taskForm.date1 = yearnow + '-' + monthnow + '-' + daynow + ' ' + hoursnow + ':' + MinutenowF + ':00'
          } else {
            that.childStartTime = parentStar
            that.form.date1 = res.data.startDate
            that.taskForm.date1 = res.data.startDate
          }
          // 禁用最小时间
          var nowEndData = new Date(that.childStartTime)
          var yearEnd = nowEndData.getFullYear()
          var monthEnd = (nowEndData.getMonth() + 1) < 10 ? '0' + (nowEndData.getMonth() + 1) : (nowEndData.getMonth() + 1)
          var dayEnd = nowEndData.getDate() < 10 ? '0' + nowEndData.getDate() : nowEndData.getDate()
          var MinuteSt = nowEndData.getMinutes() < 10 ? '0' + nowEndData.getMinutes() : nowEndData.getMinutes()
          var hoursSt = nowEndData.getHours() < 10 ? '0' + nowEndData.getHours() : nowEndData.getHours()
          var resultEnd = yearEnd + '-' + monthEnd + '-' + dayEnd
          var num = Math.ceil(MinuteSt / 10)
          var MinuteStF = num * 10
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
    getPlanStartTime: function () {
      var that = this
      console.log(that.childStartDate, that.endDate)
      that.$vux.datetime.show({
        cancelText: '取消',
        confirmText: '确定',
        value: that.form.date1,
        format: 'YYYY-MM-DD HH:mm',
        minuteList: ['00', '10', '20', '30', '40', '50'],
        startDate: that.childStartDate,
        endDate: that.endDate,
        onConfirm (val) {
          var currentTime = new Date().getTime()
          var maxTime = new Date(that.endDate.replace(/-/g, '/')).getTime()
          var sectTime = new Date(val.replace(/-/g, '/')).getTime()
          if (sectTime > maxTime) {
            that.$message.warning('选择时间应小于上级结束时间')
            that.form.date1 = that.childStartDateShow + ':00'
          } else if (sectTime < currentTime) {
            that.$message.warning('选择时间应大于当前时间')
            that.form.date1 = that.childStartDateShow + ':00'
          } else {
            that.form.date1 = val + ':00'
          }
        }
      })
    },
    getPlanEndTime: function () {
      var that = this
      console.log(that.childStartDate)
      that.$vux.datetime.show({
        cancelText: '取消',
        confirmText: '确定',
        value: that.form.date2,
        format: 'YYYY-MM-DD HH:mm',
        minuteList: ['00', '10', '20', '30', '40', '50'],
        startDate: that.childStartDate,
        endDate: that.endDate,
        onConfirm (val) {
          var currentTime = new Date().getTime()
          var maxTime = new Date(that.endDate.replace(/-/g, '/')).getTime()
          var sectTime = new Date(val.replace(/-/g, '/')).getTime()
          var startTine = new Date(that.form.date1.replace(/-/g, '/')).getTime()
          if (sectTime > maxTime) {
            that.$message.warning('选择时间应小于上级结束时间')
            that.form.date2 = that.resultEShow + ':00'
          } else if (sectTime < startTine) {
            that.$message.warning('选择时间应大于开始时间')
            that.form.date2 = that.resultEShow + ':00'
          } else if (sectTime < currentTime) {
            that.$message.warning('选择时间应大于当前时间')
            that.form.date2 = that.resultEShow + ':00'
          } else {
            that.form.date2 = val + ':00'
          }
        }
      })
    },
    getTaskStartTime: function () {
      var that = this
      console.log(that.childStartDate, that.endDate)
      that.$vux.datetime.show({
        cancelText: '取消',
        confirmText: '确定',
        value: that.taskForm.date1,
        format: 'YYYY-MM-DD HH:mm',
        startDate: that.childStartDate,
        minuteList: ['00', '10', '20', '30', '40', '50'],
        endDate: that.endDate,
        onConfirm (val) {
          var currentTime = new Date().getTime()
          var maxTime = new Date(that.endDate.replace(/-/g, '/')).getTime()
          var sectTime = new Date(val.replace(/-/g, '/')).getTime()
          if (sectTime > maxTime) {
            that.$message.warning('选择时间应小于上级结束时间')
            that.taskForm.date1 = that.childStartDateShow + ':00'
          } else if (sectTime < currentTime) {
            that.$message.warning('选择时间应大于当前时间')
            that.taskForm.date1 = that.childStartDateShow + ':00'
          } else {
            that.taskForm.date1 = val + ':00'
          }
        }
      })
    },
    getTaskEndTime: function () {
      var that = this
      console.log(that.childStartDate)
      that.$vux.datetime.show({
        cancelText: '取消',
        confirmText: '确定',
        value: that.taskForm.date2,
        format: 'YYYY-MM-DD HH:mm',
        startDate: that.childStartDate,
        minuteList: ['00', '10', '20', '30', '40', '50'],
        endDate: that.endDate,
        onConfirm (val) {
          var currentTime = new Date().getTime()
          var maxTime = new Date(that.endDate.replace(/-/g, '/')).getTime()
          var sectTime = new Date(val.replace(/-/g, '/')).getTime()
          var startTine = new Date(that.form.date1.replace(/-/g, '/')).getTime()
          if (sectTime > maxTime) {
            that.$message.warning('选择时间应小于上级结束时间')
            that.taskForm.date2 = that.resultEShow + ':00'
          } else if (sectTime < startTine) {
            that.$message.warning('选择时间应大于开始时间')
            that.taskForm.date2 = that.resultEShow + ':00'
          } else if (sectTime < currentTime) {
            that.$message.warning('选择时间应大于当前时间')
            that.taskForm.date2 = that.resultEShow + ':00'
          } else {
            that.taskForm.date2 = val + ':00'
          }
        }
      })
    },
    rateChange: function (rateval) {
      this.addTaskPayload.jobLevel = rateval
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
    onPlanSubmit (formName) {
      var that = this
      this.$refs[formName].validate((valid) => {
        if (valid) {
          that.loading = true
          that.addPlanPayload.id = that.nodeid
          that.addPlanPayload.projectUID = that.projectUID
          that.addPlanPayload.name = this.form.name
          that.addPlanPayload.start = this.form.date1
          that.addPlanPayload.finish = this.form.date2
          that.addPlanPayload.description = this.form.description
          that.addPlanPayload._jfinal_token = this.token
          that.ajax('/app/addPlan', that.addPlanPayload).then(res => {
            // console.log('addplan:', res)
            if (res.code === 200) {
              that.token = res._jfinal_token
              that.loading = false
              that.$message.success('添加成功')
              that.form.name = ''
              that.form.description = ''
            } else {
              that.loading = false
            }
          })
        }
      })
    },
    onPlanCancel () {
      var that = this
      that.form.name = ''
      that.form.description = ''
      // that.isDisabled = false
      // that.bgCoverShow = false
      // that.formDataClear()
    },
    onTaskCancel: function () {
      var that = this
      that.taskForm.jobName = ''
      $('#myfile').val('')
      that.taskForm.description = ''
    },
    onTaskSubmit: function (taskForm) {
      var that = this
      var fileV = $('#myfile').val()
      that.$refs[taskForm].validate((valid) => {
        if (valid) {
          that.user = ''
          for (var i = 0; i < that.taskForm.value9.length; i++) {
            var lian = i === (that.taskForm.value9.length - 1) ? '' : '_'
            that.user = that.user + that.taskForm.value9[i].split('_')[0] + '-' + that.taskForm.value9[i].split('_')[1] + lian
          }
          that.loading = true
          that.addTaskPayload.users = that.user
          that.addTaskPayload.id = that.nodeid
          that.addTaskPayload.projectUID = that.projectUID
          that.addTaskPayload.jobName = that.taskForm.jobName
          that.addTaskPayload.taskStartDate = that.taskForm.date1
          that.addTaskPayload.taskFinishDate = that.taskForm.date2
          that.addTaskPayload.description = that.taskForm.description
          that.addTaskPayload._jfinal_token = that.token
          that.addTaskPayload.formId = that.formId
          that.ajax('/app/addTask', that.addTaskPayload).then(res => {
            if (res.code === 200) {
              that.formId = res.formId
              that.token = res._jfinal_token
              if (!fileV) {
                that.$message.success('创建成功')
                that.loading = false
                that.formId = ''
                that.taskForm.jobName = ''
                $('#myfile').val('')
                that.taskForm.description = ''
                // that.formDataClear()
                // that.queryManagePlan5()
              } else {
                that.delayfuc()
              }
            } else {
              that.loading = false
            }
          })
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
      var fileV = $('#myfile').val()
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
            that.formId = ''
            that.loading = false
            that.taskForm.jobName = ''
            $('#myfile').val('')
            that.taskForm.description = ''
          } else if (data.code === 300) {
            that.$confirm('是否重新上传附件?', '文件上传失败', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              that.loading = false
              that.taskForm.jobName = ''
              $('#myfile').val('')
              that.taskForm.description = ''
            }).catch(() => {
              that.formId = ''
              that.loading = false
              that.taskForm.jobName = ''
              $('#myfile').val('')
              that.taskForm.description = ''
            })
          }
          console.log(data)
        })
      }
    }
  }
}
</script>

<style scoped>
  .planTaskBox{
    padding: 40px 20px;
  }
</style>
