<template>
    <div>
      <div>{{getUserId?'':''}}</div>
      <div class="cont" data-id="abcdefg">
        <el-tabs v-model="currentTab" type="card">
          <el-tab-pane v-bind:label="tab.tabName" v-bind:name="tab.tabComp" v-for="tab in tabs" v-bind:key="tab.tabComp"></el-tab-pane>
        </el-tabs>
        <component v-bind:is="currentTabComponent" v-on:beishuEmit="getBeishu" v-on:paneCurrent="paneCurrentFuc" text="school" class="tab"></component>
      </div>
    </div>
</template>

<script>
import ProDetailBase from './proDetailBase.vue'
import ProDetailMember from './proDetailMember.vue'
import ProDetailHistory from './proDetailHistory.vue'
import ProDetailPlanManage from './proDetailPlanManage.vue'
import dd from '../../static/dingtalk/dingtalk'
export default {
  name: 'projectDetailPage',
  components: {
    ProDetailBase,
    ProDetailMember,
    ProDetailHistory,
    ProDetailPlanManage
  },
  data () {
    return {
      selected: 'ProDetailBase',
      currentTab: this.$store.state.currentTab,
      tabs: [
        {tabName: '基本信息', tabComp: 'ProDetailBase'},
        {tabName: '成员管理', tabComp: 'ProDetailMember'},
        {tabName: '计划管理', tabComp: 'ProDetailPlanManage'},
        {tabName: '历史记录', tabComp: 'ProDetailHistory'}
        // {tabName: 'TreeTest5', tabComp: 'TreeTest5'}
      ]
    }
  },
  computed: {
    currentTabComponent: function () {
      return this.currentTab
    },
    getUserId: function () {
      var that = this
      that.userId = that.$store.state.userId
      return that.$store.state.userId
    }
  },
  created: function () {
    // console.log(dd.config)
    var that = this
    this.$store.commit('isTabShow', false)
    this.$store.commit('setRouter', {name: 'taskListPage', path: '/taskListPage/' + that.$route.params.pid})
    if (!this.$store.state.userId) {
      this.$store.commit('ddLogin', {recallback: 'false', ddgetcfg: ''})
    }
    // 设置钉钉的标题
    if (dd.version) {
      dd.biz.navigation.setTitle({
        title: '项目详情',
        onSuccess: function (result) {
          console.log(result)
        },
        onFail: function (errr) {
          console.log(errr)
        }
      })
    }
  },
  // mounted: function () {
  //   // 设置钉钉的标题
  //   if (dd.version) {
  //     dd.biz.navigation.setTitle({
  //       title: '基本信息',
  //       onSuccess: function (result) {
  //         console.log(result)
  //       },
  //       onFail: function (errr) {
  //         console.log(errr)
  //       }
  //     })
  //   }
  // },
  methods: {
    getBeishu (beinum) {
      // this.styleObject.width = 1200 + (beinum * 50) + 'px'
    },
    testDiv (e) {
      var obj = e.currentTarget
      console.log($(obj))
    },
    paneCurrentFuc (tab) {
      this.currentTab = tab
    }
  }
}
</script>

<style scoped>
  .cont{
    position: relative;
    height: 100%;
    width: 100%;
    background-color: #fff;
    /*margin-bottom: 50px;*/
  }
</style>
