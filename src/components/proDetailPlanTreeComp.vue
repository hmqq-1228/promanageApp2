<template>
  <div class="child-item">
    <!--v-on:touchstart="tstart(childrenData.id, childrenData.projectType, $event)" v-on:touchmove="tmove"-->
    <div class="item-cnt" v-on:click="tend(childrenData.id, childrenData.projectType)">
      <div class="item-line">
        <div class="item-tttt" v-if="childrenData.isProName?false:true"></div>
        <div class="item-gang" v-if="childrenData.isProName?false:true"></div>
        <div v-bind:class="childrenData.planIcon" v-if="childrenData.isProName?false:true"></div>
        <div class="item-cnt-tit" style="user-select:none;" v-bind:class="childrenData.isProName?'pro-tit':''">{{childrenData.label}}</div >
      </div>
    </div>
    <proDetailPlanTreeComp v-bind:permissions="permissions" v-for="childrenItem in childrenData.children"
                           v-bind:childrenData="childrenItem" v-bind:key="childrenItem.id" v-on:selectEmit="selectEmitFuc"
                           v-on:addEmit="addEmitFuc" v-on:chakanEmit="chakanEmitFuc" v-on:delEmit="delClick">
    </proDetailPlanTreeComp>
  </div >
</template>

<script>
import proDetailPlanTreeComp from './proDetailPlanTreeComp.vue'
export default {
  name: 'proDetailPlanTreeComp',
  props: {
    childrenData: {
      type: null,
      default: function () {
        return {
          children: [],
          id: '',
          label: '',
          member: [],
          planIcon: '',
          projectType: ''
        }
      }
    },
    permissions: {
      type: Object,
      default: function () {
        return { canSee: 'CanSee', canEdit: 'CanEdit' }
      }
    }
  },
  components: {
    proDetailPlanTreeComp
  },
  data () {
    return {
      token: '',
      treeData: '',
      sTime: '',
      intervalCode: '',
      currentTargetObj: {},
      tendCancel: false,
      ismove: false
    }
  },
  created: function () {
    this.treeData = this.childrenData
  },
  mounted: function () {
    // this.treeData = this.childrenData
  },
  methods: {
    newTreeDataClear: function () {
    },
    delNode: function (e) {
      var obj = e.currentTarget
      var proType = $(obj).attr('data-projectType')
      var nodeid = $(obj).attr('data-id')
      this.$emit('delEmit', {nodeid, proType})
    },
    delClick: function (obj) {
      this.$emit('delEmit', obj)
    },
    // chakan: function (e) {
    //   var obj = e.currentTarget
    //   var proType = $(obj).attr('data-projectType')
    //   var nodeid = $(obj).attr('data-id')
    //   this.$emit('chakanEmit', {nodeid, proType})
    // },
    chakan: function (id, type) {
      // var obj = e.currentTarget
      // var proType = $(obj).attr('data-projectType')
      // var nodeid = $(obj).attr('data-id')
      // if (!this.tendCancel) {
      //   this.$emit('chakanEmit', {nodeid: id, proType: type})
      // }
    },
    dingFuc: function () {
      var that = this
      var currentTime = new Date().getTime()
      var duationTime = parseInt(currentTime) - parseInt(that.sTime)
      if (duationTime > 500 && !this.ismove) {
        console.log('长按中....')
        this.tendCancel = true
        this.$emit('selectEmit', {nodeid: that.currentTargetObj.id, proType: that.currentTargetObj.projectType})
      } else {
        this.tendCancel = false
      }
    },
    tstart: function (id, type, e) {
      // e.preventDefault()
      var that = this
      this.currentTargetObj.id = id
      this.currentTargetObj.projectType = type
      this.sTime = new Date().getTime()
      that.intervalCode = setInterval(that.dingFuc, 200)
    },
    tmove: function (e) {
      this.ismove = true
      this.tendCancel = true
      console.log('tmove:', e)
    },
    tend: function (id, type) {
      // var that = this
      // this.$emit('chakanEmit', {nodeid: id, proType: type})
      this.$emit('selectEmit', {nodeid: id, proType: type})
      // if (!this.tendCancel && !this.ismove) {
      //   this.$emit('chakanEmit', {nodeid: id, proType: type})
      // }
      // clearInterval(that.intervalCode)
    },
    selectEmitFuc: function (obj) {
      this.$emit('selectEmit', obj)
    },
    chakanEmitFuc: function (obj) {
      // console.log('dddddd:', obj)
      this.$emit('chakanEmit', obj)
    },
    addEmitFuc: function (obj) {
      this.$emit('addEmit', obj)
    },
    add: function (e) {
      var obj = e.currentTarget
      var proType = $(obj).attr('data-projectType')
      var nodeid = $(obj).attr('data-id')
      this.$emit('addEmit', {nodeid, proType})
    }
  }
}
</script>

