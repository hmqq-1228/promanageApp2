<template>
    <div style="overflow: hidden;">
      <group title="新建一个日程">
        <div class="scheduleItem" style="border-top: 1px solid #D9D9D9;">
          <x-input title="项目名称" required placeholder-align="right" text-align="right" v-model="value2" placeholder="请填写项目名称" :is-type="nameType" :show-clear="true" ref="refcode" @on-change="keyDown"></x-input>
        </div>
        <div class="scheduleItem">
          <datetime v-model="startTimeValve" :start-date="startDate" required format="YYYY-MM-DD HH:mm" :minute-list="['00', '10', '20', '30',  '40',  '50']" @on-change="change" @on-confirm="selectedTime" title="开始时间"></datetime>
        </div>
        <div class="scheduleItem">
          <datetime v-model="endTimeValve" required format="YYYY-MM-DD HH:mm" :start-date="startDate" :minute-list="['00', '10', '20', '30',  '40',  '50']" @on-confirm="selectedEndTime" title="结束时间"></datetime>
        </div>
        <div class="scheduleItem">
          <selector title="提醒时间" @on-change="getNoteTime" :options="list" direction="rtl" v-model="defaultValue"></selector>
        </div>
        <div style="width:80%;margin: 50px auto;">
          <x-button type="primary" @click.native="scheduleFormSub" :disabled="disabled">立即创建</x-button>
        </div>
      </group>
    </div>
</template>

<script>
import dd from '../../static/dingtalk/dingtalk'
export default {
  name: 'addNewSchedule',
  data () {
    return {
      iconType: '',
      disabled: true,
      nowBinTime: '',
      minStartTime: '',
      startTimeValve: '2018-12-12 09:00',
      startDate: '2018-12-12',
      endTimeValve: '2019-01-08 18:00',
      defaultValue: '0',
      minHour: '',
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
        title: '新建日程',
        onSuccess: function (result) {
          console.log(result)
        },
        onFail: function (errr) {
          console.log(errr)
        }
      })
    }
    this.settoken()
    this.getNowDataTime()
  },
  methods: {
    settoken: function () {
      this.ajax('/app/setToken', {}).then(res => {
        this.token = res._jfinal_token
      })
    },
    getNowDataTime: function () {
      var starTime = new Date()
      var staryear = starTime.getFullYear()
      var starmonth = (starTime.getMonth() + 1) < 10 ? '0' + (starTime.getMonth() + 1) : (starTime.getMonth() + 1)
      var starday = starTime.getDate() < 10 ? '0' + starTime.getDate() : starTime.getDate()
      var starHours = starTime.getHours() < 10 ? '0' + starTime.getHours() : starTime.getHours()
      var starMinut = starTime.getMinutes() < 10 ? '0' + starTime.getMinutes() : starTime.getMinutes()
      this.nowBinTime = staryear + '-' + starmonth + '-' + starday + ' ' + starHours + ':' + starMinut
      // var daySecond = nowEndData.getSeconds() < 10 ? '0' + nowEndData.getSeconds() : nowEndData.getSeconds()
      var nStar = Math.ceil(starMinut / 10)
      var ceilMintStar = nStar * 10
      if (ceilMintStar === 60) {
        ceilMintStar = '00'
        starHours = starHours + 1
      }
      var startTimeNow = staryear + '-' + starmonth + '-' + starday + ' ' + starHours + ':' + ceilMintStar
      var startDay = staryear + '-' + starmonth + '-' + starday
      this.startDate = startDay
      this.minHour = parseInt(starHours)
      this.startTimeValve = startTimeNow
      this.minStartTime = startTimeNow
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
      this.endTimeValve = lastTime
    },
    keyDown () {
      if (this.$refs.refcode.valid === true && this.value2 !== '') {
        this.disabled = false
      } else {
        this.disabled = true
      }
    },
    change (value) {
      console.log('change', value)
      var that = this
      var getTime = new Date(value.replace(/-/g, '/')).getTime()
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
      that.endTimeValve = lastTime
    },
    selectedTime: function (val) {
      console.log(val)
      var that = this
      var getNowTime = new Date(that.nowBinTime.replace(/-/g, '/')).getTime()
      var selectTime = new Date(val.replace(/-/g, '/')).getTime()
      if (selectTime < getNowTime) {
        that.startTimeValve = that.minStartTime
        that.$message.warning('开始时间应大于当前时间')
      } else {
        that.startTimeValve = val
      }
    },
    selectedEndTime: function (val) {
      console.log(val)
      var that = this
      var getNowTime = new Date(that.startTimeValve.replace(/-/g, '/')).getTime()
      var selectTime = new Date(val.replace(/-/g, '/')).getTime()
      if (selectTime < getNowTime) {
        that.endTimeValve = that.startTimeValve
        that.$message.warning('开始时间应大于当前时间')
      } else {
        that.endTimeValve = val
      }
    },
    getNoteTime: function (value) {
      console.log(value)
      this.defaultValue = value
    },
    scheduleFormSub: function () {
      var that = this
      var starTime = that.startTimeValve
      var endTime = that.endTimeValve
      var sT = new Date(starTime).getTime()
      var eT = new Date(endTime).getTime()
      if (sT > eT) {
        that.$message.warning('开始时间不能大于结束时间！')
      } else {
        that.ajax('/appSchedule/addSchedule', {
          title: that.value2,
          startTime: that.startTimeValve,
          endTime: that.endTimeValve,
          minute: that.defaultValue
        }).then(res => {
          if (res.code === 200) {
            that.$message.success('操作成功')
            that.value2 = ''
            that.disabled = true
            that.$router.push('/dataManagePage')
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
