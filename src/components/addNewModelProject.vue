<template>
  <div>
    <!--<div>这个是NewAddBase</div>-->
    <div class="projectBase" v-loading="loading">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="ruleForm.projectName" placeholder="请输入项目名称"></el-input>
        </el-form-item>
        <el-form-item label="项目类型" prop="projectType">
          <!--<el-input v-model="ruleForm.projectType"></el-input>-->
          <el-select v-model="ruleForm.projectType" placeholder="请选择项目类型">
            <el-option label="集团战略" value="集团战略"></el-option>
            <el-option label="公司项目" value="公司项目"></el-option>
            <el-option label="部门项目" value="部门项目"></el-option>
            <el-option label="小组项目" value="小组项目"></el-option>
            <el-option label="个人项目" value="个人项目"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="value1">
          <div class="selectData" @click="modelProjectStartData">{{ruleForm.value1}}</div>
        </el-form-item>
        <el-form-item label="结束时间" prop="value2">
          <div class="selectData" @click="modelProjectEndData">{{ruleForm.value2}}</div>
        </el-form-item>
        <el-form-item label="项目负责人" prop="projectManager">
          <el-autocomplete style="width: 100%"
                           v-model="ruleForm.projectManager"
                           :fetch-suggestions="querySearchAsync"
                           placeholder="请输入项目经理姓名"
                           :trigger-on-focus="false"
                           @select="handleSelect"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item class="proIntroduce" label="项目简介" prop="introduction" style="clear: both;">
          <el-input style="font-size: 12px;" type="textarea" v-model="ruleForm.introduction"></el-input>
        </el-form-item>
        <el-form-item label="项目附件" v-if="ruleForm.showName">
          <div v-if="!ruleForm.showName" style="color: #999;font-size: 12px;">暂无附件</div>
          <div v-if="ruleForm.showName">
            <a v-bind:href="ruleForm.downloadUrl" download="项目附件">{{ruleForm.showName}}
              <i style="font-weight: bold !important; padding: 5px; color: chocolate;" class="el-icon-download"></i>
            </a>
          </div>
          <!--<div style="color:#409EFF" v-on:click="downFuc($event)" v-bind:data-showname="ruleForm.showName" v-bind:data-realurl="ruleForm.realUrl">-->
          <!--{{ruleForm.showName}}<i style="font-weight: bold; padding: 5px;" class="el-icon-download"></i>-->
          <!--</div>-->
        </el-form-item>
        <el-form-item style="height: 40px; clear: both;">
        </el-form-item>
        <el-form-item style="margin-top: 30px;">
          <el-button type="primary" @click="submitForm('ruleForm')">立即创建</el-button>
          <el-button @click="resetForm('ruleForm')">重置</el-button>
        </el-form-item>
      </el-form>
      <form id="myPlanForm" enctype="multipart/form-data" style="position: absolute;bottom:90px;padding-left: 30px;" v-if="!ruleForm.showName">
        <div style="font-size: 14px;color: #555;height: 30px;line-height: 30px;display: inline-block;">添加附件</div>&nbsp;&nbsp;
        <input type="file" id="myfile" name="myfile" placeholder="请选择文件" style="width: 240px;"/>
        <input type="hidden" name="formId" v-bind:value="projectUID">
        <el-button v-if="btnShow" style="background-color: #409EFF;color: #fff;border: none;border-radius: 4px;padding: 4px;" @click="uploadFileMsg()">立即上传</el-button>
        <div style="padding-left: 70px;font-size: 12px;height: 16px;color: #409eff">{{upLoadName}}</div>
      </form>
    </div>
  </div>
</template>

