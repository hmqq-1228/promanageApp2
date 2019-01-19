<template>
  <div class="planTaskBox" style="position: relative;padding: 10px;background-color: #fff;margin-top: 20px;" v-loading="loading">
    <el-form ref="taskForm" :rules="rules" :model="taskForm" label-width="80px">
      <el-form-item label="问题标题" prop="jobName" maxlength="100" width="100">
        <el-input class="planNameIpt" v-model="taskForm.jobName" v-bind:disabled="isDisabled" placeholder="请输入问题标题"></el-input>
      </el-form-item>
      <el-form-item label="紧急程度" prop="jobLevel" maxlength="100" width="100">
        <div class="ratestar" style="padding-top: 10px;">
          <el-rate v-model="taskForm.jobLevel" v-on:change="rateChange($event)" v-bind:disabled="isDisabled"></el-rate>
        </div>
      </el-form-item>
      <el-form-item label="解决人员" prop="state2" maxlength="100" width="100">
        <!--<el-input class="planNameIpt" v-model="taskForm.userName"></el-input>-->
        <el-col style="width: 100%">
          <el-autocomplete
            style="width: 100%"
            v-bind:disabled="isDisabled"
            class="inline-input"
            v-model="taskForm.state2"
            :fetch-suggestions="querySearch"
            placeholder="请搜索问题解决人员"
            :trigger-on-focus="false"
            @select="handleSelectUser"
          ></el-autocomplete>
        </el-col>
      </el-form-item>
      <!--<el-form-item label="开始时间" prop="date1">-->
        <!--<el-col>-->
          <!--<el-date-picker style="width: 100%" type="datetime" v-bind:disabled="isDisabled" :picker-options="pickerOptions0" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择日期" v-model="taskForm.date1">-->
          <!--</el-date-picker>-->
        <!--</el-col>-->
      <!--</el-form-item>-->
      <el-form-item label="预计完成" prop="date2">
        <el-col>
          <el-date-picker style="width: 100%" type="datetime" v-bind:disabled="isDisabled" :picker-options="pickerOptions0" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择完成日期" v-model="taskForm.date2"></el-date-picker>
        </el-col>
      </el-form-item>
      <el-form-item label="问题描述" prop="description" maxlength="100" width="100">
        <el-input class="planNameIpt" v-bind:disabled="isDisabled" type="textarea" :rows="4" v-model="taskForm.description" placeholder="请输入问题详情"></el-input>
      </el-form-item>
      <el-form-item style="height: 50px;"></el-form-item>
      <div style="text-align: center">
        <el-button type="primary" @click="onTaskSubmit('taskForm')">立即发起</el-button>
        <el-button @click="onPlanTaskCancel()">取消</el-button>
      </div>
    </el-form>
    <form id="mytaskForm" enctype="multipart/form-data" style="position: absolute;bottom:70px;padding-left: 12px;">
      <div style="font-size: 14px;color: #555;height: 30px;line-height: 30px;display: inline-block;">添加附件</div>&nbsp;&nbsp;
      <input type="file" id="myfile" name="myfile" placeholder="请选择文件" style="width: 200px;"/>
      <input type="hidden" name="formId" v-bind:value="formId">
      <!--<el-button style="background-color: #409EFF;color: #fff;border: none;border-radius: 4px;padding: 4px;" @click="uploadFile()">立即上传</el-button>-->
      <div style="padding-left: 70px;font-size: 12px;height: 16px;color: #409eff">{{upLoadName}}</div>
    </form>
  </div>
</template>

