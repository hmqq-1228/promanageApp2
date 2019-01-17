<template>
  <div style="overflow: hidden;" v-loading="Uloading">
    <group title="日程详情">
      <div class="scheduleItem" style="border-top: 1px solid #D9D9D9;">
        <x-input title="项目名称" :disabled="isDisabled" required placeholder-align="right" text-align="right" v-model="value2" placeholder="请填写项目名称" :is-type="nameType" :show-clear="true" ref="refcode" @on-change="keyDown"></x-input>
      </div>
      <div class="scheduleItem">
        <datetime v-model="startTimeValve" :readonly="isDisabled" :start-date="startDate" required format="YYYY-MM-DD HH:mm" :minute-list="['00', '10', '20', '30',  '40',  '50']" @on-change="change" title="开始时间"></datetime>
      </div>
      <div class="scheduleItem">
        <datetime v-model="endTimeValve" :readonly="isDisabled" required format="YYYY-MM-DD HH:mm" :minute-list="['00', '10', '20', '30',  '40',  '50']" title="结束时间"></datetime>
      </div>
      <div class="scheduleItem">
        <selector title="提醒时间" :readonly="isDisabled" @on-change="getNoteTime" :options="list" direction="rtl" v-model="defaultValue"></selector>
      </div>
      <div style="width:80%;margin: 50px auto;">
        <x-button type="primary" @click.native="editSchedule" v-if="showButton" :disabled="disabled">修改日程</x-button>
        <div v-if="!showButton" style="text-align: center;display: flex;justify-content: center;">
          <el-button style="margin-right: 20px;" :disabled="disabled" @click="cancelEdit">取消修改</el-button>
          <el-button :disabled="disabled" type="primary" @click="scheduleUpdateSub">立即修改</el-button>
        </div>
        <!--<x-button type="primary" @click.native="scheduleFormSub"  :disabled="disabled">立即修改</x-button>-->
      </div>
    </group>
  </div>
</template>

<script>
import dd from '../../static/dingtalk/dingtalk'
export default {
  name: 'scheduleDetail',
  data () {
    return {
      iconType: '',
      Uloading: false,
      disabled: true,
      showButton: true,
      isDisabled: true,
      startTimeValve: '2018-12-12 09:00',
      startDate: '2018-12-12',
      endTimeValve: '2019-01-08 18:00',
      defaultValue: '0',
      schId: this.$route.params.sId,
      minHour: 0,
      list: [
        {key: '0', value: '不提醒'},
        {key: '5', value: '开始前5分钟'},
        {key: '15', value: '开始前15分钟'},
        {key: '30', value: '开始前30分钟'},
        {key: '60', value: '开始前1小时'},
        {key: '1440', value: '开始前1天'},
        {key: '10080', value: '开始前1周'}],
      value2: '',
      nameType: function (value) {
        return {
          valid: value.length >= 1,
          msg: '验证码有误!'
        }
      }
    }
  },
  created () {
    this.$store.commit('isTabShow', false)
    if (!this.$store.state.userId) {
      this.$store.commit('ddLogin', {recallback: 'false', ddgetcfg: ''})
    }
    // 设置钉钉的标题
    if (dd.version) {
      dd.biz.navigation.setTitle({
        title: '日程详情',
        onSuccess: function (result) {
          console.log(result)
        },
        onFail: function (errr) {
          console.log(errr)
        }
      })
    }
    this.getScheduleDetail()
  },
  methods: {
    keyDown () {
      if (this.$refs.refcode.valid === true && this.value2 !== '') {
        this.disabled = false
      } else {
        this.disabled = true
      }
    },
    getScheduleDetail: function () {
      var that = this
      that.ajax('/appSchedule/getScheduleDetail', {sdId: that.schId}).then(res => {
        if (res.code === 200) {
          that.value2 = res.data.title
          that.startTimeValve = res.data.startTime
          that.endTimeValve = res.data.endTime
          that.defaultValue = res.data.minute
        }
      })
    },
    change (value) {
      console.log('change', value)
    },
    getNoteTime: function (value) {
      console.log(value)
      this.defaultValue = value
    },
    editSchedule: function () {
      this.showButton = false
      this.isDisabled = false
    },
    cancelEdit: function () {
      this.showButton = true
      this.isDisabled = true
      this.getScheduleDetail()
    },
    scheduleUpdateSub: function () {
      var that = this
      that.Uloading = true
      var starTime = that.startTimeValve
      var endTime = that.endTimeValve
      var sT = new Date(starTime).getTime()
      var eT = new Date(endTime).getTime()
      if (sT > eT) {
        that.$message.warning('开始时间不能大于结束时间！')
        that.Uloading = false
      } else {
        that.ajax('/appSchedule/editSchedule', {
          sdId: that.schId,
          title: that.value2,
          startTime: that.startTimeValve,
          endTime: that.endTimeValve,
          minute: that.defaultValue
        }).then(res => {
          if (res.code === 200) {
            that.$message.success('操作成功')
            that.Uloading = false
            that.getScheduleDetail()
            that.cancelEdit()
          } else {
            that.Uloading = false
          }
        })
      }
    }
  }
}
</script>

<style scoped>
  .scheduleItem{
    color: #666;
    font-size: 16px;
    border-bottom: 1px solid #D9D9D9;
  }
</style>
