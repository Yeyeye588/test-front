## SwitchTabs 多页签

### 功能效果

1、基本的多页签展示及切换功能

2、页签切换保留位置与数据

3、刷新浏览器，页签依旧保留

4、可配置项（关闭页签/刷新浏览器时的提示、是否可关闭页签、是否打开新页签）

5、右键菜单（关闭选中标签、关闭右侧标签页、关闭其他标签页）

### 使用（开启多页签模式）

defaultSettings.js 配置

```js
{
  ...,
  multipleTabs: true, // 开启多页签模式
}
```

routes.js 配置

```js
{
  ...
  {
    path: '/templates/step-form',
    name: '分步表单',
    // group: '应用',
    component: './Templates/StepForm',
    menuKey: 'step',
    access: 'normalRouteFilter',
    // 多页签相关配置
    tabProps: {
      closeTip: true, // 关闭页签/刷新浏览器时的提示，默认为false
    },
  },
  ...
}
```

### tabProps 配置

| 参数     | 说明                        | 默认值 |
| -------- | --------------------------- | ------ |
| closeTip | 关闭页签/刷新浏览器时的提示 | false  |
| openNew  | 是否打开新页签              | true   |
| closable | 页签是否可关闭              | true   |
| skipNew  | 跳转其他页面时打开新 tab    | true   |
