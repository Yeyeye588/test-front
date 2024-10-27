import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { message, Upload } from 'antd';
import request from '@/utils/request';
import { getDefaultPreFileUrl } from '../FileUpload/fileUtils';
import styles from './index.less';

const defaultFormats = [
  'background',
  'bold',
  'color',
  'font',
  'code',
  'italic',
  'link',
  'size',
  'strike',
  'underline',
  'blockquote',
  'header',
  'indent',
  'list',
  'align',
  'direction',
  'code-block',
  'image',
  'video',
];

const defaultUploadConfig = {
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
const QuillEditer = React.forwardRef(
  (
    {
      modules,
      formats = defaultFormats,
      height = '300px',
      value,
      onChange = () => {},
      useApi = false,
      uploadId = 'upload-img',
      uploadConfig,
    },
    ref,
  ) => {
    const [inputValue, setInputValue] = useState('');
    const uploadRef = useRef();
    const quillRef = useRef();
    const modulesConfig = useMemo(
      () => ({
        toolbar: {
          container: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ size: ['small', false, 'large', 'huge'] }],
            [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
            [{ align: [] }],
            [{ color: [] }, { background: [] }],
            [{ font: [] }],
            ['link'],
            ['image'],
          ],
          handlers: useApi
            ? {
                image(value) {
                  if (value) {
                    const dom = document.getElementById(uploadId);
                    dom?.click();
                  }
                },
              }
            : {},
          ...(modules?.toolbar || {}),
        },
        ...(modules || {}),
      }),
      [useApi, modules, uploadId],
    );

    useImperativeHandle(ref, () => ({
      getEditor: () => quillRef.current?.getEditor(),
      quillRef: quillRef.current,
    }));

    const uploadFileConfig = useMemo(
      () => ({
        ...defaultUploadConfig,
        ...(uploadConfig || {}),
      }),
      [uploadConfig],
    );
    useEffect(() => {
      if (value && !inputValue) {
        setInputValue(value);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const beforeUpload = (file) => {
      const isLimited = file.size / 1024 / 1024 <= uploadFileConfig.size;
      if (!isLimited) {
        message.error(`所选图片过大，请上传${uploadFileConfig.size}M以内图片`);
        return false;
      }
      return true;
    };

    const uploadHandler = (param) => {
      const { onError, file } = param;
      const {
        action,
        reqFileMap = {},
        resFileMap = {},
        getPreFileUrl = () => {},
        previewPrefixAction,
      } = uploadFileConfig;
      const fmData = new FormData();
      const config = {
        headers: { 'content-type': 'multipart/form-data' },
      };
      if (!file) {
        return false;
      }
      fmData.append(reqFileMap.file, file);
      fmData.append(reqFileMap[reqFileMap.fileName], file.name);
      request(action, {
        method: 'POST',
        data: fmData,
        config,
      })
        .then((res) => {
          if (res && res.code === SUCCESS_CODE) {
            const { data = {} } = res;
            const quill = quillRef?.current?.getEditor(); // 获取到编辑器本身
            const cursorPosition = quill.getSelection()?.index; // 获取当前光标位置
            const url =
              data?.[resFileMap.fileUrl] ||
              getPreFileUrl(data?.[resFileMap.fileKey], previewPrefixAction);
            quill.insertEmbed(cursorPosition, 'image', url); // 插入图片
            quill.setSelection(cursorPosition + 1); // 光标位置加1
            return;
          }
          const err = new Error(res?.message || '上传失败');
          onError({ err });
        })
        .catch(() => {
          const err = new Error('上传失败');
          onError({ err });
        });
      return true;
    };

    return (
      <div className={styles.myEditor}>
        <ReactQuill
          ref={quillRef}
          modules={modulesConfig}
          formats={formats}
          value={inputValue}
          onChange={(v) => {
            setInputValue(v);
            onChange(v);
          }}
          style={{ '--height': height }}
        />
        <Upload
          ref={uploadRef}
          id={uploadId}
          name="image"
          accept="image/*"
          showUploadList={false}
          beforeUpload={beforeUpload}
          customRequest={(param) => uploadHandler(param)}
        >
          <button type="button" className="control-item button upload-button">
            插入图片
          </button>
        </Upload>
      </div>
    );
  },
);

export default React.memo(QuillEditer);
