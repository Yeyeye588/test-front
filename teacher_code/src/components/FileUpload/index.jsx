/* eslint-disable no-param-reassign */

/* eslint-disable no-unused-vars */
import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { Upload, Button, message, Tooltip, Modal } from 'antd';
import ImgCrop from 'antd-img-crop';
import { InboxOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import defaultRequest from '@/utils/request';
import ApplyItem from '../ApplyItem';
import {
  CROP_PROPS,
  getAcceptTypes,
  getDefaultPreFileUrl,
  getFileUrlByBase64,
  isZip,
  previewFile,
  PREVIEW_TYPE,
  UPLOAD_TYPE,
  validateFileType,
} from './fileUtils';
import styles from './index.less';

const { Dragger } = Upload;

/**
 * 文件转成base64
 * @param {*} file
 * @returns
 */
function parseFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

const LOCAL = 'LOCAL'; // 本地文件
const FileUpload = forwardRef(
  (
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
      limitSize = 2,
      tooltipTitle = '支持扩展名：.jpg .jpeg .png .pdf', // 上传类型提示
      suffix = true, // 是否使用文件类型后缀
      text = '点击上传',
      domProps = {}, // dom 元素属性
      previewPrefixAction = '/api/v1/file/preview', // 预览路径
      extraParams = {}, // 上传文件其他参数
      id,
      getPreFileUrl = getDefaultPreFileUrl,
      request = defaultRequest,
      onSuccessCallback = () => {}, // 文件上传成功数据回调
      manual = false, // 是否默认执行， manual 为true则不会默认执行
      resFileMap = {
        // 响应映射
        fileName: 'fileName',
        fileKey: 'fileKey',
      },
      reqFileMap = {
        // 文件请求数据映射
        file: 'file',
        fileName: 'fileName',
      },
      unZipFile = false, // 解压压缩包
      imgCropProps = {}, // 图片裁剪属性
      crop = false, // 是否裁剪
      transferBlob = false, // 文件转码
      previewType = PREVIEW_TYPE.PREVIEW.code,
      children,
      readonly = false,
      renderText,
      ...props
    },
    ref,
  ) => {
    const uploadRef = useRef();
    const [fileList, setFileList] = useState(value || []);
    const [fileKeysList, setFileKeysList] = useState(value || []);
    const strClass = classNames(styles.myUpload, className);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImg, setPreviewImg] = useState({ title: '', image: '' });

    const fileListRef = useRef(value || []);

    const triggerChange = (list) => {
      setFileKeysList(list);
      return onChange && onChange(list);
    };

    /**
     * 删除
     * @param {*} file
     */
    const handleRemove = (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      const newFileKeysList = fileKeysList.filter((item) => item.uid !== file.uid);
      newFileList.splice(index, 1);
      triggerChange(newFileKeysList);
      fileListRef.current = newFileList;
      setFileList(newFileList);
    };

    useImperativeHandle(ref, () => ({
      fileList,
      setFileList: (val) => {
        setFileKeysList(val);
        fileListRef.current = val;
        setFileList(val);
      },
      onRemove: handleRemove,
    }));

    useEffect(() => {
      if (fileList.length === 0 && value instanceof Array && value.length > 0) {
        setFileKeysList(value);
        fileListRef.current = value;
        setFileList(value);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const beforeUploadImgLimit = (file, fList, limit = 5) => {
      const limitType = validateFileType(accept, file, suffix);
      if (!limitType) {
        message.error('请按照正确格式上传');
        return false;
      }
      const isLimited = file.size / 1024 / 1024 < limit;
      if (!isLimited) {
        message.error(`请上传${limit}MB以下的文件`);
        return false;
      }
      if (fileLen > 1) {
        const disLen = fileList.length + fList.length - fileLen;
        const restLen = fileLen - fileList.length;
        const newfList = fList.slice(restLen);
        if (disLen > 0 && newfList.includes(file)) {
          message.error(`最多上传${fileLen}份文件`);
          return false;
        }
        if (manual) {
          triggerChange([...fileList, file]);
          fileListRef.current = [...fileList, file];
          setFileList([...fileList, file]);
          return false;
        }
        if (transferBlob) {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
              resolve(reader.result);
            };
            // reader.onerror = (error) => reject(error);
          });
        }
        return true;
      }
      if (manual) {
        triggerChange([...fileList, file]);
        fileListRef.current = [...fileList, file];
        setFileList([...fileList, file]);
        return false;
      }

      if (transferBlob) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            resolve(reader.result);
          };
          // reader.onerror = (error) => reject(error);
        });
      }
      return true;
    };

    /**
     * 文件上传
     * @param {*} info
     */
    const handleChange = (info) => {
      const { file } = info;
      let { fileList: infoFileList } = info;
      if (fileListRef.current && fileListRef.current.length > 0) {
        infoFileList = infoFileList.map((item, index) => {
          if (item.uid === file.uid) {
            return file;
          }
          return fileListRef.current[index] || item;
        });
      }
      let fList = [];
      if (fileLen === 1) {
        fList = infoFileList.slice(-1);
        fList = fList.filter((f) => !!f.status);
      } else {
        fList = infoFileList.filter((f) => !!f.status);
      }
      if (!file.status) {
        return;
      }
      fList.forEach((f, index) => {
        if (f.status === 'done' && f.response && f.response.code === SUCCESS_CODE) {
          const { data } = f.response;
          if (isZip(f) && unZipFile) {
            // 压缩文件进行解压
            const { list = [] } = data || {};
            fList.splice(index, 1);
            if (list instanceof Array && list.length > 0) {
              list.forEach((item) => {
                fList.push({
                  key: item?.[resFileMap.fileKey],
                  name: item?.[resFileMap.fileName],
                  uid: item?.uid || item?.[resFileMap.fileKey],
                  url: getPreFileUrl(item?.[resFileMap.fileKey], previewPrefixAction),
                  status: 'done',
                  unZip: true,
                });
              });
            }
            return;
          }
          const moreDatKeysInfo = {};
          fList[index] = {
            ...fList[index],
            // 此处进行特殊操作,把返回回来的所有数据都加进入返回的内容
            ...data,
            key: data?.[resFileMap.fileKey],
            url: fList[index]?.originFileObj
              ? LOCAL
              : getPreFileUrl(data?.[resFileMap.fileKey], previewPrefixAction),
            unZip: false,
          };
        }
      });
      const fKeys = [];
      fList.forEach((f) => {
        const hasRes = f && f.response && f.response.code === SUCCESS_CODE;
        if (f.status === 'done' && f.unZip) {
          fKeys.push({
            ...f,
            key: f.key,
            name: f.name,
            uid: f.uid,
            url: f.url,
            status: 'done',
            unZip: true,
          });
          return;
        }
        if (hasRes && f.status === 'done' && !f.unZip) {
          fKeys.push({
            ...f,
            key: f.key,
            name: f.name,
            uid: f.uid,
            url: f.url,
            status: 'done',
            unZip: false,
          });
        }
      });
      fileListRef.current = fList;
      setFileList(fList);
      if (file && file.status === 'done') {
        triggerChange(fKeys);
      }
    };

    /**
     * 自定义上传
     * @param {*} options
     */
    const handleCustomUpload = async (options) => {
      const { onSuccess, onError, file } = options;
      const fmData = new FormData();
      const config = {
        headers: { 'content-type': 'multipart/form-data' },
      };
      const payload = {};
      if (transferBlob) {
        config.headers = {
          'content-type': 'application/json',
        };
        payload[reqFileMap.file] = await parseFileToBase64(file);
        payload[reqFileMap.fileName] = file.name;
        Object.keys(extraParams).forEach((key) => {
          payload[key] = extraParams[key];
        });
      }
      fmData.append(reqFileMap.file, file);
      fmData.append(reqFileMap[reqFileMap.fileName], file.name);
      Object.keys(extraParams).forEach((key) => {
        fmData.append(key, extraParams[key]);
      });
      const fileAction = isZip(file) && unZipFile ? unZipAction : action;
      if (ignoreAction) {
        const res = await request({
          method: 'POST',
          processData: transferBlob,
          data: transferBlob ? payload : fmData,
          config,
        });
        if (res && res.code === SUCCESS_CODE) {
          message.success('上传成功');
          onSuccess(res);
          onSuccessCallback(res);
        } else {
          const err = new Error('上传失败');
          onError({ err });
          message.error('上传失败');
        }
        return;
      }
      // eslint-disable-next-line consistent-return
      return request(fileAction, {
        method: 'POST',
        processData: transferBlob,
        data: transferBlob ? payload : fmData,
        config,
      })
        .then((res) => {
          if (res && res.code === SUCCESS_CODE) {
            message.success('上传成功');
            onSuccess(res);
            onSuccessCallback(res);
          } else {
            const err = new Error(res?.message || '上传失败');
            onError({ err });
            message.error(res?.message || '上传失败');
          }
        })
        .catch(() => {
          const err = new Error('上传失败');
          onError({ err });
          message.error('上传失败');
        });
    };

    const handleImgPreview = async (file) => {
      let { url } = file;
      if (!url || url === LOCAL) {
        const base64 = await parseFileToBase64(file.originFileObj);
        url = getFileUrlByBase64(base64);
      }
      setPreviewVisible(true);
      setPreviewImg({
        title: file.name,
        image: url,
      });
    };

    const handleCancel = () => setPreviewVisible(false);

    const handleUploadPreview = async (file) => {
      let { url } = file;
      if (!url || url === LOCAL) {
        const base64 = await parseFileToBase64(file.originFileObj);
        url = getFileUrlByBase64(base64);
      }
      return previewFile(url, file.name, previewType);
    };

    const uploadProps = {
      action: (f) => (isZip(f) && unZipFile ? unZipAction : action),
      name: 'file',
      multiple: fileLen > 1,
      withCredentials: true,
      fileList,
      accept: getAcceptTypes(accept, suffix),
      beforeUpload: (file, fList) => beforeUploadImgLimit(file, fList, limitSize),
      onChange: handleChange,
      onRemove: handleRemove,
      disabled,
      customRequest: customUpload ? handleCustomUpload : null,
      maxCount: fileLen,
      onPreview: handleUploadPreview,
      ...props,
    };

    if (readonly) {
      if (renderText && typeof renderText === 'function') {
        return renderText(value);
      }
      return <ApplyItem value={value} type="file" />;
    }

    if (uploadType === UPLOAD_TYPE.DRAG.code) {
      return (
        <Dragger {...uploadProps} style={style} ref={uploadRef}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或将文件拖拽到这里上传</p>
          <p className="ant-upload-hint">{tooltipTitle}</p>
        </Dragger>
      );
    }

    const ImgUpload = (
      <Upload listType="picture-card" {...uploadProps} onPreview={handleImgPreview}>
        {fileList.length >= fileLen || disabled ? null : (
          <div
            style={{
              height: 104,
              width: 104,
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
            {...domProps}
          >
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>{text}</div>
          </div>
        )}
      </Upload>
    );

    if (uploadType === UPLOAD_TYPE.PICTURE.code) {
      return (
        <div className={strClass} id={id}>
          {crop ? (
            <ImgCrop rotate grid {...CROP_PROPS} {...imgCropProps}>
              {ImgUpload}
            </ImgCrop>
          ) : (
            ImgUpload
          )}

          <Modal
            open={previewVisible}
            title={previewImg.title}
            footer={null}
            onCancel={handleCancel}
          >
            <img alt="预览图片" style={{ width: '100%' }} src={previewImg.image} />
          </Modal>
        </div>
      );
    }

    if (uploadType === UPLOAD_TYPE.TEXT.code) {
      return (
        <Upload {...uploadProps} {...props} style={style} ref={uploadRef}>
          <a {...domProps}>
            {icon} {text}
          </a>
        </Upload>
      );
    }

    if (uploadType === UPLOAD_TYPE.CUSTOM.code) {
      return (
        <div className={strClass} id={id}>
          <Upload {...uploadProps} style={style} ref={uploadRef}>
            {children}
          </Upload>
        </div>
      );
    }

    return (
      <div className={strClass} id={id}>
        <Upload {...uploadProps} style={style} ref={uploadRef}>
          <Tooltip placement="top" title={tooltipTitle}>
            <Button block={false} disabled={disabled} {...domProps}>
              {icon} {text}
            </Button>
          </Tooltip>
        </Upload>
      </div>
    );
  },
);

export default FileUpload;
