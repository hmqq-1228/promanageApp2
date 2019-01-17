import Vue from 'vue'
import Router from 'vue-router'
import myTaskListPage from '@/components/myTaskListPage'
import projectListPage from '@/components/projectListPage'
import myCreatProjectPage from '@/components/myCreatProjectPage'
import dataManagePage from '@/components/dataManagePage'
import projectModelList from '@/components/projectModelList'
import addNewProject from '@/components/addNewProject'
import addNewSchedule from '@/components/addNewSchedule'
import scheduleDetail from '@/components/scheduleDetail'
import projectDetailPage from '@/components/projectDetailPage'
import taskDetailPage from '@/components/taskDetailPage'
import decompositionTask from '@/components/decompositionTask'
import addNewModelProject from '@/components/addNewModelProject'
import addNewPlanOrTask from '@/components/addNewPlanOrTask'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/myTaskListPage',
      name: 'myTaskListPage',
      component: myTaskListPage
    },
    {
      path: '/',
      name: 'projectListPage',
      component: projectListPage
    },
    {
      path: '/myCreatProjectPage',
      name: 'myCreatProjectPage',
      component: myCreatProjectPage
    },
    {
      path: '/decompositionTask/:tId',
      name: 'decompositionTask',
      component: decompositionTask
    },
    {
      path: '/dataManagePage',
      name: 'dataManagePage',
      component: dataManagePage
    },
    {
      path: '/projectModelList',
      name: 'projectModelList',
      component: projectModelList
    },
    {
      path: '/addNewProject',
      name: 'addNewProject',
      component: addNewProject
    },
    {
      path: '/addNewSchedule',
      name: 'addNewSchedule',
      component: addNewSchedule
    },
    {
      path: '/scheduleDetail/:sId',
      name: 'scheduleDetail',
      component: scheduleDetail
    },
    {
      path: '/projectDetailPage/:pid',
      name: 'projectDetailPage',
      component: projectDetailPage
    },
    {
      path: '/taskDetailPage/:uid',
      name: 'taskDetailPage',
      component: taskDetailPage
    },
    {
      path: '/addNewModelProject/:mId',
      name: 'addNewModelProject',
      component: addNewModelProject
    },
    {
      path: '/addNewPlanOrTask',
      name: 'addNewPlanOrTask',
      component: addNewPlanOrTask
    }
  ]
})
