<template>
    <div>
      <div>{{getLoginData?'':''}}</div>
      <search style="position: fixed;top:0;z-index: 999"
              :results="results"
              v-model="value"
              auto-fixed
              position="fixed"
              top="0px"
              @keyup.native="search(value)"
              @on-cancel="cancelSearch"
              ref="search">
      </search>
      <group gutter="44px">
        <div class="addNewPro" @click="toAddNewProject()"><img src="../../static/img/newaddicon.png" alt=""></div>
        <div class="stateBox">
          <div data-num="0" @click="getTaskState($event)">
            <div class="num" style="color: #ffc107">{{projectState.unstartP?projectState.unstartP:0}}</div>
            <div class="stateText">未开始</div>
          </div>
          <div data-num="2" @click="getTaskState($event)">
            <div class="num" style="color: #26a2ff">{{projectState.underwayP?projectState.underwayP:0}}</div>
            <div class="stateText">进行中</div>
          </div>
          <div data-num="3" @click="getTaskState($event)">
            <div class="num" style="color: #27CF97">{{projectState.finishP?projectState.finishP:0}}</div>
            <div class="stateText">已完成</div>
          </div>
        </div>
      </group>
      <div class="devide">
        <div class="myPro">我的项目</div>
        <div class="all"><div>项目类型: <span style="color: #3a8ee6" @click="selectProject()">{{proType}}</span></div></div>
      </div>
      <actionsheet
        v-model="show1"
        :menus="menus1"
        @on-click-menu="click">
      </actionsheet>
      <div class="projectBox" v-loading="delLoading">
        <div class="noData" v-if="projectViewData.length === 0">暂无数据~</div>
        <swipeout>
          <swipeout-item transition-mode="follow" v-for="(project, index) in projectViewData" v-bind:key="index">
            <div slot="right-menu" v-if="project.isDelProject">
              <swipeout-button @click.native="deleteProject(project.projectUID)" type="warn">删除</swipeout-button>
            </div>
            <div slot="right-menu" v-if="project.isDelProject === false">
              <swipeout-button style="background-color: #c7c7cc;">无权删除</swipeout-button>
            </div>
            <div slot="content" class="demo-content vux-1px-t">
              <div class="project" @click="toProjectDetail(project.projectUID)">
                <div class="proTop">
                  <div class="proLf proTit">{{project.projectName}}</div>
                  <div class="proRt">{{project.projectType}}</div>
                </div>
                <div style="display: flex;justify-content: space-between">
                  <div class="lf">
                    <div class="proTop sub">
                      <div class="proLf" v-bind:class="project.creatorId === userId ? 'myCreat': ''"><span class="label" style="color: chocolate">责</span>  {{project.projectManager}}({{project.position}})</div>
                    </div>
                    <div class="proTop sub">
                      <div class="proLf"><span class="label" style="color: chocolate">止</span>  {{project.endDate}}</div>
                    </div>
                  </div>
                  <div class="vux-circle-demo">
                    <div style='width:56px;height:56px;'>
                      <x-circle
                        :percent="project.proportion"
                        :stroke-width="8"
                        :trail-width="8"
                        :stroke-color="['#36D1DC', '#d2691e']"
                        trail-color="#ececec">
                        <span style="color:#09bb07">{{project.proportion}}%</span>
                      </x-circle>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </swipeout-item>
        </swipeout>
      <div>
        <confirm v-model="showDelete"
                 title="项目删除"
                 @on-cancel="onCancel"
                 @on-confirm="onConfirm">
          <p style="text-align:center;">是否删除此项目及下属任务？</p>
        </confirm>
      </div>
        <!--<div class="noData" v-if="projectViewData.list && projectViewData.list.length>0?false:true">-->
          <!--<div v-loading="loading"></div>-->
          <!--<div>{{noDataText}}</div>-->
        <!--</div>-->
      </div>
    </div>
</template>

