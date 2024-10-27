# 控制台模板

## 技术栈

- react 17
- [umi4](https://umijs.org/docs/tutorials/getting-started)
- [Ant Design Pro V5](https://pro.ant.design)
- antd 4.23.3
- node 14 及以上

## 安装

```bash
npm install
```

## 运行

```bash
npm start
```

## 打包

```bash
npm run build
```

## 项目架构

```js
├── config [配置文件]
│   ├── config.js [配置文件]
│   ├── defaultSettings.js [antd 全局配置]
│   ├── proxy.js [代理配置]
│   ├── routes.js [菜单路由]
│   └── routeHistory.js [路由监听方法]
├── mock [mock 数据]
├── public [公共资源]
├── src [主入口]
│   ├── assets [静态资源]
│   ├── common [公共配置]
│   │   ├── enum.js [枚举]
│   │   ├── pattern.js [正则]
│   │   └── project.js [业务方法]
│   ├── components [公共组件]（下方有详细说明）
│   ├── locales [语言设置]
│   ├── models [数据管理]
│   ├── pages [页面路由]
│   ├── services [api 服务]
│   └── utils [工具包]
│       ├── fileRequest.js [文件请求方法封装]
│       ├── form.js [表单处理]
│       ├── format.js [数据格式化]
│       ├── hooks.js [自定义 hook]
│       ├── menu.js [菜单权限相关配置]
│       ├── mgop.js [irs请求方法封装]
│       ├── query.js [地址参数出处理]
│       ├── request.js [请求相关配置（浙里办）]
│       └── utils.js [工具方法]
├── access.js [权限管理]
├── app.jsx [页面初始化，错误处理封装]
├── global.jsx [全局 js]
├── global.less [全局样式]
└── requestErrorConfig.js [数据请求拦截配置]
```

## 注意

1、模板项目接口请求时使用了本地的 mock 数据，实际开发过程中取消 mock 数据配置，需要在 `config.js` 修改配置为`mock: false`

2、获取用户信息等一些[全局依赖的基础数据](https://pro.ant.design/zh-CN/docs/initial-state)放在[initialState 全局初始化数据](https://pro.ant.design/zh-CN/docs/upgrade-v5#initialstate)中，初始化于`app.jsx`中的 `getInitialState`

3、[Layout](https://pro.ant.design/zh-CN/docs/layout#%E8%87%AA%E5%AE%9A%E4%B9%89%E5%B8%83%E5%B1%80)

- 配置位于`app.jsx`

- 单个页面不需要 layout 时，可在`config.js`中配置`layout:false`

- 也可以使用 v4 方法，在 layout 文件夹中自定义 layout

4、引入第三方 script

由于新版本移除了 document.ejs, 因此当需要引入第三方 js 时，需要在`config.js`中进行配置[headScripts](https://umijs.org/docs/api/config#headscripts)相关内容。

同理，配置 `<body>` 中额外的 script 标签，使用[script](https://umijs.org/docs/api/config#scripts)

5、umi4 中 props 默认为空对象，若要获取一下属性，可使用`usePageProps`

```js
// utils/hooks.js
/**
 * 获得页面参数
 * @returns {Object} { location, access, params, route, queryParams, history }
 */
export function usePageProps() {
  const location = useLocation();
  const access = useAccess();
  const params = useParams();
  const { route } = useRouteData();
  const queryParams = getPageQuery();
  return {
    location,
    access,
    params,
    route,
    queryParams,
    history,
  };
}
```

### components 组件库

|        目录        |                                   说明                                    |
| :----------------: | :-----------------------------------------------------------------------: |
|     ApplyItem      |                              用于渲染表单项                               |
|   BaseBreadcrumb   |                                  面包屑                                   |
|    BaseCascader    |                                级联选择器                                 |
|   BaseDatePicker   |                     时间组件(区间已经格式化为时间戳)                      |
| BaseDebounceSelect |                                防抖选择器                                 |
|   BasePopconfirm   |                              气泡确认框组件                               |
|      BasePwd       |                               修改密码表单                                |
|      Captcha       |                                  验证码                                   |
|    EmailSearch     |                              邮件输入提示框                               |
|     FileUpload     | [自定义上传组件](https://stackblitz.com/edit/react-pyqqmq?file=README.md) |
|   FormItemGroup    |                  带栅格的表单组，类似 ProForm.Group 功能                  |
|      MenuTree      |                             菜单权限配置组件                              |
|       Notice       |                               消息通知组件                                |
|    QuillEditer     |                               富文本编辑器                                |
|      TreeMap       |                             树级线性结构组件                              |
|     TreeGraph      |                                组织架构图                                 |
|   BaseStepsForm    |                               分布表单组件                                |
| BaseEditableTable  |                                可编辑表格                                 |
|      MapModal      |                          通过地址获取经纬度弹窗                           |

## [一、权限管理](https://pro.ant.design/zh-CN/docs/authority-management)

### 1.1 固定角色的不同菜单

在`src/access.js`和`config/route.js`中配置对应的角色菜单权限，如下所述

```js
// src/access.js
export default function access(initialState) {
  const { currentUser } = initialState || {};
  return {
    canAdmin: currentUser && currentUser.role === 'admin',
  };
}
```

```js
// config/route.js
export default [
  {
    path: '/welcome',
    component: './Welcome',
    name: 'welcome',
    access: 'canAdmin',
  },
];
```

### 1.2 动态菜单

更多配置可看：[入口](https://pro.ant.design/zh-CN/docs/advanced-menu)

关于菜单高亮，可以使用 parentKeys 属性，当前推荐还是有父子关系，包在 routes 里

```javascript
// config/route.js
export default [
  {
    path: '/product',
    hideInMenu: true,
    name: '产品管理',
  },
  {
    path: '/list/:id',
    hideInMenu: true,
    name: '列表详情',
    parentKeys: ['/product'],
  },
];
```

> routes 可配置项

```ts
export interface Setting {
  /**
   * @name false 时不展示顶栏
   */
  headerRender?: false;
  /**
   * @name false 时不展示页脚
   */
  footerRender?: false;
  /**
   * @name false 时不展示菜单
   */
  menuRender?: false;
  /**
   * @name false 时不展示菜单顶栏
   */
  menuHeaderRender?: false;

  /**
   * @name 固定顶栏
   **/
  fixedHeader: boolean;

  /**
   * @name 固定菜单
   */
  fixSiderbar: boolean;

  /**
   * @name theme for nav menu
   * @name 导航菜单的主题
   */
  navTheme: 'dark' | 'light' | 'realDark' | undefined;
  /**
   * @name nav menu position: `side` or `top`
   * @name 导航菜单的位置
   * @description side 为正常模式，top菜单显示在顶部，mix 两种兼有, false 不展示
   */
  layout: 'side' | 'top' | 'mix' | false;
  /**
   * @name 顶部导航的主题，mix 模式生效
   */
  headerTheme: 'dark' | 'light';
}
```

#### 1.2.1 菜单权限配置

- `utils/menu.js`中配置菜单树（包括非菜单页面的操作权限）

   注意：

  1、key 必须唯一

  2、若节点非菜单页面，key 的格式为 对应页面的 key.操作类型（基本操作类型已在枚举中定义）

  3、例：用户管理页面（account）的新增按钮的 key 为 `account.${ACTION_TYPE.ADD.code}`

  ```js
  export const MENU_TREE = [
    {
      key: 'templates',
      title: '应用模板',
      isShow: (props) => true, // TODO 自定义判断方法
      isDisabled: (props) => false, // TODO 自定义判断方法
      children: [
        {
          key: 'list',
          title: '列表应用',
          isShow: (props) => true,
          isDisabled: (props) => false,
        },
        {
          key: 'form',
          title: '表单应用',
          isShow: (props) => true,
          isDisabled: (props) => false,
        },
      ],
    },
    {
      key: 'account',
      title: '用户管理',
      isShow: (props) => true,
      isDisabled: (props) => false,
      children: [
        {
          key: `account.${ACTION_TYPE.ADD.code}`,
          title: '新增',
          isShow: (props) => true,
          isDisabled: (props) => false,
        },
        {
          key: `account.${ACTION_TYPE.UPDATE.code}`,
          title: '修改',
          isShow: (props) => true,
          isDisabled: (props) => false,
        },
        {
          key: `account.${ACTION_TYPE.DELETE.code}`,
          title: '删除',
          isShow: (props) => true,
          isDisabled: (props) => false,
        },
      ],
    },
  ];
  ```

- 使用菜单权限配置组件`@/components/MenuTree`给不同的用户配置菜单权限（具体使用可见`@/pages/Account`）

#### 1.2.2 路由和菜单的权限控制

- `config/route.js`中配置与上方`utils/menu.js`中相对应的 menuKey 和用于权限控制的权限名称

  ```js
  export default [
    ...{
      path: '/account',
      name: '用户管理',
      icon: 'crown',
      component: './Account',
      menuKey: 'account', // 唯一menuKey配置
      access: 'normalRouteFilter', // 权限名称配置
    },
  ];
  ```

- 在`access.js`文件中加对应的路由判断方法

  ```js
  normalRouteFilter: (route) => {
    // 用以判断用户是否拥有路由权限
    return currentUser?.hasRoutesKeys?.includes(route.menuKey);
  };
  ```

  > 如果不需要动态菜单权限控制，可以在 routes 里配置 authority:['admin','user']这样的用户角色，然后 access 方法判断的是 route.authority.includes(user.role)

- 获取动态菜单数据

  `app.jsx`文件`getInitialState`中调接口（一般是用户用户信息接口）获取动态菜单数据并处理

  ```js
  import { defaultKeys } from '@/utils/menu';

  export async function getInitialState() {
    const fetchUserInfo = async () => {
      try {
        const msg = await fetchProfile({
          skipErrorHandler: true,
        });
        const info = msg.data;
        // 获取动态菜单数据
        info.hasRoutesKeys = info?.menuData || defaultKeys;
        return info;
      } catch (error) {
        history.push(loginPath);
      }
      return undefined;
    };

    ...
  }
  ```

#### 1.2.3 页面内的权限控制

- 在`access.js`文件中加对应的权限判断方法

  ```js
  canOperate: (routeKey, operateKey) => {
    return currentUser?.hasRoutesKeys?.includes(`${routeKey}.${operateKey}`);
  };
  ```

- 通过 `useAccess` hook 来获取权限定义， `Access` 组件用于页面的元素显示和隐藏的控制

  ```jsx
  // import { useAccess, useRouteData } from '@umijs/max';
  import { usePageProps } from '@/utils/hooks';

  export default function Account() {

    // const access = useAccess();
    // const { route } = useRouteData();

    // 页面中常用的获取路由、权限等hook封装在了usePageProps中  可直接使用该hook
    const { route = {}, access = {} } = usePageProps();
    ...

    return {
      ...
      // 方法一：直接控制显隐
      <Access accessible={access.canOperate(route.menuKey, ACTION_TYPE.ADD.code)}>
        <Button
          type="primary"
          onClick={() => {...}}
          >
          <PlusOutlined /> 新增用户
        </Button>
      </Access>

      // 方法二：事件触发后做提示
      <Button
        type="primary"
        onClick={() => {
          if (access.canOperate(route.menuKey, ACTION_TYPE.ADD.code)) {
            ...
          } else {
            message.error(`暂无${ACTION_TYPE.ADD.desc}权限`)
          }
        }}
        >
        <PlusOutlined /> 新增用户
      </Button>
      ...
    }
  }

  ```

### 1.3 分组菜单

1. 在 config/defaultSetting 下，menu 的 type 改为 group 分组类型
2. routes 配置，需要分组的在对应路由下加 group:'groupName'

```
  {
    path: '/templates',
    name: '应用模板',
    icon: 'StepForwardOutlined',
    key: 'templates',
    access: 'normalRouteFilter',
    group: '应用类型',
    routes: [
      {
        path: '/templates',
        redirect: '/templates/list',
      },
      {
        path: '/templates/list',
        name: '列表应用',
        component: './Templates/List',
        key: 'list',
        access: 'normalRouteFilter',
      },
      {
        path: '*',
        component: './404',
      },
    ],
  },
```

### 1.4 子菜单显示 icon

在 routes 里进行配置 icon，开启 showIcon: true。

> 需注意，这里只支持 iconfont 和 antdv4 之后的 icon

```
  {
    path: '/templates/list',
    name: '列表应用',
    component: './Templates/List',
    icon: 'StepForwardOutlined', // iconfont: icon-xxx
    showIcon: true,
    key: 'list',
    access: 'normalRouteFilter',
  },
```

### 1.5 自定义菜单

**效果**

一级菜单置于顶部展示，鼠标悬浮在一级菜单上展示其子级所有菜单

**使用配置**

defaultSettings.js

```js
 menu: {
    type: 'group', // sub 菜单 / group 分组菜单
    custom: true, // 自定义菜单
  },
```

routes.js

给对应的菜单配置 group

```js
		{
        path: '/templates/list',
        name: '列表应用',
        group: '应用',
        component: './Templates/List',
        menuKey: 'list',
        access: 'normalRouteFilter',
    },
    ...
```

**自定义效果开发**

可在 app.jsx 中对`MenuItem`的 dom 进行修改

## 二、接口请求

- `src/services`文件夹中配置需要的接口方法有一些更改

  ```js
  export async function fetchLogin(params, options) {
    return request(`${HOST}/v1/auth/login`, {
      method: 'POST',
      data: params,
      ...(options || {}),
    });
  }
  ```

  options 可传`skipErrorHandler: true`，用于跳过默认的错误处理

- 接口请求错误处理迁移到`src/requestErrorConfig.js`,这边非正常业务码都会用异常来捕获

```
 // 响应拦截器
  responseInterceptors: [
    (response) => {
      // 拦截响应数据，进行个性化处理
      const { data: res } = response;
      if (res?.code !== SUCCESS_CODE) {
        throw res;
      }
      return response;
    },
  ],
```

- 当数据仅在单页面使用时，可以直接使用 useRequest

  ```js
  import { useRequest } from '@umijs/max';
  import { changeUsername } from '@/services/api';

  export default () => {
    const { run, loading } = useRequest(changeUsername, { manual: true });

    return (
      <Button onClick={() => run('new name')} loading={loading}>
        Edit
      </Button>
    );
  };
  ```

### [useRequest](https://umijs.org/docs/max/request#userequest) 和 [useModel](https://umijs.org/docs/max/data-flow) 结合的简易数据流

当数据需要持久化时，可以使用该方法

1、`src/services`文件夹中配置需要的接口

2、model 中配置对应的 useRequest 接口请求，返回的数据 data，loading 及请求方法等放入 model 中（可参考`models/tableList`）

- 若不需要处理数据，可直接使用 useRequest 解构出来的 data
- 若需要处理数据，可以在 onSuccess 进行数据存储，也可以直接通过 formatResult 进行数据处理,数据处理好后 data 就是处理后的数据

需注意，onSuccess 成功回调拿到的直接是 data 里的数据，而 formatResult(成功时调用）拿到的是整个{code, data}的对象

```js
import { message } from 'antd';
import { useRequest } from '@umijs/max';
import { fetchRuleList } from '@/services/api';

export default () => {
  const {
    run: fetchTableList,
    data: tableList,
    loading: tableLoading,
  } = useRequest((v) => fetchRuleList(v), {
    manual: true,
    onSuccess: (res) => res,
    onError: (res) => {
      message.error(res?.message || '请求失败');
    },
    // 数据处理
    formatResult: ({ data: res }) => {
      const arr = res?.items.map((item, index) => ({
        ...item,
        enabled: index % 2 === 0,
      }));
      return {
        ...res,
        items: arr,
      };
    },
  });

  return { fetchTableList, tableLoading, tableList };
};
```

3、使用时用 useModel 来获取 （具体使用可参考`src/page/Application/Table`）

```js
const { fetchTableList, tableLoading, tableList } = useModel('tableList');
```

4、useModel 提供给第二个参数来做缓存依赖，但是每个都写又会加剧代码工作量，所以在 utils/hooks 里封装了 useMemoModel

```
/**
 * useModel depths 缓存
 * @param {*} model
 * @param {*} depthsArr 需要返回的参数名，多层级用.分割，如['tableList', 'account.currentUser']
 * @param {*} flattern 多层级是否扁平化
 * @returns
 * @example
 * const {tableList, currentUser = {}} = useMemoModel('user',['tableList','account.currentUser'])
 */
export function useMemoModel(model, depthsArr = [], flattern = true) {
  const props = useModel(model, (m) => {
    const tmp = {};
    depthsArr.forEach((v) => {
      const [k0, ...keys] = v?.split('.');
      if (!keys.length) {
        tmp[k0] = m[k0];
      }
      keys.forEach((k) => {
        if (flattern) {
          tmp[k] = m[k0][k];
          return;
        }
        tmp[k0][k] = m[k0][k];
      });
    });
    return tmp;
  });
  return props;
}
```

## 三、路由

### 3.1 路由跳转

同 umi3 一样，支持 history 方法跳转。由于 umi4 不再支持 props 传递 route props，只提供 hook 来进行调用，所以在 utils/hooks 里封装了 usePageProps

```
/**
 * 获得页面参数
 * @returns {Object}
 * { location, access: 权限, params: path参数,queryParams: query参数, route: 当前页面路由, history: history跳转方法, navigate: 路由组件跳转 }
 */
export function usePageProps() {
  const location = useLocation();
  const access = useAccess();
  const params = useParams();
  const { route } = useRouteData();
  const navigate = useNavigate();
  const queryParams = getPageQuery();
  return {
    location,
    access,
    params,
    route,
    queryParams,
    history,
    navigate
  };
}
```

我们可以在页面里进行调用

```javascript
// /detail/2?type=1
const Detail = () => {
  const {
    location, // 不带publicPath的地址信息
    access, // 权限
    params,
    route,
    queryParams,
    history,
    navigate,
  } = usePageProps();
  console.log(params); // {id: 2}
  console.log(queryParams); // {type: 1}

  // 页面跳转支持两种
  // push
  history.push('/check');
  navigate('/check');

  // replace
  history.replace('/check');
  navigate('/check', { replace: true });

  // back
  history.goBack();
  navigate(-1);
};
```

**这里推荐使用 navigate 进行跳转，但注意，navigate 只支持在组件内使用。**

navigate 特效：

- 支持相对路径

```
// 当前路径 /admin/account/list
navigate('../detail') // 等同于 /admin/account/detail
navigate('../../detail') // 等同于 /admin/detail
```

- 支持将参数放在 state 里进行传递，且页面刷新并不会影响【**路径复制新开窗口，相关 state 无法获得，重要参数请放路径**】

```
navigate('/admin/account/detail', {
    state: {
        type: 2
    }
})

// Detail.jsx
const { location } = usePageProps();
console.log(location.state) // {type: 2}

```

### 3.2 面包屑

在 components 里封装了 BaseBreadCrumb 面包屑组件，支持：当前窗口内，点击面包屑某一级菜单，会去匹配路由历史最近的一次地址。

如：从/list?pageSize=20 跳转进详情，点击面包屑返回出来依旧携带参数

```
// 支持在ProLayout、PageContainer使用
<PageContainer
    breadcrumbRender={({ breadcrumb: { routes } }) => {
        return <BaseBreadcrumb breadcrumb={routes} />;
      }}
/>
```

## 四、插件

### 4.1 fast-code-create

> vscode 商店插件，用来快速将 swagger 接口生成对应请求代码

1. 在 vscode 商店搜索 'fast-code-create' 插件进行安装 ![](https://gitee.com/xiaomoziyi/blogImage/raw/master/img/20230213145344.png)

2. 安装完毕之后在当前项目的根目录右键， 查看菜单中 点击 打开 CodeCreate 设计器。 ![](https://gitee.com/xiaomoziyi/blogImage/raw/master/img/20230213145321.png)

3. 打开后会在项目右侧打开一个新视图。 ![](https://gitee.com/xiaomoziyi/blogImage/raw/master/img/20230213145356.png)

4. 打开设计器后，需要上传 swagger-data 以及 options
5. swagger-data 的 json 为 swagger 后端的 api.json
6. options 可以点击下载默认 options 然后进行编辑修改

7. 完成以后，可以选择勾选相应的 api，再点击批量生成 api，即可再 src/service/api.js 生成相应 api ![](https://gitee.com/xiaomoziyi/blogImage/raw/master/img/20230213145253.png)

8. 也可以选择单个页面生成，支持列表以及详情表单实例生成。其中 componentsPath 为生成的目录路径,默认生成在 src/pages 下，需要以/开头.jsx 结尾例如 /2.jsx 或者 /user/login.jsx。按钮 isCreate 表示是否生成文件，否则仅仅生成 api ![](https://gitee.com/xiaomoziyi/blogImage/raw/master/img/20230213145333.png)

### 4.2 Apifox

> mock 工具，提供本地、云端模式环境，支持接口调用、接口高级 mock 规则等功能

使用文档：[入口](http://thoughts.hyperchain.cn:8099/workspaces/5d4b89ddbe825b1e266e05b8/files/63a2d8d8be825b00016e5646)
