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
          <div class="selectData" @click="selectProjectStartData">{{ruleForm.value1}}</div>
          <!--<el-input v-model="ruleForm.value1" placeholder="请选择项目开始时间" @focus="selectProjectStartData"></el-input>-->
        </el-form-item>
        <el-form-item label="结束时间" prop="value2">
          <div class="selectData" @click="selectProjectEndData">{{ruleForm.value2}}</div>
          <!--<el-input v-model="ruleForm.value2" placeholder="请选择项目结束时间" @focus="selectProjectEndData"></el-input>-->
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
          <el-input type="textarea" v-model="ruleForm.introduction"></el-input>
        </el-form-item>
        <el-form-item label="项目附件" v-if="ruleForm.showName">
          <div v-if="!ruleForm.showName" style="color: #999;font-size: 12px;">暂无附件</div>
          <div v-if="ruleForm.showName">
            <a v-bind:href="ruleForm.downloadUrl" download="项目附件">{{ruleForm.showName}}
              <i style="font-weight: bold !important; padding: 5px; color: chocolate;" class="el-icon-download"></i>
            </a>
          </div>
        </el-form-item>
        <el-form-item label="添加附件" style="height: 40px; clear: both;">
          <form id="myPlanForm" enctype="multipart/form-data" v-if="!ruleForm.showName">
            <!--<div style="font-size: 14px;color: #555;height: 30px;line-height: 30px;display: inline-block;">添加附件</div>&nbsp;&nbsp;-->
            <input type="file" id="myfile" name="myfile" placeholder="请选择文件" style="width: 200px;"/>
            <input type="hidden" name="formId" v-bind:value="projectUID">
            <el-button v-if="btnShow" style="background-color: #409EFF;color: #fff;border: none;border-radius: 4px;padding: 4px;" @click="uploadFileMsg()">立即上传</el-button>
            <div style="padding-left: 70px;font-size: 12px;height: 16px;color: #409eff">{{upLoadName}}</div>
          </form>
        </el-form-item>
        <el-form-item style="margin-top: 30px;">
          <el-button type="primary" @click="submitForm('ruleForm')">立即创建</el-button>
          <el-button @click="resetForm('ruleForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import dd from '../../static/dingtalk/dingtalk'
