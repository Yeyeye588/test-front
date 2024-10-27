import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import cs from 'classnames';
import { isFunction } from 'lodash';
import { originalCharacter, randomColor, randomNum } from './utils';

const Captcha = forwardRef(
  (
    {
      height = 40,
      width = 100,
      bgColor = '#DFF0D8',
      charNum = 4,
      fontSize = 25,
      onChange,
      onClick,
      className,
      onRef,
      code = '',
    },
    ref,
  ) => {
    const canvas = useRef(null);
    useEffect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      onRef && onRef(canvas);
    }, []);
    useImperativeHandle(ref, () => ({
      refresh() {
        canvas.current.click();
      },
    }));
    // 生成原始的数据
    const generateSourceCode = useCallback(() => {
      const array = [];
      if (code) {
        return code.split('');
      }
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < charNum; i++) {
        const temp = originalCharacter[randomNum(0, originalCharacter.length - 1)];
        array.push(temp);
      }
      return array;
    }, [code, charNum]);
    const generateCaptcha = useCallback(() => {
      let checkCode = '';
      if (canvas.current) {
        const ctx = canvas.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
          ctx.beginPath();
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, width, height);
          const sourceCode = generateSourceCode();
          // eslint-disable-next-line no-plusplus
          for (let i = 0; i < sourceCode.length; i++) {
            const charGap = Math.round(width / charNum);
            const offset = Math.round(charGap / 2) - 6;
            // eslint-disable-next-line no-shadow
            const code = sourceCode[i];
            checkCode += code;
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = 'white';
            ctx.strokeStyle = randomColor();
            ctx.font = `${fontSize}px serif`;
            ctx.rotate((Math.PI / 180) * randomNum(-5, 5));
            ctx.strokeText(code, offset + i * charGap, height / 2 + 8);
            // ctx.beginPath();
            // ctx.moveTo(randomNum(0, width), randomNum(0, height));
            // ctx.lineTo(randomNum(0, width), randomNum(0, height));
            // ctx.stroke();
            ctx.restore();
          }
          return checkCode;
        }
        return '';
      }
      return '';
    }, [code]);
    const handleClick = useCallback(() => {
      if (isFunction(onChange) && !code) {
        const captcha = generateCaptcha();
        onChange(captcha);
      }
      if (isFunction(onClick)) {
        onClick();
      }
    }, [onChange, code]);
    useEffect(() => {
      const captcha = generateCaptcha();
      if (isFunction(onChange) && !code) {
        onChange(captcha);
      }
    }, [code]);
    return (
      <canvas
        style={{ cursor: 'pointer' }}
        className={cs('react-captcha', className)}
        onClick={handleClick}
        height={height}
        width={width}
        ref={canvas}
      />
    );
  },
);
export default Captcha;