<style scoped>
  *{
    -webkit-touch-callout:none;
    -webkit-user-select:none;
    -khtml-user-select:none;
    -moz-user-select:none;
    -ms-user-select:none;
    user-select:none;
  }
  #treeWrap{
    /*color: #fff;*/
  }
  .child-item{
    box-sizing: border-box;
    margin-left:25px;
    border-left:1px solid #ccc;
  }
  .child-item.pro-tit{
    margin-left:0
  }
  .child-item:last-child{
    border:none;
  }
  .item-tttt{
    display: none;
  }
  .child-item:last-child>.item-cnt>.item-line>.item-tttt{
    display:inline-block;
    width:1px;
    height:16px;
    position:absolute;
    background-color:#ccc;
  }
  .item-line{
    /*width:250px;*/
    display: flex;
    height:30px;
    /*line-height:30px;*/
    position:relative;
    _border-left: 1px solid #aaa;
  }
  .item-cnt-tit{
    _width: 220px;
    height: 30px;
    font-size: 12px;
    line-height: 30px;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
    display:inline-block;
  }
  .item-cnt-tit.pro-tit{
    font-size:16px;
  }
  .item-cnt,.handle-box,.edit-box{
    display:flex;
  }
  .item-cnt{
    justify-content:space-between;
  }
  .item-cnt:hover{
    background-color:#f5f5f5;
  }
  .plan-icon{
    width:16px;
    height:16px;
    margin-right:5px;
    margin-top:6px;
    /*transform: rotate(45deg);*/
    /*background-color:#409EFF;*/
    background:url("../../static/img/plan.png");
    background-size: 100%;
    background-repeat: no-repeat;
  }
  .task-icon{
    width:12px;
    height:12px;
    margin-right: 5px;
    margin-top:8px;
    background:url("../../static/img/task.png");
    background-size: 100%;
    background-repeat: no-repeat;
  }
  .handle-wrap{
    display: flex;
  }
  .handle-box{
    width: 530px;
    _flex-grow:1;
    line-height:30px;
  }
  .handle-box div{
    _padding:0 15px;
  }
  .worker{
    font-size: 12px;
    color: #777;
    width: 150px;
  }
  .time-limit{
    font-size: 10px;
    color: #13ce66;
    width: 270px;
  }
  .task-level{
    padding-top: 7px;
    font-size: 12px;
    width: 30px;
  }
  .task-level-val{
    width: 16px;
    height: 16px;
    color: #fff;
    border-radius: 8px;
    line-height: 16px;
    text-align: center;
  }
  .task-status{
    text-align: center;
    font-size: 12px;
    width: 70px;
  }
  .edit-box{
    color: #409eff;
    font-size: 12px;
    line-height:30px;
  }
  .edit-box div{
    padding-left:15px;
  }
  .item-gang{
    width:16px;
    height:15px;
    margin-right: 1px;
    _display:inline-block;
    border-bottom:1px solid #ccc;
    _background-color:#aaa;
  }
  .el-progress--text-inside .el-progress-bar{
    margin-left: 8%;
  }
  .project-type0{
    color: #aaa;
  }
  .item-chakan:hover,.add-click:hover,.del-click:hover{
    cursor: pointer;
  }
  .item-chakan.project-type0:hover,.del-click.project-type0:hover{
    cursor: not-allowed;
  }

  .notCanSee:hover,.notCanEdit:hover{
    color: #999;
    cursor: not-allowed;
  }
  *{
    -webkit-touch-callout:none;
    -webkit-user-select:none;
    -khtml-user-select:none;
    -moz-user-select:none;
    -ms-user-select:none;
    user-select:none;
  }
</style>
