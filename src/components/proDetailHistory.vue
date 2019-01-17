<template>
  <div class="proDetailHistory">
    <div class="discription lis">
      <h3>历史记录</h3>
      <div class="add" @click="addRemark()"><img src="../../static/img/msg.png" alt="">添加评论</div>
      <div class="logBox">
        <div v-bind:key="logs.index" class="TimeLine" style="position: relative;" v-for="(logs, index) in taskLogs">
          <div class="quan">{{index+1}}</div>
          <div class="timeDate">{{logs.oTime}}</div>
          <div class="timeCont">{{logs.oTitle?logs.oTitle:''}}<span class="listColor" v-if="logs.oName">{{' 【' + logs.oName + '】, '}}</span>{{logs.oContent}}
            <div class="contBoxContentWrap">
              <div class="contBoxContent">{{logs.comment}}</div>
              <div class="contBoxContent" v-if="logs.uploads && logs.uploads.length > 0">
                <span v-if="logs.uploads[0].isImage" @click="showBigImage(logs.uploads[0].previewUrl, logs.uploads[0].showName)" class="filepre">附件预览</span>
                <a v-bind:download="logs.uploads[0].showName" v-bind:href="logs.uploads[0].downloadUrl">附件: {{logs.uploads[0].showName}}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <el-row style="margin-top: 30px;text-align: center;" v-if="totalData > 10">
        <el-button icon="el-icon-plus" @click="getPageNum()" v-bind:disabled="notMore">加载更多</el-button>
      </el-row>
    </div>
    <!--预览图片-->
    <el-dialog title="预览图片" width="90%" :visible.sync="showBigImageVisible">
      <div style="width: 100%"><img style="width: 100%" v-bind:src="preImageUrl" alt=""></div>
    </el-dialog>
    <!--添加备注-->
    <el-dialog title="添加评论" :visible.sync="dialogFormVisible"  width="80%">
      <form id="uploadFile" enctype="multipart/form-data" v-loading="loading">
        <div style="height: 30px;line-height: 30px"><span style="color: red">*</span> 添加评论：</div>
        <textarea name="content" id="textArea" cols="60" v-model="markTextareaVal" rows="4" style="width: 98%;"></textarea>
        <div style="height: 30px;line-height: 30px">文件上传：</div>
        <input type="file" id="myfile" name="myfile" placeholder="请选择文件"/><br><br>
        <input type="hidden" name="rid" v-bind:value="rid">
        <input type="hidden" name="userId" v-bind:value="userId">
        <input type="hidden" name="rtype" v-bind:value="1">
        <div slot="footer" class="dialog-footer" style="text-align: center;">
          <el-button @click="addMarkCancel()">取 消</el-button>
          <el-button type="primary" @click="addMarkInfo()">提 交</el-button>
        </div>
      </form>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'proDetailHistory',
  // dialogFormVisible: false,
  data () {
    return {
      msg: '通用项目管理',
      markTextareaVal: '',
      userId: this.$store.state.userId,
      loading: false,
      notMore: false,
      dialogFormVisible: false,
      rid: '',
      taskLogs: [],
      totalData: 0,
      pagenum: 1,
      preImageUrl: '',
      showBigImageVisible: false
    }
  },
  watch: {
    dialogFormVisible: function (val, oldVal) {
      if (!val) {
        this.markTextareaVal = ''
      }
    }
  },
  created: function () {
    // var that = this
    // this.$store.commit('setRouterName', {name: '项目历史记录', parentName: 'proDetails', url: '/proDetails/' + that.$route.params.pid})
    this.getHistoryCont()
    this.settoken()
    // if (this.dialogFormVisible === false) {
    //   this.loading = false
    // }
  },
  methods: {
    settoken: function () {
      this.ajax('/app/setToken', {}).then(res => {
        this.token = res._jfinal_token
      })
    },
    showBigImage (url, imgName) {
      if (url) {
        if (this.isImage(imgName)) {
          this.preImageUrl = url
          this.showBigImageVisible = true
        }
      } else {
        this.$message('地址无效')
      }
    },
    addRemark () {
      this.dialogFormVisible = true
      this.rid = this.$route.params.pid
    },
    addMarkCancel: function () {
      this.dialogFormVisible = false
      this.markTextareaVal = ''
    },
    getHistoryCont () {
      var that = this
      var planid = this.$route.params.pid
      that.ajax('/app/getLogAndComment', {rid: planid, rtype: 1, pageSize: 10, pageNum: that.pagenum, userId: that.userId}).then(res => {
        console.log('getLogAndComment:', res)
        if (res.code === 200) {
          for (var i = 0; i < res.data.list.length; i++) {
            if (res.data.list[i].uploads.length > 0) {
              if (that.isImage(res.data.list[i].uploads[0].showName)) {
                res.data.list[i].uploads[0].isImage = true
              } else {
                res.data.list[i].uploads[0].isImage = false
              }
              var downurl = that.$store.state.baseServiceUrl + '/file/downloadFile?realUrl=' + res.data.list[i].uploads[0].realUrl + '&showName=' + res.data.list[i].uploads[0].showName
              res.data.list[i].uploads[0].downloadUrl = downurl
            }
          }
          that.taskLogs = that.taskLogs.concat(res.data.list)
          // console.log('taskLogssssssssssss::', that.taskLogs)
          that.totalData = res.data.totalRow
          if (that.taskLogs.length === that.totalData) {
            console.log('ss')
            that.notMore = true
          }
          console.log('taskLogs:', res)
        }
      })
    },
    getPageNum () {
      this.pagenum++
      console.log(this.pagenum)
      // this.pagenum = e
      this.getHistoryCont()
    },
    addMarkInfo () {
      var that = this
      that.loading = true
      var url = that.$store.state.baseServiceUrl
      var formData = new FormData($('#uploadFile')[0])
      if (that.markTextareaVal) {
        $.ajax({
          type: 'post',
          url: url + '/app/addOrEditComment',
          data: formData,
          cache: false,
          processData: false,
          contentType: false,
          crossDomain: true,
          xhrFields: {
            withCredentials: true
          }
        }).then(function (data) {
          console.log(data)
          if (data.code === 200) {
            that.$message({
              type: 'success',
              message: data.msg
            })
            that.pagenum = 1
            that.taskLogs = []
            that.getHistoryCont()
            that.dialogFormVisible = false
            $('#textArea').val('')
            $('#myfile').val('')
            that.loading = false
          } else if (data.code === 300) {
            that.$message({
              type: 'error',
              message: data.msg
            })
            that.loading = false
          } else {
            that.$message({
              type: 'error',
              message: data.msg
            })
            that.loading = false
          }
        })
      } else {
        that.$message({
          type: 'error',
          message: '添加评论内容不能为空'
        })
        that.loading = false
      }
    }
  }
}
</script>

