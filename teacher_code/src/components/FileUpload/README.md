# 文件上传组件

### 一、参数

```javascript
    {
      value = [],
      onChange = () => {},
      fileLen = 1, // 文件个数
      uploadType = UPLOAD_TYPE.BUTTON.code, // 上传渲染类型
      icon = <UploadOutlined />,
      customUpload = false, // 是否自定义上传
      ignoreAction = false, // 忽略上传路径则直接传入调用api
      style,
      className,
      disabled = false,
      action = '/api/v1/file/upload', // 上传路径
      unZipAction = '/api/v1/file/upload', // 解压压缩包路径
      accept = ['jpg', 'jpeg', 'png', 'pdf'], // 支持文件类型,传空数组则不限制类型
      limitSize = 2048,
      tooltipTitle = '支持扩展名：.jpg .jpeg .png .pdf', // 上传类型提示
      suffix = true, // 是否使用文件类型后缀
      text = '点击上传',
      domProps = {}, // dom 元素属性
      previewPrefixAction = '/api/v1/file/preview', // 预览路径
      extraParams = {}, // 上传文件其他参数
      id,
      getPreFileUrl = getDefaultPreFileUrl,
      request = () => {
        return Promise.resolve();
      },
      onSuccessCallback = () => {}, // 文件上传成功数据回调
      manual = false, // 是否默认执行， manual 为true则不会默认执行
      resFileMap = {
        // 响应映射
        fileName: 'fileName',
        fileKey: 'fileKey',
      },
      reqFileMap = {
        //文件请求数据映射
        file: 'file',
        fileName: 'fileName',
      },
      unZipFile = false, // 解压压缩包
      imgCropProps = {}, // 图片裁剪属性
      crop = false, // 是否裁剪
      transferBlob = false, // 文件转码
      previewType = PREVIEW_TYPE.PREVIEW.code,
      children,
      readonly,
      renderText = (value) => {}, // readonly为true，只读模式自定义渲染
      ...props
    }
```

其中通用参数：

```md
- fileLen
- action
- disabled
- previewPrefixAction
- accept
- limitSize
- tooltipTitle
- uploadType // dom 渲染类型【支持图片、拖拽、按钮、自定义】
- getPreFileUrl 如果不传为 previewPrefixAction?fileKey={fileKey}
- ...props 剩余 upload 自带属性
```

a. 如果需要图片裁剪，传入:

```javascript
{
  imgCropProps: {}, // 图片裁剪属性
  crop: true,
}
```

注意版本，如果 antd 是 4.x 版本，antd-img-crop 使用 4.2.0

b. 如果需要支持压缩包解压上传,需传入:

```
{
  unZipAction,
  unZipFile: true,
}
```

这里需要注意：

返回格式规范为：

```
{
  code: 0,
  data: {
    list: [{
      fileKey,
      fileName,
      uid, // 如有就传一下，作为唯一标识
    }],
  },
  message: 'success',
}
```

c. 如果需要自定义上传，一定要传入

```javascript
{
  customUpload: true,
  request,
}
```

d. 如果想直接调用某个具体的 api,而不是通用的 request 请求，就加上

```javascript
{
  customUpload: true,
  request,
  ingnoreAction: true
}
```

此时 request 需传入具体请求 api

### 二、 接口规范参考

[mock 接口](https://www.apifox.cn/apidoc/shared-e26d68ad-c281-467f-9fc4-8634cd731b2a)

### 三、demo

详细场景可参考[demo](https://react-pyqqmq.stackblitz.io/)

### 四、util 方法

- previewFile(fileUrl, fileName, previewType = PREVIEW_TYPE.DOWNLOAD.code) 预览文件 [pdf/图片直接打开，其他选择下载]
- downloadFileByBase64(base64, fileName, suffix = true) [base64 转 blobUrl 下载]
- downloadFile(url, fileName) [文件下载]
