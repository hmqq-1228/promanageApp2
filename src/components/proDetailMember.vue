<template>
    <div style="height: 100%;" v-loading="loading">
      <div class="devide">添加项目成员</div>
      <div class="memberSer">
        <div class="ser">
          <el-autocomplete style="width: 100%"
             v-model="projectManager"
             :fetch-suggestions="querySearchAsync"
             placeholder="搜索添加人员"
             :trigger-on-focus="false"
             @select="handleSelect"
          ></el-autocomplete>
        </div>
        <div class="addMin" @click="addMenber()">添加</div>
        <div class="add" @click="addMemberFromPart()">从组织添加</div>
      </div>
      <div class="devide">项目成员</div>
      <div class="memberList">
        <div style="width: 20%;">角色</div>
        <div style="width: 20%;">姓名</div>
        <div style="width: 20%;">查看</div>
        <div style="width: 20%;">编辑</div>
        <div style="width: 20%;font-size: 12px;color: #3a8ee6"><span class="clearAll"  @click="clearAll()">清空</span></div>
      </div>
      <div class="memberItem" v-for="(people, index) in peopleList" v-bind:key="index">
        <div style="width: 20%;">{{people.peopleType}}</div>
        <div style="width: 20%;">{{people.userName}}</div>
        <div style="width: 40%;">
          <input style="margin-right: 34%" v-bind:id="people.id" type="checkbox" name="role" value="1" @click="IsChecked($event)" v-bind:checked="people.isSeeCheck">
          <input v-bind:id="people.id" type="checkbox" name="role" value="2" @click="IsChecked($event)" v-bind:checked="people.isEditCheck">
        </div>
        <!--<div style="width: 20%;">-->
          <!--<input v-bind:id="people.id" type="checkbox" name="role" value="2" @click="IsChecked($event)" v-bind:checked="people.isEditCheck">-->
        <!--</div>-->
        <div style="width: 20%;color: #3a8ee6"><div v-if="people.peopleRole === '4' ? true : false"><span v-bind:id="people.id" class="deletePeople" @click="deletePeople($event)">&#10005;</span></div></div>
      </div>
      <div style="text-align: center;width: 80%;margin: 50px auto">
        <!--<el-button size="large" type="primary" @click="saveMessage()">保存</el-button>-->
        <x-button :gradients="['#1D62F0', '#19D5FD']" @click.native="saveMessage()">保存</x-button>
      </div>
      <div class="model" v-if="isShow">
        <div class="modelHd">
          <div style="float: left" @click="closeModel()">返回</div>
          <div>选择成员</div>
        </div>
        <div class="partList">
          <div class="partNav"><span data-partid="" @click="getDepartNavFirst($event)">贝豪实业 &#62; </span><span v-for="(partN, index) in partNav" v-bind:key="partN.partId" v-bind:data-num="index" v-bind:data-partid="partN.partId" @click="getDepartNav($event)">{{partN.partName}} &#62; </span></div>
          <div class="partName">杭州贝豪实业有限公司</div>
          <div v-if="lastPart" class="partItem" v-for="(part, index) in partList" v-bind:key="index">
            <input type="checkbox" v-bind:data-Name="part.Name" v-bind:value="part.ID" @change="getThisMenber($event)">
            <label style="padding-left: 10px">{{part.Name}}</label>
            <div class="next" v-bind:data-partId = 'part.ID' v-bind:data-partName = 'part.Name' @click="getNextPartAndLeader($event)">下一级</div>
          </div>
          <div v-if="lastPartMember" class="partItem" v-for="(part, index) in partList" v-bind:key="index">
            <input type="checkbox" v-bind:data-Name="part.Name" v-bind:value="part.ID" @change="getThisMenber($event)">
            <label style="padding-left: 10px">{{part.Name}}({{part.jName}})</label>
            <div v-if="showNextPart" class="next" v-bind:data-partId = 'part.ID' @click="getNextPartAndLeader($event)">下一级</div>
          </div>
          <div class="partName">管理人员</div>
          <div v-if="leaderList.length > 0" class="partItemLeader" v-for="leader in leaderList" v-bind:key="leader.ID">
            <input type="checkbox" v-bind:data-Name="leader.Name" v-bind:value="leader.ID" @change="getThisMenber($event)">
            <div style="padding-left: 10px;float: left">{{leader.Name}}({{leader.jName}})</div>
          </div>
          <div v-if="leaderList.length === 0" class="partItemLeader">
            <div style="padding-left: 10px;float: left"></div>
          </div>
        </div>
        <!--<el-button size="large" type="primary" @click="saveGetPeople()">确定选择</el-button>-->
        <div style="text-align: center;width: 80%;margin: 50px auto">
          <!--<el-button size="large" type="primary" @click="saveMessage()">保存</el-button>-->
          <x-button :gradients="['#1D62F0', '#19D5FD']" @click.native="saveGetPeople()">确定选择</x-button>
        </div>
      </div>
    </div>