<script>
import dd from '../../static/dingtalk/dingtalk'
export default {
  name: 'addNewTaskOther',
  data () {
    return {
      isDisabled: false,
      formId: '',
      upLoadName: '',
      loading: false,
      taskForm: {
        jobName: '',
        userName: '',
        jobLevel: 1,
        date1: '',
        date2: '',
        state2: '',
        description: '',
        taskUserId: ''
      },
      autoCompleteAddTaskPayload: {
        projectManager: '',
        userId: this.$store.state.userId
      },
      addTaskPayload: {
        projectUID: this.$store.state.projectUID,
        planId: this.$store.state.planId,
        id: '1',
        formId: '',
        jobName: '',
        jobLevel: 1,
        taskStartDate: '',
        taskFinishDate: '',
        loginUserId: this.$store.state.userId,
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
        state2: [
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
        ],
        description: [
          { required: true, message: '请填写项目介绍', trigger: 'blur' }
        ]
      },
      pickerOptions0: {
        canSee: 'CanSee',
        canEdit: 'CanEdit'
      }
    }
  },
  created: function () {
    this.$store.commit('isTabShow', false)
    // 设置标题
    if (dd.version) {
      dd.biz.navigation.setTitle({
        title: '提出问题',
        onSuccess: function (result) {
          console.log(result)
        },
        onFail: function (errr) {
          console.log(errr)
        }
      })
    }
  },
  methods: {
    rateChange: function (rateval) {
      this.addTaskPayload.jobLevel = rateval
    },
    querySearch (queryString, cb) {
      var that = this
      if (queryString) {
        that.autoCompleteAddTaskPayload.projectManager = queryString
        this.ajax('/app/autoCompleteNames', that.autoCompleteAddTaskPayload).then(res => {
          // console.log('autoCompleteNames:', res)
          if (res.code === 200) {
            var dddarr = []
            if (res.msg.length > 0) {
              for (var i = 0; i < res.msg.length; i++) {
                var obj = {}
                obj.value = res.msg[i].Name + ' (' + res.msg[i].jName + ')'
                obj.userId = res.msg[i].ID
                obj.position = res.msg[i].jName
                dddarr.push(obj)
              }
              // 调用 callback 返回建议列表的数据
              cb(dddarr)
            } else {
              var aaaddd = []
              that.$message('未能搜索到该人员')
              cb(aaaddd)
            }
          }
        })
      }
    },
    handleSelectUser (item) {
      this.addTaskPayload.userIdTransfer = item.userId
      this.addTaskPayload.userNameTransfer = item.value
      console.log(item.userId)
      console.log(this.addTaskPayload)
    },
    onTaskSubmit: function (taskForm) {
      var that = this
      var fileV = $('#myfile').val()
      that.$refs[taskForm].validate((valid) => {
        if (valid) {
          that.loading = true
          this.addTaskPayload.jobName = this.taskForm.jobName
          this.addTaskPayload.taskStartDate = this.taskForm.date1
          this.addTaskPayload.taskFinishDate = this.taskForm.date2
          this.addTaskPayload.description = this.taskForm.description
          this.addTaskPayload._jfinal_token = this.token
          this.addTaskPayload.formId = this.formId
          this.ajax('/app/addTaskSingle', that.addTaskPayload).then(res => {
            if (res.code === 200) {
              console.log('addTaskSingle', res)
              that.formId = res.formId
              that.token = res._jfinal_token
              if (!fileV) {
                that.loading = false
                that.formId = ''
                that.bgCoverShow = false
                that.formDataClear()
                that.$router.push('/addTaskOtherList')
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
          url: url + '/file/uploadFile',
          data: formData,
          cache: false,
          processData: false,
          contentType: false,
          crossDomain: true,
          xhrFields: {
            withCredentials: true
          }
        }).then(function (data) {
          console.log('uploadFile:', data)
          if (data.code === 200) {
            that.$message({
              type: 'success',
              message: data.msg
            })
            that.formId = ''
            that.bgCoverShow = false
            that.isDisabled = false
            that.loading = false
            that.formDataClear()
            that.$router.push('/addTaskOtherList')
          } else if (data.code === 300) {
            that.$confirm('是否重新上传附件?', '文件上传失败', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              that.isDisabled = true
              that.loading = false
              that.bgCoverShow = true
            }).catch(() => {
              that.formId = ''
              that.bgCoverShow = false
              that.loading = false
              that.formDataClear()
            })
          }
          console.log(data)
        })
      }
    },
    formDataClear: function () {
      this.taskForm.state2 = ''
      this.taskForm.jobName = ''
      this.taskForm.date1 = ''
      this.taskForm.date2 = ''
      this.taskForm.description = ''
      this.taskForm.jobLevel = 0
      this.upLoadName = ''
    },
    onPlanTaskCancel () {
      var that = this
      that.isDisabled = false
      that.formDataClear()
    }
  }
}
</script>

<style scoped>

</style>
