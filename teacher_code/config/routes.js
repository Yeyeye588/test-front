export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user/login',
        component: './User/Login',
      },
    ],
  },
  {
    path: '/first',
    name: '初审',
    menuKey: 'first',
    access: 'normalRouteFilter',
    hideChildrenInMenu: true,
    routes: [
      {
        path: '/first',
        redirect: '/first/list',
      },
      {
        path: '/first/list',
        component: './Ticket/FirstList',
      },
    ],
  },
  {
    path: '/second',
    name: '复审',
    menuKey: 'second',
    access: 'normalRouteFilter',
    hideChildrenInMenu: true,
    routes: [
      {
        path: '/second',
        redirect: '/second/list',
      },
      {
        path: '/second/list',
        component: './Ticket/SecondList',
      },
    ],
  },
  {
    path: '/ticket',
    name: '我的金票',
    menuKey: 'ticket',
    access: 'normalRouteFilter',
    hideChildrenInMenu: true,
    routes: [
      {
        path: '/ticket',
        redirect: '/ticket/list',
      },
      {
        path: '/ticket/list',
        component: './Ticket/List',
      },
      {
        path: '/ticket/list/create',
        name: '添加申请',
        component: './Ticket/Create',
      },
      {
        path: '/ticket/list/confirm',
        name: '开票确权',
        component: './Ticket/Confirm',
      },
      {
        path: '/ticket/list/sign',
        name: '签收',
        component: './Ticket/Sign',
      },
      {
        path: '/ticket/list/first',
        name: '初审',
        component: './Ticket/First',
      },
      {
        path: '/ticket/list/second',
        name: '复审',
        component: './Ticket/Second',
      },
      {
        path: '/ticket/list/transfer',
        name: '转让',
        component: './Ticket/Transfer',
      },
      {
        path: '/ticket/list/transferSign',
        name: '转让签收',
        component: './Ticket/TransferSign',
      },
      {
        path: '/ticket/list/finance',
        name: '融资',
        component: './Ticket/Finance',
      },
      {
        path: '/ticket/list/loan',
        name: '放款',
        component: './Ticket/Loan',
      },
      {
        path: '/ticket/list/pay',
        name: '收款',
        component: './Ticket/Pay',
      },
      {
        path: '/ticket/list/detail',
        name: '详情',
        component: './Ticket/Detail',
      },
    ],
  },
  {
    path: '/',
    redirect: '/user/login',
  },
  {
    path: '*',
    component: './404',
  },
];
