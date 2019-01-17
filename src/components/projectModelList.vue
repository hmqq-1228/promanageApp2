<template>
  <div class="modelList">
    <div class="modelItem" @click="toAddNewProject()">
      <div class="model">
        <div class="modelName">空白模板 <span style="color: chocolate;font-size: 13px;">(自定义工期)</span></div>
        <div class="modelType"><el-tag type="danger">空白模板</el-tag></div>
      </div>
      <div class="model foot">
        <div class="modelPeo">通用模板</div>
        <div class="modelTime"></div>
      </div>
    </div>
    <div class="modelItem list" v-for="(model, index) in modelList" v-bind:key="index" @click="toAddModelProject(model.id)">
      <div class="model">
        <div class="modelName">{{model.modelName}}</div>
        <div class="modelType"><el-tag type="warning">{{model.modelType}}</el-tag></div>
      </div>
      <div class="model foot">
        <!--<div>项目周期: <span style="font-size: 20px;color: chocolate;font-weight: bold;">{{model.duration}}</span> 天</div>-->
        <div class="modelPeo">创建人: {{model.creator}}</div>
      </div>
      <div class="model foot" style="margin-top: 5px">
        <div class="modelTime"><i class="el-icon-time"></i> {{model.createDate}}</div>
      </div>
    </div>
    <div style="text-align: center" v-if="modelListTotal > 10">
      <el-button icon="el-icon-plus" style="background-color: #fff;border: none;margin-top: 20px;" @click="addMoreHistory()" v-bind:disabled="notMore">点击加载更多~</el-button>
    </div>
  </div>
</template>

<script>
import dd from '../../static/dingtalk/dingtalk'
export default {
  name: 'projectModelList',
  data () {
    return {
      pNum: 1,
      notMore: false,
      modelList: [],
      modelListTotal: 0,
      modeldata: {
        pageSize: 10,
        pageNum: 1
      }
    }
  },
  watch: {
    modelListTotal: function (val, oVal) {
      if (val > 10) {
        this.notMore = false
      }
    }
  },
  created () {
    this.$store.commit('isTabShow', false)
    if (!this.$store.state.userId) {
      this.$store.commit('ddLogin', {recallback: 'false', ddgetcfg: ''})
    }
    this.settoken()
    this.getAllProjectModel()
    // 设置钉钉的标题
    if (dd.version) {
      dd.biz.navigation.setTitle({
        title: '模板中心',
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
    toAddNewProject: function () {
      this.$router.push('/addNewProject')
    },
    toAddModelProject: function (id) {
      this.$router.push('/addNewModelProject/' + id)
    },
    settoken: function () {
      this.ajax('/app/setToken', {}).then(res => {
        this.token = res._jfinal_token
      })
    },
    // 选择模板
    getAllProjectModel () {
      var that = this
      that.ajax('/appmodel/getModelList', that.modeldata).then(res => {
        if (res.code === 200) {
          console.log('getModelList:', res)
          that.modelList = that.modelList.concat(res.data.list)
          that.modelListTotal = res.data.totalRow
          if (that.modelList.length === that.modelListTotal) {
            that.notMore = true
          }
        }
      })
    },
    addMoreHistory: function () {
      this.pNum++
      this.modeldata.pageNum = this.pNum
      this.getAllProjectModel()
      // console.log('pNum', this.pNum)
    }
  }
}
</script>

<style scoped>
  .modelList{
    padding: 10px;
  }
  .modelItem{
    margin-top: 10px;
    background-color: #fff;
    padding: 10px;
    font-family: '黑体';
    font-size: 16px;
    border-radius: 4px;
    box-shadow: 1px 1px 6px #ccc;
    box-sizing: border-box;
  }
  .model{
    display: flex;
    justify-content: space-between;
  }
  .model.foot{
    font-size: 14px;
    color: #888;
    height: 24px;
    line-height: 24px;
  }
  .modelItem.list{
    border-radius: 6px;
  }
  .modelName{
    color: #555;
    font-size: 16px;
    width: 78%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
