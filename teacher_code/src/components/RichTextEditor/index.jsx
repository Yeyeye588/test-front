/* eslint-disable react-hooks/exhaustive-deps */
import React, { useImperativeHandle, useMemo, useRef, useState, useEffect } from 'react';
import { message } from 'antd';
import BraftEditor from 'braft-editor';
import 'braft-editor/dist/index.css';
import request from '@/utils/request';
import styles from './index.less';
import { buildPreviewHtml, defaultUploadConfig } from './util';

/**
 * braft-edior 富文本编辑器封装
 * 组件属性：https://www.yuque.com/braft-editor/be/gz44tn
 * 需注意，formItem的value为实例，如需给到后端，需调用toRAW或者toHTML方法
 */
const RichTextEditor = React.forwardRef(
  (
    {
      value,
      onChange = () => {},
      useApi = false, // 是否接口上传使用资源url
      uploadConfig,
      placeholder = '请输入',
      height = '200px',
      ...props
    },
    ref,
  ) => {
    const [inputValue, setInputValue] = useState(BraftEditor.createEditorState(''));

    const editorRef = useRef();
    useImperativeHandle(ref, () => ({
      editorRef: editorRef.current,
    }));

    const uploadFileConfig = useMemo(
      () => ({
        ...defaultUploadConfig,
        ...(uploadConfig || {}),
      }),
      [uploadConfig],
    );

    useEffect(() => {
      if (value && (!inputValue || inputValue.isEmpty())) {
        if (typeof value === 'string') {
          setInputValue(BraftEditor.createEditorState(value));
          return;
        }
        setInputValue(value);
      }
    }, [value]);

    useEffect(() => {
      inputValue && onChange(inputValue);
    }, [inputValue]);

    const beforeUpload = (file) => {
      const isLimited = file.size / 1024 / 1024 <= uploadFileConfig.size;
      if (!isLimited) {
        message.error(`所选图片过大，请上传${uploadFileConfig.size}M以内图片`);
        return false;
      }
      return true;
    };

    const uploadHandler = (param) => {
      const { file } = param;
      if (!file) {
        return false;
      }
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
            const url =
              data?.[resFileMap.fileUrl] ||
              getPreFileUrl(data?.[resFileMap.fileKey], previewPrefixAction);
            param.success({
              url,
            });
            return;
          }
          param.error({
            msg: res?.message || '上传失败',
          });
        })
        .catch(() => {
          param.error({
            msg: '上传失败',
          });
        });
    };

    const preview = () => {
      if (window.previewWindow) {
        window.previewWindow.close();
      }
      window.previewWindow = window.open();
      window.previewWindow.document.write(buildPreviewHtml(inputValue));
      window.previewWindow.document.close();
    };

    const extendControls = [
      {
        key: 'custom-button',
        type: 'button',
        text: '预览',
        onClick: preview,
      },
    ];

    const uploadProps = useApi
      ? {
          media: {
            uploadFn: uploadHandler,
            validateFn: beforeUpload,
            externals: {
              embed: false,
              image: true,
              video: true,
              audio: true,
              ...(props?.media?.externals || {}),
            },
            ...(props?.media || {}),
          },
        }
      : {};

    return (
      <div className={styles.editor}>
        <BraftEditor
          ref={editorRef}
          value={inputValue}
          onChange={setInputValue}
          extendControls={extendControls}
          placeholder={placeholder}
          contentStyle={{
            height,
          }}
          {...props}
          {...uploadProps}
        />
      </div>
    );
  },
);

export default React.memo(RichTextEditor);