export default {
  name: 'addNewProject',
  props: ['proID'],
  data () {
    return {
      upLoadName: '',
      token: '',
      loading: false,
      Mid: '',
      minHour: '',
      nowMinte: '',
      startTimeNow: '',
      startDateTime: '',
      btnShow: false,
      projectUID: '',
      ruleForm: {
        projectName: '',
        projectManager: '',
        delivery: false,
        projectType: '公司项目',
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
      // pickerOptions0: {
      //   disabledDate (time) {
      //     return time.getTime() < Date.now() - 8.64e7
      //   }
      // },
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
    this.getNowDataTime()
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
    this.getUserInfo()
  },
  methods: {
    settoken: function () {
      this.ajax('/app/setToken', {}).then(res => {
        this.token = res._jfinal_token
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
      that.startDateTime = startDay
      that.minHour = starHours
      that.ruleForm.value1 = that.startTimeNow
      var getTime = new Date().getTime()
      var addTime = 24 * 60 * 60 * 30 * 3 * 1000
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
      that.ruleForm.value2 = lastTime
    },
    selectProjectStartData: function () {
      var that = this
      that.$vux.datetime.show({
        cancelText: '取消',
        confirmText: '确定',
        value: that.ruleForm.value1,
        format: 'YYYY-MM-DD HH:mm',
        startDate: that.startDateTime,
        minuteList: ['00', '10', '20', '30', '40', '50'],
        onConfirm (val) {
          console.log('plugin confirm', val)
          var nowBinTime = new Date(that.nowMinte.replace(/-/g, '/')).getTime()
          var getSelectTime = new Date(val.replace(/-/g, '/')).getTime()
          if (getSelectTime < nowBinTime) {
            that.$message.warning('时间应大于当前时间')
            that.ruleForm.value1 = that.startTimeNow
          } else {
            that.ruleForm.value1 = val
          }
          // that.year = val.split('-')[0]
          // that.month = val.split('-')[1]
          var getTime = new Date(that.ruleForm.value1.replace(/-/g, '/')).getTime()
          var addTime = 24 * 60 * 60 * 30 * 3 * 1000
          var endTime = getTime + addTime
          var nowEndData = new Date(endTime)
          var yearEnd = nowEndData.getFullYear()
          var monthEnd = (nowEndData.getMonth() + 1) < 10 ? '0' + (nowEndData.getMonth() + 1) : (nowEndData.getMonth() + 1)
          var dayEnd = nowEndData.getDate() < 10 ? '0' + nowEndData.getDate() : nowEndData.getDate()
          var dayHours = nowEndData.getHours() < 10 ? '0' + nowEndData.getHours() : nowEndData.getHours()
          var dayMinte = nowEndData.getMinutes() < 10 ? '0' + nowEndData.getMinutes() : nowEndData.getMinutes()
          // var daySecond = nowEndData.getSeconds() < 10 ? '0' + nowEndData.getSeconds() : nowEndData.getSeconds()
          var lastTime = yearEnd + '-' + monthEnd + '-' + dayEnd + ' ' + dayHours + ':' + dayMinte
          that.ruleForm.value2 = lastTime
        }
      })
    },
    selectProjectEndData: function () {
      var that = this
      that.$vux.datetime.show({
        cancelText: '取消',
        confirmText: '确定',
        value: that.ruleForm.value2,
        format: 'YYYY-MM-DD HH:mm',
        startDate: that.startDateTime,
        minuteList: ['00', '10', '20', '30', '40', '50'],
        onConfirm (val) {
          console.log('plugin confirm', val)
          var nowBinTime = new Date(that.ruleForm.value1.replace(/-/g, '/')).getTime()
          var getSelectTime = new Date(val.replace(/-/g, '/')).getTime()
          console.log(nowBinTime, getSelectTime)
          if (getSelectTime < nowBinTime) {
            that.$message.warning('结束时间应大于开始时间')
            that.ruleForm.value2 = that.ruleForm.value1
          } else {
            that.ruleForm.value2 = val
          }
          // that.year = val.split('-')[0]
          // // that.month = val.split('-')[1]
          // var getTime = new Date(that.ruleForm.value1.replace(/-/g, '/')).getTime()
          // var addTime = 24 * 60 * 60 * 30 * 3 * 1000
          // var endTime = getTime + addTime
          // var nowEndData = new Date(endTime)
          // var yearEnd = nowEndData.getFullYear()
          // var monthEnd = (nowEndData.getMonth() + 1) < 10 ? '0' + (nowEndData.getMonth() + 1) : (nowEndData.getMonth() + 1)
          // var dayEnd = nowEndData.getDate() < 10 ? '0' + nowEndData.getDate() : nowEndData.getDate()
          // var dayHours = nowEndData.getHours() < 10 ? '0' + nowEndData.getHours() : nowEndData.getHours()
          // var dayMinte = nowEndData.getMinutes() < 10 ? '0' + nowEndData.getMinutes() : nowEndData.getMinutes()
          // // var daySecond = nowEndData.getSeconds() < 10 ? '0' + nowEndData.getSeconds() : nowEndData.getSeconds()
          // var lastTime = yearEnd + '-' + monthEnd + '-' + dayEnd + ' ' + dayHours + ':' + dayMinte
          // that.ruleForm.value2 = lastTime
        }
      })
    },
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
            that.ajax('/app/addBaseInfo',
              {
                projectManagerID: that.Mid,
                projectUID: that.projectUID || that.proID,
                projectName: this.ruleForm.projectName,
                projectType: this.ruleForm.projectType,
                startDate: this.ruleForm.value1 + ':00',
                endDate: this.ruleForm.value2 + ':00',
                projectManager: this.ruleForm.projectManager,
                introduction: this.ruleForm.introduction,
                _jfinal_token: this.token
              }).then(res => {
              // console.log('立即创建:', res)
              if (res.code === 200) {
                that.token = res._jfinal_token
                that.projectUID = res.projectUID
                if (!fileV) {
                  that.loading = false
                  if (that.projectUID) {
                    that.$router.push('/projectDetailPage/' + that.projectUID)
                    that.$store.commit('currentTabSet', 'ProDetailMember')
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
              that.$store.commit('currentTabSet', 'ProDetailMember')
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
                that.$store.commit('currentTabSet', 'ProDetailMember')
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