<script>
import dd from '../../static/dingtalk/dingtalk'
export default {
  name: 'projectListPage',
  data () {
    return {
      results: [],
      value: '',
      userId: '',
      proId: '',
      show1: false,
      showDelete: false,
      delLoading: false,
      projectState: '',
      totalProject: 0,
      projectViewData: '',
      proType: '全部项目',
      menus1: {
        menu1: '集团战略',
        menu2: '公司项目',
        menu3: '部门项目',
        menu4: '小组项目',
        menu5: '个人项目',
        menu6: '全部项目'
      },
      // 查询个人项目列表
      myProjectViewPayload: {
        userId: '',
        status: '',
        pageNum: '1',
        projectType: '',
        projectName: '',
        pageSize: 20
      }
    }
  },
  created: function () {
    this.$store.commit('getNowUrl', 0)
    this.$store.commit('isTabShow', true)
    if (!this.$store.state.userId) {
      this.$store.commit('ddLogin', {recallback: 'false', ddgetcfg: ''})
    } else {
      this.log(11111111)
      // this.getAllProjectList()
    }
    // 设置钉钉的标题
    if (dd.version) {
      dd.biz.navigation.setTitle({
        title: '我的项目',
        onSuccess: function (result) {
          console.log(result)
        },
        onFail: function (errr) {
          console.log(errr)
        }
      })
    }
    this.settoken()
    // this.getAllProjectList()
  },
  computed: {
    getLoginData: function () {
      this.log(999999)
      var that = this
      // if (this.$store.state.loginData.data) {
      //   that.userId = this.$store.state.loginData.data.ID
      //   that.myProjectViewPayload.userId = that.$store.state.loginData.data.ID
      //   that.getAllProjectList()
      //   console.log('钉钉环境userId:', that.$store.state.userId)
      //   return this.$store.state.loginData.data.ID
      // } else {
      //   this.log('loginData:', this.$store.state.loginData)
      //   that.userId = that.$store.state.userId
      //   that.myProjectViewPayload.userId = that.$store.state.userId
      //   // that.getAllProjectList()
      //   console.log('非钉钉环境userId:', that.$store.state.userId)
      //   return '空'
      // }
      if (this.$store.state.userId) {
        that.userId = that.$store.state.userId
        that.myProjectViewPayload.userId = that.$store.state.userId
        that.getAllProjectList()
      } else {
        this.$store.commit('ddLogin', {recallback: 'false', ddgetcfg: ''})
      }
      return this.$store.state.userId
      // return this.$store.state.loginData.data
    }
  },
  methods: {
    settoken: function () {
      this.ajax('/app/setToken', {}).then(res => {
        this.token = res._jfinal_token
      })
    },
    getAllProjectList: function () {
      var that = this
      that.delLoading = true
      that.ajax('/app/myProjectView', that.myProjectViewPayload).then(res => {
        that.log('myProjectViewKKKK:', res)
        if (res.code === 200) {
          // for (var i = 0; i < res.data.list.length; i++) {
          //   res.data.list[i].startDate = res.data.list[i].startDate.split(' ')[0]
          //   res.data.list[i].endDate = res.data.list[i].endDate.split(' ')[0]
          // }
          that.projectViewData = res.data.list
          that.projectState = res.manuData
          that.totalProject = res.data.totalRow
          that.delLoading = false
          if (res.data.list.length === 0) {
            that.noDataText = '暂无数据'
          }
        } else {
          that.noDataText = ''
          that.delLoading = false
          this.log('myProjectView:code=>', res.code)
        }
      })
    },
    onChange (val) {
      console.log('change', val)
    },
    search: function (e) {
      console.log('search:', e)
      this.myProjectViewPayload.projectName = e
      this.getAllProjectList()
    },
    cancelSearch: function (e) {
      console.log('cancelSearch:', e)
      this.myProjectViewPayload.projectName = e
      this.getAllProjectList()
    },
    selectProject () {
      this.show1 = true
    },
    toAddNewProject: function () {
      this.$router.push('/projectModelList')
    },
    toProjectDetail: function (proId) {
      console.log(proId)
      if (proId) {
        this.$router.push('/projectDetailPage/' + proId)
      }
    },
    click (menuKey, menuItem) {
      var that = this
      console.log(menuKey, menuItem)
      var typeNum
      if (menuItem === '集团战略') {
        typeNum = '4'
        that.proType = '集团战略'
      } else if (menuItem === '公司项目') {
        typeNum = '0'
        that.proType = '公司项目'
      } else if (menuItem === '部门项目') {
        typeNum = '1'
        that.proType = '部门项目'
      } else if (menuItem === '小组项目') {
        typeNum = '2'
        that.proType = '小组项目'
      } else if (menuItem === '个人项目') {
        typeNum = '3'
        that.proType = '个人项目'
      } else if (menuItem === '全部项目') {
        typeNum = ''
        that.proType = '全部项目'
      }
      this.myProjectViewPayload.projectType = typeNum
      this.getAllProjectList()
    },
    getTaskState: function (e) {
      var obg = e.currentTarget
      // console.log(obg)
      $(obg).addClass('active')
      $(obg).siblings().removeClass('active')
      var stateType = $(obg).attr('data-num')
      this.myProjectViewPayload.status = stateType
      this.getAllProjectList()
    },
    deleteProject: function (pId) {
      var that = this
      console.log(pId)
      that.proId = pId
      that.showDelete = true
    },
    onCancel: function () {
      return false
    },
    onConfirm: function () {
      var that = this
      that.delLoading = true
      that.ajax('/app/delProjectById', {projectUID: that.proId}).then(res => {
        if (res.code === 200) {
          // 查询个人项目列表
          that.getAllProjectList()
          that.delLoading = false
          that.$message({
            type: 'success',
            message: '删除成功!'
          })
        }
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .all{
    font-size: 13px;
    color: #999;
    display: flex;
  }
  .noData{
    height: 100px;
    line-height: 100px;
    text-align: center;
    font-size: 13px;
    color: #888;
    z-index: 9999;
  }
  .addNewPro{
    position: fixed;
    right: 0;
    width: 22px;
    top: 40%;
    z-index: 100;
  }
  .addNewPro img{
    width: 100%;
  }
  li {
    display: inline-block;
    margin: 0 10px;
  }
  a {
    color: #999;
  }
  .active p{
    color: #3a8ee6;
  }
  .active{
    _background-color: #f5f5f5;
  }
  .mint-header .mint-button{
    color: #fff;
  }
  .label{
    display: inline-block;
    width: 16px;
    height: 16px;
    font-size: 12px;
    text-align: center;
    line-height: 16px;
    border: 1px solid #ccc;
    border-radius: 8px;
  }
  .devide{
    color: #999;
    height: 40px;
    text-align: left;
    line-height: 40px;
    padding: 0 10px;
    font-family: '黑体';
    display: flex;
    justify-content: space-between;
  }
  .delable{
    font-size: 12px;
    color: #999;
  }
  .delable.active{
    color: #3a8ee6;
  }
  .stateBox{
    width: 100%;
    display: flex;
    padding: 15px 0;
    background-color: #fff;
    justify-content: flex-start;
    /*border-top: 1px solid #ccc;*/
    border-bottom: 1px solid #e6e6e6;
  }
  .stateBox>div{
    flex-grow: 1;
    _width: 25%;
    text-align: center;
    border-left: 1px solid #e6e6e6;
  }
  .stateBox>div:nth-child(1){
    border-left: none;
  }
  .num{
    font-size: 18px;
    font-family: '黑体';
    font-weight: bold;
  }
  .stateText{
    color: #999;
    font-family: '黑体';
  }
  .active .stateText{
    color: #26a2ff
  }
  .project{
    border-radius: 4px;
    box-shadow: 2px 2px 4px #ddd;
    border-top: 1px solid #ddd;
    padding: 10px 20px;
    color: #666;
    font-family: '黑体';
    margin-bottom: 12px;
    background-color: #fff;
  }
  .deleteProBox{
    width: 40px;
    height: 40px;
    position: absolute;
    left: 3px;
    top: 5px;
  }
  .deletePro{
    width: 16px;
    height: 16px;
    color: #fff;
    text-align: center;
    line-height: 12px;
    background: rgba(0,0,0,0.2);
    border-radius: 8px;
    overflow: hidden;
  }
  .projectBox{
    width: 100%;
    min-height: 150px;
    /* margin-left: 2%; */
    padding: 0 10px;
    box-sizing: border-box;
  }
  .proTop{
    height: 30px;
  }
  .proLf{
    float: left;
  }
  .proRt{
    float: right;
    font-size: 14px;
    color: #999;
  }
  .sub{
    font-size: 14px;
    color: #999;
  }
  .proTit{
    width: 75%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .projectDelCover{
    display: none;
  }
  .projectDelCover.active{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100px;
    display: block;
  }
  .myCreat{
    color: chocolate;
  }
  .myCreatSty{
    border-right: 1px solid #E64340;
  }
</style>
