import { message } from 'antd';
import html2pdf from 'html2pdf.js';
import { downloadFileByBase64 } from '@/components/FileUpload/fileUtils';

/**
 * dom转成pdf下载
 * @param {*} dom dom内容
 * @param {*} fileName 文件名
 * @param {*} config html2pdf 配置项, 查看：https://ekoopmans.github.io/html2pdf.js/
 * @param {*} callback pdf base64回调
 * @param {boolean} download 是否下载
 */
export function downloadHtml2pdf(
  dom,
  fileName = '文件.pdf',
  config = {},
  callback = () => {},
  download = true,
) {
  let hide = '';
  if (download) {
    hide = message.loading(`${fileName}开始下载...`, 0);
  }
  const pdfWorder = html2pdf()
    .set({
      image: { type: 'jpeg', quality: 1 },
      filename: fileName,
      html2canvas: { scale: 2, allowTaint: true },
      pagebreak: { mode: 'avoid-all', after: '.avoidThisRow' },
      enableLinks: true,
      margin: [8, 0, 8, 0],
      ...config,
    })
    .from(dom)
    .toPdf();

  if (download) {
    pdfWorder.save();
  }

  pdfWorder.outputPdf('datauristring').then((res) => {
    if (download) {
      hide();
      message.success(`${fileName}下载完成`);
    }
    callback(res);
  });
}

/**
 * dom转成长图下载
 * @param {*} dom dom内容
 * @param {*} fileName 文件名
 * @param {*} config html2pdf 配置项, 查看：https://ekoopmans.github.io/html2pdf.js/
 * @param {*} callback img base64回调
 * @param {boolean} download 是否下载
 */
export function downloadHtml2Img(
  dom,
  fileName = '文件.jpeg',
  config = {},
  callback = () => {},
  download = true,
) {
  let hide = '';
  if (download) {
    hide = message.loading(`${fileName}开始下载...`, 0);
  }
  const pdfWorder = html2pdf()
    .set({
      image: { type: 'jpeg', quality: 1 },
      filename: fileName,
      html2canvas: { scale: 2, allowTaint: true },
      margin: [8, 0, 8, 0],
      ...config,
    })
    .from(dom)
    .toImg();
  pdfWorder.outputImg('datauristring').then((res) => {
    if (download) {
      downloadFileByBase64(res, fileName, false);
      hide();
      message.success(`${fileName}下载完成`);
    }
    callback(res);
  });
}
