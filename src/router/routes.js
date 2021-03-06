export default [
  {
    path: '/',
    redirect: '/recommend'
  },
  {
    path: '/recommend',
    name: 'recommend',
    component: () => import('@/views/Recommend.vue'),
    children: [
      {
        path: ':id',
        name: 'disc',
        component: () => import('@/views/Disc.vue')
      }
    ]
  },
  {
    path: '/rank',
    name: 'rank',
    component: () => import('@/views/Rank.vue'),
    children: [
      {
        path: ':id',
        name: 'rankDetail',
        component: () => import('@/views/Rank_Detail.vue')
      }
    ]
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/views/Search.vue'),
    children: [
      {
        path: ':id',
        name: 'singer_detail_2',
        component: () => import('@/views/Singer_Detail.vue')
      }
    ]
  },
  {
    path: '/singer',
    name: 'singer',
    component: () => import('@/views/Singer.vue'),
    children: [
      {
        path: ':id',
        name: 'singer_detail_1',
        component: () => import('@/views/Singer_Detail.vue')
      }
    ]
  },
  {
    path: '/user',
    name: 'user',
    component: () => import('@/views/User_Center.vue')
  }
]
