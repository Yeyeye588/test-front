import { UAParser } from 'ua-parser-js';

/**
 * 获得浏览器版本和内核信息
 * @returns
 */
export function getBrowserInfo() {
  const uap = new UAParser();
  const engine = uap.getEngine() || {};
  const browser = uap.getBrowser() || {};
  let reseult = {
    visible: true, // 是否可进入系统
    engine,
    browser,
  };
  const engineVersion = Number(engine.version?.split('.')?.[0]);
  if (engine.name === 'Blink' && engineVersion < 88) {
    // blink内核 低版本 <=87
    reseult.visible = false;
  }
  if (browser.name === 'Safari' && browser.major < 14) {
    // safari 版本小于14
    reseult.visible = false;
  }
  if (browser.name === 'IE') {
    reseult.visible = false;
  }
  if (browser.name === 'Firefox' && browser.major < 78) {
    // Firefox版本<=77
    reseult.visible = false;
  }
  return reseult;
}