<style scoped>
  .proDetailHistory{
  }
  .cnt-tit{
    padding-top: 20px;
  }
  .quan{
    width: 14px;
    height: 14px;
    border: 1px solid #3a8ee6;
    border-radius: 8px;
    display: inline-block;
    line-height:14px;
    text-align: center;
    font-size: 10px;
    color: #3a8ee6;
  }
  .timeDate{
    display: inline-block;
    margin-left: 16px;
    position: absolute;
    top: 4px;
    font-weight: bold;
  }
  .timeCont{
    padding-top: 10px;
    margin-left: 8px;
    border-left: 1px solid #ddd;
    padding-left: 30px;
    font-size: 14px;
    color: #999;
    padding-bottom: 10px;
  }
  .discription{
    padding: 0 20px;
    border-bottom: 1px solid #e6e6e6;
  }
  .discription.lis{
    position: relative;
    background-color: #fff;
    padding-top: 10px;
    padding-bottom: 15px;
  }
  .discription h3{
    color: #666;
    font-size: 16px;
    font-family: '黑体';
    _margin-left: 0px;
  }
  .add{
    color: #3a8ee6;
    position: absolute;
    top: 10px;
    right: 20px;
    width: 100px;
    font-size: 14px;
    text-align: right;
  }
  .add:hover{
    cursor: pointer;
  }
  .add img{
    _float: left;
    margin-right: 4px;
    vertical-align:middle;
  }
  .logBox{
    _height: 120px;
    margin-top: 20px;
    /*overflow: scroll;*/
    /*overflow-x: hidden;*/
  }
  ul{
    list-style: none;
    padding:0;
  }
  ul li{
    font-size: 13px;
    text-indent: 0;
    color: #777;
    margin-bottom: 10px;
  }
  .contentHide .contBoxContent{
    display: none;
  }
  .contentShow .contBoxContent{
    display: block;
  }
  .contBoxContent{
    color: #999;
    font-size: 12px;
    padding-left: 8px;
    line-height: 22px;
  }
  .contBoxContentWrap{
    margin-top: 6px;
    margin-bottom: 6px;
    background-color: #f5f5f5;
  }
  /*.contentShow .contBoxContentWrap{*/
  /*border: 1px solid #eee;*/
  /*padding: 5px 0;*/
  /*}*/
  .contentHide .contBoxContentWrap{
    display: none;
  }
  .logWrap{
    display: flex;
  }
  .logIconBox{
    margin-left: 5px;
    padding-top: 2px;
  }
  .logIcon{
    width: 15px;
    height: 15px;
    text-align: center;
    line-height: 15px;
    border-radius: 10px;
    font-size: 15px;
    color: #000;
    opacity: 0.4;
    border: 1px solid #000;
  }
  .listColor{
    _color: #3a8ee6;
    color: #666;
    font-weight: bold;;
  }
  .TimeLine:last-of-type .timeCont{
    border-left: none !important;
  }
  .filepre{
    color: #3a8ee6;
    margin-right: 10px;
    cursor: pointer;
  }
</style>
