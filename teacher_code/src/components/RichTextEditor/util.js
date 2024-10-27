import { getDefaultPreFileUrl } from '../FileUpload/fileUtils';

// 预览
export function buildPreviewHtml(editor) {
  return `
    <!Doctype html>
    <html>
      <head>
        <title>Preview Content</title>
        <style>
          html,body{
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: auto;
            background-color: #f1f2f3;
          }
          .container{
            box-sizing: border-box;
            width: 1000px;
            max-width: 100%;
            min-height: 100%;
            margin: 0 auto;
            padding: 30px 20px;
            overflow: hidden;
            background-color: #fff;
            border-right: solid 1px #eee;
            border-left: solid 1px #eee;
          }
          .container img,
          .container audio,
          .container video{
            max-width: 100%;
            height: auto;
          }
          .container p{
            white-space: pre-wrap;
            min-height: 1em;
            margin: 0;
          }
          .container pre{
            padding: 15px;
            background-color: #f1f1f1;
            border-radius: 5px;
          }
          .container blockquote{
            margin: 0;
            padding: 15px;
            background-color: #f1f1f1;
            border-left: 3px solid #d1d1d1;
          }
          .media-wrap.image-wrap.float-left {
            margin: 0 10px 0 0;
          }
          .media-wrap.image-wrap.float-right {
            margin: 0 0 0 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">${editor.toHTML()}</div>
      </body>
    </html>
  `;
}

// 默认上传设置
export const defaultUploadConfig = {
  action: '/api/v1/file/upload',
  size: 10,
  reqFileMap: {
    // 文件请求数据映射
    file: 'file',
    fileName: 'fileName',
  },
  resFileMap: {
    // 响应映射
    fileName: 'fileName',
    fileKey: 'fileKey',
    fileUrl: 'url',
  },
  getPreFileUrl: getDefaultPreFileUrl,
  previewPrefixAction: '/api/v1/file/preview', // 预览路径
};