</template>

<script>
export default {
  name: 'proDetailMember',
  data () {
    return {
      userId: this.$store.state.userId,
      isShow: false,
      projectUID: this.$route.params.pid,
      token: '',
      loading: false,
      lastPart: true,
      showNextPart: false,
      lastPartMember: false,
      projectManager: '',
      transferUserId: '',
      transferUserName: '',
      peoDone: [],
      partNav: [],
      memberNum: [],
      getPeople: [],
      partList: [],
      leaderList: [],
      peopleList: [],
      departmentList: []
    }
  },
  created: function () {
    this.$store.commit('currentTabSet', 'ProDetailMember')
    this.getProjectPeo()
    this.settoken()
  },
  methods: {
    settoken: function () {
      this.ajax('/app/setToken', {}).then(res => {
        this.token = res._jfinal_token
      })
    },
    // 查询部门
    addMemberFromPart: function () {
      var that = this
      this.departmentList = []
      this.isShow = true
      this.lastPartMember = false
      this.lastPart = true
      this.ajax('/app/queryDepartment', {userId: that.userId}).then(res => {
        if (res.code === 200) {
          this.partList = res.msg.department
          this.leaderList = res.msg.member
        }
      })
    },
    closeModel: function () {
      this.isShow = false
      this.partList = []
      this.partNav = []
      this.leaderList = []
      this.memberNum = []
      this.departmentList = []
    },
    getThisMenber: function (e) {
      var that = this
      if (e.target.checked === false) {
        var length = that.departmentList.length
        that.departmentList.splice(length - 1, 1)
      } else if (e.target.checked === true) {
        var departObj = {
          Name: e.target.dataset.name,
          ID: e.target.value
        }
        that.departmentList.push(departObj)
      }
    },
    saveGetPeople: function () {
      var that = this
      var payload = JSON.stringify({departmentIDs: that.departmentList})
      that.ajax('/app/queryMember', {payload: payload}).then(res => {
        if (res.code === 200) {
          that.memberNum = res.msg
          if (that.memberNum.length === 0) {
            // that.$toast({message: '请您选择成员！'})
            that.$message.warning('请您选择成员!')
          } else if (that.memberNum.length > 0) {
            this.$confirm('您确定添加' + that.memberNum.length + '人到此项目？', '您选中' + that.memberNum.length + '人', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              that.getAddProjectPeople = res.msg
              that.token = res._jfinal_token
              var addMemberPayload = JSON.stringify({projectUID: that.$route.params.pid, hrocPeople: that.getAddProjectPeople, _jfinal_token: that.token})
              that.ajax('/app/addMembers', {payload: addMemberPayload}).then(res => {
                if (res.code === 200) {
                  // that.$toast({message: '添加成功！'})
                  that.$message.success('添加成功!')
                  that.getProjectPeo()
                  that.closeModel()
                  // that.loading = false
                  // that.deId = []
                }
              })
              // that.token = res._jfinal_token
            }).catch(() => {
              // that.loading = false
              this.$message({
                type: 'info',
                message: '已取消添加'
              })
            })
          }
          // console.log(res)
        }
      })
    },
    // 查询人员列表
    getProjectPeo () {
      var that = this
      this.ajax('/app/getMembersByProjectUID', {projectUID: that.$route.params.pid}).then(res => {
        if (res.code === 200) {
          // console.log('getMembersByProjectUID:', res)
          this.peopleList = res.msg
          for (var j = 0; j < that.peopleList.length; j++) {
            if (that.peopleList[j].peopleRole === '1') {
              that.peopleList[j].peopleType = '创建人'
            } else if (that.peopleList[j].peopleRole === '2') {
              that.peopleList[j].peopleType = '负责人'
            } else if (that.peopleList[j].peopleRole === '3') {
              that.peopleList[j].peopleType = '执行人'
            } else if (that.peopleList[j].peopleRole === '4') {
              that.peopleList[j].peopleType = '成员'
            }
          }
          this.token = res._jfinal_token
          // console.log('peoplelist', res)
        }
        that.peoDone = []
        for (var i = 0; i < that.peopleList.length; i++) {
          if (that.peopleList[i].role === '2') {
            that.peopleList[i].isSeeCheck = true
            that.peopleList[i].isEditCheck = true
          } else if (that.peopleList[i].role === '1') {
            that.peopleList[i].isSeeCheck = true
            that.peopleList[i].isEditCheck = false
          } else {
            that.peopleList[i].isSeeCheck = false
            that.peopleList[i].isEditCheck = false
          }
          var peoObj = {}
          peoObj.id = that.peopleList[i].id
          peoObj.role = that.peopleList[i].role
          that.peoDone.push(peoObj)
        }
      })
    },
    getDepartNavFirst: function (e) {
      var that = this
      var obj = e.currentTarget
      var partId = $(obj).attr('data-partid')
      that.partNav = []
      that.ajax('/app/queryDepartment', {departmentID: partId, userId: that.userId}).then(res => {
        if (res.code === 200) {
          if (res.msg.department.length === 0) {
            that.lastPartMember = true
            that.lastPart = false
            that.showNextPart = false
            that.partList = res.msg.member
            that.leaderList = []
          } else {
            that.partList = res.msg.department
            that.leaderList = res.msg.member
            that.lastPartMember = false
            that.lastPart = true
          }
        }
      })
    },
    getDepartNav: function (e) {
      var that = this
      var obj = e.currentTarget
      var partId = $(obj).attr('data-partid')
      var num = parseInt($(obj).attr('data-num'))
      var n = (that.partNav.length - 1) - num
      that.partNav.splice(num + 1, n)
      that.ajax('/app/queryDepartment', {departmentID: partId, userId: that.userId}).then(res => {
        if (res.code === 200) {
          if (res.msg.department.length === 0) {
            that.lastPartMember = true
            that.lastPart = false
            that.showNextPart = false
            that.partList = res.msg.member
            that.leaderList = []
          } else {
            that.partList = res.msg.department
            that.leaderList = res.msg.member
            that.lastPartMember = false
            that.lastPart = true
          }
        }
      })
    },
    getNextPartAndLeader: function (e) {
      var that = this
      var obj = e.currentTarget
      that.partList = []
      that.leaderList = []
      that.memberNum = []
      that.departmentList = []
      var partId = $(obj).attr('data-partId')
      var partName = $(obj).attr('data-partName')
      var partObj = {
        partId: partId,
        partName: partName
      }
      that.partNav.push(partObj)
      that.ajax('/app/queryDepartment', {departmentID: partId, userId: that.userId}).then(res => {
        if (res.code === 200) {
          if (res.msg.department.length === 0) {
            that.lastPartMember = true
            that.lastPart = false
            that.showNextPart = false
            that.partList = res.msg.member
            that.leaderList = []
          } else {
            that.partList = res.msg.department
            that.leaderList = res.msg.member
            that.lastPartMember = false
            that.lastPart = true
          }
        }
      })
    },
    IsChecked (e) {
      var obj = e.currentTarget
      var that = this
      var newRole = ''
      if (e.target.value === '2') {
        if ($(obj).is(':checked')) {
          $(obj).siblings().prop('checked', true)
          newRole = '2'
        } else {
          if ($(obj).siblings().is(':checked')) {
            newRole = '1'
          } else {
            newRole = '0'
          }
        }
      } else {
        if ($(obj).is(':checked')) {
          if ($(obj).siblings().is(':checked')) {
            newRole = '2'
          } else {
            newRole = '1'
          }
        } else {
          if ($(obj).siblings().is(':checked')) {
            newRole = '2'
          } else {
            newRole = '0'
          }
        }
      }
      for (var i = 0; i < that.peoDone.length; i++) {
        if (that.peoDone[i].id.toString() === e.target.id) {
          that.peoDone[i].role = newRole
        }
      }
      // console.log('rewRole', newRole)
    },
    // 立即保存 成员管理右上角按钮
    saveMessage () {
      var that = this
      // that.loading = true
      var payload = JSON.stringify({userId: that.userId, projectUID: that.projectUID, projectOrg: that.peoDone})
      this.ajax('/app/updateRole', {payload: payload}).then(res => {
        if (res.code === 200) {
          // that.$toast({message: '保存成功！'})
          that.$message.success('保存成功！')
          that.getProjectPeo()
          // that.queryManagePlan()
          // that.loading = false
          that.$emit('paneCurrent', 'ProDetailPlanManage')
        }
      })
    },
    // 删除人员
    deletePeople (e) {
      var that = this
      var Uid = e.target.id
      console.log('Uid', e)
      this.$confirm('是否删除当前成员?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        that.loading = true
        this.ajax('/app/delMembersById', {id: Uid, userId: that.userId}).then(res => {
          if (res.code === 200) {
            that.getProjectPeo()
            that.token = res._jfinal_token
            that.loading = false
          }
        })
      }).catch(() => {
        that.loading = false
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    querySearchAsync (queryString, cb) {
      var that = this
      if (queryString) {
        that.projectManager = queryString
        this.ajax('/app/autoCompleteNames', {projectManager: that.projectManager, userId: that.userId}).then(res => {
          this.log('autoCompleteNames:', res)
          if (res.code === 200) {
            var dddarr = []
            if (res.msg.length > 0) {
              for (var i = 0; i < res.msg.length; i++) {
                var obj = {}
                obj.value = res.msg[i].Name + ' (' + res.msg[i].jName + ')'
                obj.name = res.msg[i].Name
                obj.userId = res.msg[i].ID
                // obj.jName = res.msg[i].jName
                dddarr.push(obj)
              }
              // 调用 callback 返回建议列表的数据
              cb(dddarr)
            } else {
              var aaaddd = []
              // that.$toast({message: '查无此人'})
              that.$message.info('查无此人！')
              cb(aaaddd)
            }
          }
        })
      }
    },
    handleSelect (item) {
      // console.log(item)
      this.transferUserId = item.userId
      this.transferUserName = item.name
    },
    // 清空
    clearAll () {
      var that = this
      this.$confirm('是否清空所有成员?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // that.loading = true
        this.ajax('/app/delMembersById', {
          id: 0,
          userId: that.userId,
          projectUID: that.projectUID
        }).then(res => {
          if (res.code === 200) {
            that.getProjectPeo()
            // that.deId = []
            // that.loading = false
            that.token = res._jfinal_token
          }
        })
      }).catch(() => {
        that.loading = false
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    addMenber () {
      var that = this
      that.loading = true
      that.getPeople = [{
        ID: this.transferUserId,
        Name: this.transferUserName
      }]
      if (that.projectManager === '') {
        // that.$toast({message: '成员不能为空！'})
        that.$message.warning('成员不能为空！')
        that.loading = false
      } else if (that.projectManager !== '') {
        var payload = JSON.stringify({projectUID: that.$route.params.pid, hrocPeople: that.getPeople, _jfinal_token: that.token, userId: that.userId})
        that.ajax('/app/addMembers', {payload: payload}).then(res => {
          if (res.code === 200) {
            that.getProjectPeo()
            // that.$toast({message: '添加成功！'})
            that.$message.success('添加成功！')
            that.projectManager = ''
            that.loading = false
            // that.deId = []
          }
        })
      }
    }
  }
}
</script>

<style scoped>
.model{
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  z-index: 9;
}
.modelHd{
  height: 40px;
  width: 100%;
  color: #fff;
  line-height: 40px;
  font-size: 16px;
  padding: 0 10px;
  text-align: center;
  font-family: '黑体';
  background-color: #0e78c7;
}
.modelHd div{
  display: inline-block;
  height: 30px;
}
.memberSer{
  height: 50px;
  line-height: 50px;
  text-align: left;
  background-color: #fff;
  padding: 0 10px;
}
.ser{
  width: 45%;
  display: inline-block;
}
  .add,.addMin{
    display: inline-block;
    height: 32px;
    width: 80px;
    line-height: 32px;
    font-size: 12px;
    text-align: center;
    border: 1px solid #ccc;
    background-color: #f5f5f5;
    color: #3a8ee6;
    font-family: '黑体';
    border-radius: 4px;
  }
  .add{
    border-radius: 4px;
    margin-left: 10px;
  }
  .addMin{
    width: 50px;
  }
  .devide{
    height: 30px;
    line-height: 30px;
    text-align: left;
    padding: 0 10px;
    color: #888;
    font-size: 15px;
    font-family: '黑体';
    background-color: #fff;
  }
  .memberList,.memberItem{
    width: 100%;
    height: 34px;
    display: flex;
    justify-content: space-between;
    color: #666;
    font-size: 14px;
    line-height: 34px;
  }
  .memberItem{
    color: #888;
    font-size: 12px;
    background-color: #fff;
    border-bottom: 1px dashed #ccc;
  }
  .memberList div,.memberItem div{
    text-align: center;
  }
  .memberItem input[type='checkbox']{
    width: 18px;
    height: 18px;
    background-color: #fff;
    -webkit-appearance:none;
    border: 1px solid #c9c9c9;
    border-radius: 2px;
    outline: none;
    margin-top: 8px;
  }
.memberItem input[type=checkbox]:checked{
  background: url("../../static/img/checked1.png")no-repeat center;
}
.partItem input[type='checkbox'],.partItemLeader input[type='checkbox']{
  width: 18px;
  height: 18px;
  background-color: #fff;
  -webkit-appearance:none;
  border: 1px solid #c9c9c9;
  border-radius: 9px;
  outline: none;
  margin-top: 10px;
  float: left;
}
.partItem input[type=checkbox]:checked,.partItemLeader input[type=checkbox]:checked{
  background: url("../../static/img/checked.png")no-repeat center;
}
.partItem{
  height: 40px;
  color: #666;
  line-height: 40px;
  text-align: left;
  padding: 0 10px;
  font-size: 15px;
  font-family: '黑体';
  background-color: #fff;
  border-bottom: 1px dashed #ccc;
}
.partItem:last-of-type{
  border: none;
}
.next{
  float: right;
  color: #3a8ee6;
  font-size: 14px;
}
.partName{
  color: #888;
  height: 30px;
  font-size: 14px;
  font-family: '黑体';
  line-height: 30px;
  padding: 0 10px;
  text-align: left;
  background-color: #f5f5f5;
}
.partNav{
  color: #3a8ee6;
  height: 30px;
  font-size: 14px;
  font-family: '黑体';
  line-height: 30px;
  padding: 0 10px;
  text-align: left;
  background-color: #fff;
  overflow: scroll;
  overflow-x: scroll;
  white-space: nowrap;
}
.partNav span:last-of-type{
   color: #999;
   pointer-events: none;
 }
.partItemLeader{
  height: 40px;
  color: #666;
  line-height: 40px;
  text-align: left;
  padding: 0 10px;
  font-size: 15px;
  font-family: '黑体';
  background-color: #fff;
}
  .deletePeople{
    display: inline-block;
    height: 14px;
    width: 20px;
    line-height: 14px;
  }
  .clearAll{
    display: inline-block;
    height: 18px;
    width: 30px;
    line-height: 18px;
  }
</style>
