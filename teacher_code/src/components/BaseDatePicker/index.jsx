import React, { useEffect, useRef, useState } from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';
import { FORM_ITEM_TYPE } from '@/common/enum';

const { RangePicker } = DatePicker;

function isTimeStamp(t, formatTimeStamp) {
  return (t === 'date' || t === 'month' || t === 'year') && formatTimeStamp;
}

function formatTimeRange(values, type, p, formatTimeStamp) {
  if (!values) {
    return values;
  }
  if (type === FORM_ITEM_TYPE.DATE_RANGE.code) {
    let [startTime, endTime] = values || [];
    startTime = moment(isTimeStamp(p, formatTimeStamp) ? Number(startTime) : String(startTime));
    endTime = moment(isTimeStamp(p, formatTimeStamp) ? Number(endTime) : String(endTime));
    return [startTime, endTime];
  }
  return moment(isTimeStamp(p, formatTimeStamp) ? Number(values) : String(values));
}

/**
 * 禁止之前timeLimit年时间选择
 * @param {*} currentTime
 */
export function disabledDateBefore(currentTime, timeLimit = '-', disabledLimitUnit = 'years') {
  if (!timeLimit || timeLimit === '-') {
    return currentTime && currentTime < moment().startOf('day');
  }
  return (
    currentTime && currentTime < moment().subtract(timeLimit, disabledLimitUnit).startOf('day')
  );
}

/**
 * 禁止之后timeLimit年时间选择
 * @param {*} currentTime
 * @param {*} timeLimit
 */
export function disabledDateAfter(currentTime, timeLimit = '-', disabledLimitUnit = 'years') {
  if (timeLimit === '-') {
    return currentTime && currentTime > moment().endOf('day');
  }
  return currentTime && currentTime > moment().add(timeLimit, disabledLimitUnit).endOf('day');
}

const BaseDatePicker = React.memo(
  React.forwardRef(
    (
      {
        type = FORM_ITEM_TYPE.DATE_RANGE.code,
        format = 'YYYY-MM-DD',
        value,
        onChange,
        placeholder = '',
        picker = 'date',
        disabledBefore = false,
        disabledAfter = false,
        disabledAfterLimit = '-', // 禁止之后日期选择单位长度
        disabledBeforeLimit = '-', // 禁止之前日期选择单位长度
        disabledLimitUnit = 'years', // 时间禁止跨度单位
        style = { width: '100%' },
        formatTimeStamp = true, // 是否格式化为时间戳
        transferEndTime = true, // 是否转换为当天23:59:59
        ...rest
      },
      ref,
    ) => {
      const disableds = {
        disabledDate: (v) =>
          (disabledBefore && disabledDateBefore(v, disabledBeforeLimit, disabledLimitUnit)) ||
          (disabledAfter && disabledDateAfter(v, disabledAfterLimit, disabledLimitUnit)),
      };
      const [selectValue, setSelectValue] = useState(value);
      const [selectDateValue, setSelectDateValue] = useState(
        formatTimeRange(value, type, picker, formatTimeStamp),
      );
      const initRef = useRef(false);
      useEffect(() => {
        // 特殊处理清空的情况
        // if (value === null) {
        //   setSelectValue(null);
        //   setSelectDateValue(null);
        // }
        if (value && !selectValue) {
          setSelectDateValue(formatTimeRange(value, type, picker, formatTimeStamp));
          setSelectValue(value);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [value]);
      useEffect(() => {
        if (onChange && initRef.current) {
          onChange(selectValue);
        }
        initRef.current = true;
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [selectValue]);

      const handleTimeRangeChange = (dates, t, p) => {
        if (!dates) {
          setSelectDateValue(null);
          setSelectValue(null);
          return;
        }
        if (t === FORM_ITEM_TYPE.DATE_RANGE.code) {
          if (!(dates instanceof Array)) {
            setSelectDateValue(null);
            setSelectValue(null);
            return;
          }
          let [startTime, endTime] = dates || [];
          startTime = isTimeStamp(p, formatTimeStamp)
            ? transferEndTime
              ? moment(startTime).startOf('day').valueOf()
              : moment(startTime).valueOf()
            : moment(startTime).format(format);

          endTime = isTimeStamp(p, formatTimeStamp)
            ? transferEndTime
              ? moment(endTime).endOf('day').valueOf()
              : moment(endTime).valueOf()
            : moment(endTime).format(format);
          setSelectDateValue(dates);
          setSelectValue([startTime, endTime]);
          return;
        }
        let val = moment(dates).format(format);
        if (isTimeStamp(p, formatTimeStamp)) {
          val = transferEndTime ? moment(dates).endOf('day').valueOf() : moment(dates).valueOf();
        }
        setSelectDateValue(dates);
        setSelectValue(val);
      };

      if (type === FORM_ITEM_TYPE.DATE_RANGE.code) {
        return (
          <RangePicker
            format={format}
            placeholder={placeholder || ['开始日期', '结束日期']}
            value={selectDateValue}
            onChange={(v) => handleTimeRangeChange(v, type, picker)}
            ref={ref}
            picker={picker}
            style={style}
            {...disableds}
            {...rest}
          />
        );
      }

      return (
        <DatePicker
          format={format}
          value={selectDateValue}
          onChange={(v) => handleTimeRangeChange(v, type, picker)}
          placeholder={placeholder || '请选择日期'}
          ref={ref}
          picker={picker}
          style={style}
          {...disableds}
          {...rest}
        />
      );
    },
  ),
);

export default BaseDatePicker;