<script>
import dd from '../../static/dingtalk/dingtalk'
export default {
  name: 'addNewModelProject',
  props: ['proID'],
  data () {
    return {
      upLoadName: '',
      token: '',
      loading: false,
      Mid: '',
      modelId: this.$route.params.mId,
      btnShow: false,
      duration: 0,
      startDateTime: '',
      projectUID: '',
      ruleForm: {
        projectName: '',
        projectManager: '',
        delivery: false,
        projectType: '',
        showName: '',
        downloadUrl: '',
        previewUrl: '',
        resource: '',
        realUrl: '',
        position: '',
        introduction: '',
        value2: '',
        value1: ''
      },
      rules: {
        projectName: [
          { required: true, message: '请输入项目名称', trigger: 'blur' }
        ],
        projectType: [
          { required: true, message: '请输入项目类型', trigger: 'change' }
        ],
        value1: [
          { required: true, message: '请选择日期', trigger: 'change' }
        ],
        value2: [
          { required: true, message: '请选择日期', trigger: 'change' }
        ],
        projectManager: [
          { required: true, message: '请输入项目经理', trigger: 'change' }
        ]
      },
      pickerOptions0: {
        disabledDate (time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      },
      pickerOptions1: {},
      autoCompleteNamesPayload: {
        projectManager: ''
      }
    }
  },
  created () {
    this.$store.commit('isTabShow', false)
    if (!this.$store.state.userId) {
      this.$store.commit('ddLogin', {recallback: 'false', ddgetcfg: ''})
    }
    this.settoken()
    this.getModelDetail()
    this.getUserInfo()
    if (this.proID) {
      console.log(1111)
      this.getProMsg()
    } else {
      console.log(2222)
    }
    // 设置钉钉的标题
    if (dd.version) {
      dd.biz.navigation.setTitle({
        title: '新建项目',
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
    settoken: function () {
      this.ajax('/app/setToken', {}).then(res => {
        this.token = res._jfinal_token
      })
    },
    // 查询模板信息
    getModelDetail: function () {
      var that = this
      this.ajax('/appmodel/getModelDetail', {modelId: that.modelId}).then(res => {
        if (res.code === 200) {
          console.log('getModelDetail', res)
          that.duration = res.data.duration
          that.ruleForm.projectType = res.data.modelType
          console.log('that.duration', that.duration)
          that.getDefultTime()
        }
      })
    },
    getUserInfo: function () {
      var that = this
      this.ajax('/app/getUserInfo', {}).then(res => {
        if (res.code === 200) {
          console.log('getUserInfo', res)
          that.ruleForm.projectManager = res.data.Name + ' (' + res.data.jName + ')'
          that.Mid = res.data.ID
        }
      })
    },
    getDefultTime () {
      var dayNum = this.duration
      var n = parseInt(dayNum)
      var nowData = new Date()
      var year = nowData.getFullYear()
      var month = (nowData.getMonth() + 1) < 10 ? '0' + (nowData.getMonth() + 1) : (nowData.getMonth() + 1)
      var day = nowData.getDate() < 10 ? '0' + nowData.getDate() : nowData.getDate()
      var result = year + '-' + month + '-' + day
      this.startDateTime = result
      console.log('nowData', result)
      var getTime = new Date().getTime()
      var addTime = 24 * 60 * 60 * n * 1000
      var endTime = getTime + addTime
      var nowEndData = new Date(endTime)
      var yearEnd = nowEndData.getFullYear()
      var monthEnd = (nowEndData.getMonth() + 1) < 10 ? '0' + (nowEndData.getMonth() + 1) : (nowEndData.getMonth() + 1)
      var dayEnd = nowEndData.getDate() < 10 ? '0' + nowEndData.getDate() : nowEndData.getDate()
      var resultEnd = yearEnd + '-' + monthEnd + '-' + dayEnd
      console.log('getTime', nowEndData)
      this.ruleForm.value1 = result
      this.ruleForm.value2 = resultEnd
    },
    modelProjectStartData: function () {
      var that = this
      console.log(that.startDateTime)
      that.$vux.datetime.show({
        cancelText: '取消',
        confirmText: '确定',
        value: that.ruleForm.value1,
        format: 'YYYY-MM-DD',
        startDate: that.startDateTime,
        onConfirm (val) {
          that.ruleForm.value1 = val
          var dayNum = that.duration
          var n = parseInt(dayNum)
          console.log('n', dayNum)
          var getTime = new Date(that.ruleForm.value1.replace(/-/g, '/')).getTime()
          var addTime = 24 * 60 * 60 * n * 1000
          var endTime = getTime + addTime
          var nowEndData = new Date(endTime)
          var yearEnd = nowEndData.getFullYear()
          var monthEnd = (nowEndData.getMonth() + 1) < 10 ? '0' + (nowEndData.getMonth() + 1) : (nowEndData.getMonth() + 1)
          var dayEnd = nowEndData.getDate() < 10 ? '0' + nowEndData.getDate() : nowEndData.getDate()
          var resultEnd = yearEnd + '-' + monthEnd + '-' + dayEnd
          console.log('resultEnd', resultEnd)
          that.ruleForm.value2 = resultEnd
        }
      })
    },
    modelProjectEndData: function () {
      var that = this
      console.log(that.startDateTime)
      that.$vux.datetime.show({
        cancelText: '取消',
        confirmText: '确定',
        value: that.ruleForm.value2,
        format: 'YYYY-MM-DD',
        startDate: that.ruleForm.value1,
        onConfirm (val) {
          that.ruleForm.value2 = val
          // var dayNum = this.duration
          // var n = parseInt(dayNum)
          // var getTime = new Date(that.ruleForm.value1.replace(/-/g, '/')).getTime()
          // var addTime = 24 * 60 * 60 * n * 1000
          // var endTime = getTime + addTime
          // var nowEndData = new Date(endTime)
          // var yearEnd = nowEndData.getFullYear()
          // var monthEnd = (nowEndData.getMonth() + 1) < 10 ? '0' + (nowEndData.getMonth() + 1) : (nowEndData.getMonth() + 1)
          // var dayEnd = nowEndData.getDate() < 10 ? '0' + nowEndData.getDate() : nowEndData.getDate()
          // var resultEnd = yearEnd + '-' + monthEnd + '-' + dayEnd
          // that.ruleForm.value2 = resultEnd
        }
      })
    },
    // getEndTime: function () {
    //   console.log('bbb')
    //   var sT = this.ruleForm.value1 + ' 00:00:00'
    //   var stTime = new Date(sT)
    //   var disTime = stTime.getTime()
    //   this.pickerOptions1.disabledDate = function (time) {
    //     return time.getTime() < disTime
    //   }
    // },
    // 查询基本信息
    getProMsg () {
      var that = this
      this.ajax('/app/getProjectDetail', {projectUID: that.proID}).then(res => {
        if (res.code === 200) {
          var downurl = that.$store.state.baseServiceUrl + '/file/downloadFile?realUrl=' + res.msg.realUrl + '&showName=' + res.msg.showName
          that.ruleForm.projectName = res.msg.projectName
          that.ruleForm.projectType = res.msg.projectType
          that.ruleForm.value2 = []
          that.ruleForm.value1 = res.msg.startDate
          that.ruleForm.value2 = res.msg.endDate
          that.ruleForm.showName = res.msg.showName
          that.ruleForm.realUrl = res.msg.realUrl
          that.ruleForm.downloadUrl = downurl
          that.position = res.msg.position
          that.Mid = res.msg.projectManagerID
          that.ruleForm.projectManager = res.msg.projectManager + ' (' + res.msg.position + ')'
          that.ruleForm.introduction = res.msg.content
          console.log('getProMsg:', that.ruleForm.value2)
        }
      })
    },
    querySearchAsync (queryString, cb) {
      var that = this
      if (queryString) {
        that.autoCompleteNamesPayload.projectManager = queryString
        this.ajax('/app/autoCompleteNames', that.autoCompleteNamesPayload).then(res => {
          // console.log('search:', res)
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
              that.$message('未能搜索到该人员')
              cb(aaaddd)
            }
          }
        })
      }
    },
    handleSelect (item) {
      // console.log(item.userId)
      this.Mid = item.userId
    },
    // 立即创建 提交基本信息
    submitForm (formName) {
      var that = this
      var fileV = $('#myfile').val()
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (that.Mid) {
            that.loading = true
            that.ajax('/appmodel/addProject',
              {
                projectManagerID: that.Mid,
                modelId: that.modelId,
                projectName: this.ruleForm.projectName,
                projectType: this.ruleForm.projectType,
                startDate: this.ruleForm.value1,
                endDate: this.ruleForm.value2,
                projectManager: this.ruleForm.projectManager,
                introduction: this.ruleForm.introduction,
                _jfinal_token: this.token
              }).then(res => {
              // console.log('立即创建:', res)
              if (res.code === 200) {
                that.token = res._jfinal_token
                that.projectUID = res.data
                if (!fileV) {
                  that.loading = false
                  if (that.projectUID) {
                    that.$router.push('/projectDetailPage/' + that.projectUID)
                    that.$store.commit('currentTabSet', 'ProDetailPlanManage')
                  }
                } else {
                  that.delayfuc()
                }
              } else {
                this.$message({
                  type: 'error',
                  message: res.msg
                })
                that.loading = false
              }
            })
          } else {
            that.loading = false
            that.$message.error('请重新选择项目负责人')
          }
        } else {
          // console.log('网络错误!!')
          that.loading = false
          return false
        }
      })
    },
    // 重置 基本信息表单重置按钮
    resetForm (formName) {
      this.$refs[formName].resetFields()
    },
    delayfuc () {
      var that = this
      setTimeout(function () {
        that.uploadFileMsg()
      }, 1000)
    },
    // 上传附件
    uploadFileMsg () {
      var that = this
      // console.log('formId', that.projectUID)
      var formData = new FormData($('#myPlanForm')[0])
      var fileV = $('#myfile').val()
      if (!fileV) {
        that.$message({
          type: 'error',
          message: '请选择上传文件！'
        })
      } else {
        var url = that.$store.state.baseServiceUrl
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
          if (data.code === 200) {
            that.$message({
              type: 'success',
              message: data.msg
            })
            that.upLoadName = data.data.showName
            that.loading = false
            if (that.projectUID) {
              that.$router.push('/projectDetailPage/' + that.projectUID)
              that.$store.commit('currentTabSet', 'ProDetailPlanManage')
            }
          } else if (data.code === 300) {
            that.$message({
              type: 'error',
              message: data.msg
            })
            // that.btnShow = true
            that.$confirm('是否重新上传附件?', '文件上传失败', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              // that.isDisabled = true
              that.loading = false
              // that.bgCoverShow = true
            }).catch(() => {
              that.loading = false
              if (that.projectUID) {
                that.$router.push('/projectDetailPage/' + that.projectUID)
                that.$store.commit('currentTabSet', 'ProDetailPlanManage')
              }
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
  .projectBase{
    padding: 20px;
    position: relative;
    background-color: #fff;
    margin-top: 20px;
    padding-left: 0;
  }
  .el-form-item--mini.el-form-item, .el-form-item--small.el-form-item{
    width: 440px;
    float: left;
  }
  .el-form-item--mini.el-form-item, .el-form-item--small.el-form-item{
    margin-bottom: 30px;
  }
  .el-select{
    width: 100%;
  }
</style>
