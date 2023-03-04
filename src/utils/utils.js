export function getUrlParams(url) {
  url = window.location.href;
  // 通过 ? 分割获取后面的参数字符串
  let urlStr = url.split('?')[1];
  if (!urlStr) return {};
  // 创建空对象存储参数
  let obj = {};
  // 再通过 & 将每一个参数单独分割出来
  let paramsArr = urlStr.split('&');
  for (let i = 0, len = paramsArr.length; i < len; i++) {
    // 再通过 = 将每一个参数分割为 key:value 的形式
    let arr = paramsArr[i].split('=');
    obj[arr[0]] = arr[1];
  }
  return obj;
}

/**
 * 获取cookie
 */
export function getCookie(name) {
  var arr,
    reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
  if ((arr = document.cookie.match(reg))) {
    return unescape(arr[2]);
  } else {
    return null;
  }
}

/**
 * 对象深度拷贝
 */

export function deepClone(obj) {
  //判断拷贝的要进行深拷贝的是数组还是对象，是数组的话进行数组拷贝，对象的话进行对象拷贝
  var objClone = Array.isArray(obj) ? [] : {};
  //进行深拷贝的不能为空，并且是对象或者是
  if (obj && typeof obj === 'object') {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (obj[key] && typeof obj[key] === 'object') {
          objClone[key] = deepClone(obj[key]);
        } else {
          objClone[key] = obj[key];
        }
      }
    }
  }
  return objClone;
}

export function size2Str(size) {
  if (size < 1024) {
    return size + 'B';
  } else if (size >= 1024 && size < Math.pow(1024, 2)) {
    return parseFloat(size / 1024).toFixed(2) + 'KB';
  } else if (size >= Math.pow(1024, 2) && size < Math.pow(1024, 3)) {
    return parseFloat(size / Math.pow(1024, 2)).toFixed(2) + 'MB';
  } else if (size > Math.pow(1024, 3)) {
    return parseFloat(size / Math.pow(1024, 3)).toFixed(2) + 'GB';
  } else {
    return 0 + 'B';
  }
}

/**
 *
 * @param } url
 * @returns
 * @reject 1: 地址为空
 *         2：地址不符合规则
 * @resolve true: 地址有效
 *          false: 地址无效
 */
// 验证地址有效性
export function checkUrl(url) {
  const promise = new Promise((resolve, reject) => {
    if (!url) {
      reject(1);
      return;
    }
    if (!/http[s]{0,1}:\/\/([\w.]+\/?)\S*/.test(url)) {
      reject(2);
      return;
    }
    $.ajax({
      url: url,
      type: 'GET',
      dataType: 'jsonp', //跨域采用jsonp方式
      complete: (response) => {
        if (response.status == 200) resolve(true);
        else resolve(false);
      },
    });
  });
  return promise;
}

/**
 * Validates a cron expression.
 *
 * @param cronExpression The expression to validate
 * @return True is expression is valid
 */
export function cronValidate(cronExpression) {
  //alert("校验函数的开始！");
  var cronParams = cronExpression.split(' ');

  if (cronParams.length < 6 || cronParams.length > 7) {
    return false;
  }

  //CronTrigger cronTrigger = new CronTrigger();
  //cronTrigger.setCronExpression( cronExpression );

  if (cronParams[3] == '?' || cronParams[5] == '?') {
    //Check seconds param
    if (!checkSecondsField(cronParams[0])) {
      return false;
    }

    //Check minutes param
    if (!checkMinutesField(cronParams[1])) {
      return false;
    }

    //Check hours param
    if (!checkHoursField(cronParams[2])) {
      return false;
    }

    //Check day-of-month param
    if (!checkDayOfMonthField(cronParams[3])) {
      return false;
    }

    //Check months param
    if (!checkMonthsField(cronParams[4])) {
      return false;
    }

    //Check day-of-week param
    if (!checkDayOfWeekField(cronParams[5])) {
      return false;
    }

    //Check year param
    if (cronParams.length == 7) {
      if (!checkYearField(cronParams[6])) {
        return false;
      }
    }

    return true;
  } else {
    return false;
  }
}

function checkSecondsField(secondsField) {
  return checkField(secondsField, 0, 59);
}

function checkField(secondsField, minimal, maximal) {
  if (secondsField.indexOf('-') > -1) {
    var startValue = secondsField.substring(0, secondsField.indexOf('-'));
    var endValue = secondsField.substring(secondsField.indexOf('-') + 1);

    if (
      !(
        checkIntValue(startValue, minimal, maximal, true) &&
        checkIntValue(endValue, minimal, maximal, true)
      )
    ) {
      return false;
    }
    try {
      var startVal = parseInt(startValue, 10);
      var endVal = parseInt(endValue, 10);

      return endVal > startVal;
    } catch (e) {
      return false;
    }
  } else if (secondsField.indexOf(',') > -1) {
    return checkListField(secondsField, minimal, maximal);
  } else if (secondsField.indexOf('/') > -1) {
    return checkIncrementField(secondsField, minimal, maximal);
  } else if (secondsField.indexOf('*') != -1) {
    return true;
  } else {
    return checkIntValue(secondsField, minimal, maximal);
  }
}

function checkIntValue(value, minimal, maximal, checkExtremity) {
  try {
    var val = parseInt(value, 10);
    //判断是否为整数
    if (value == val) {
      if (checkExtremity) {
        if (val < minimal || val > maximal) {
          return false;
        }
      }

      return true;
    }

    return false;
  } catch (e) {
    return false;
  }
}

function checkMinutesField(minutesField) {
  return checkField(minutesField, 0, 59);
}

function checkHoursField(hoursField) {
  return checkField(hoursField, 0, 23);
}

function checkDayOfMonthField(dayOfMonthField) {
  if (dayOfMonthField == '?') {
    return true;
  }

  if (dayOfMonthField.indexOf('L') >= 0) {
    return checkFieldWithLetter(dayOfMonthField, 'L', 1, 7, -1, -1);
  } else if (dayOfMonthField.indexOf('W') >= 0) {
    return checkFieldWithLetter(dayOfMonthField, 'W', 1, 31, -1, -1);
  } else if (dayOfMonthField.indexOf('C') >= 0) {
    return checkFieldWithLetter(dayOfMonthField, 'C', 1, 31, -1, -1);
  } else {
    return checkField(dayOfMonthField, 1, 31);
  }
}

function checkMonthsField(monthsField) {
  /*        monthsField = StringUtils.replace( monthsField, "JAN", "1" );
      monthsField = StringUtils.replace( monthsField, "FEB", "2" );
      monthsField = StringUtils.replace( monthsField, "MAR", "3" );
      monthsField = StringUtils.replace( monthsField, "APR", "4" );
      monthsField = StringUtils.replace( monthsField, "MAY", "5" );
      monthsField = StringUtils.replace( monthsField, "JUN", "6" );
      monthsField = StringUtils.replace( monthsField, "JUL", "7" );
      monthsField = StringUtils.replace( monthsField, "AUG", "8" );
      monthsField = StringUtils.replace( monthsField, "SEP", "9" );
      monthsField = StringUtils.replace( monthsField, "OCT", "10" );
      monthsField = StringUtils.replace( monthsField, "NOV", "11" );
      monthsField = StringUtils.replace( monthsField, "DEC", "12" );*/

  monthsField.replace('JAN', '1');
  monthsField.replace('FEB', '2');
  monthsField.replace('MAR', '3');
  monthsField.replace('APR', '4');
  monthsField.replace('MAY', '5');
  monthsField.replace('JUN', '6');
  monthsField.replace('JUL', '7');
  monthsField.replace('AUG', '8');
  monthsField.replace('SEP', '9');
  monthsField.replace('OCT', '10');
  monthsField.replace('NOV', '11');
  monthsField.replace('DEC', '12');

  return checkField(monthsField, 1, 31);
}

function checkDayOfWeekField(dayOfWeekField) {
  /*        dayOfWeekField = StringUtils.replace( dayOfWeekField, "SUN", "1" );
      dayOfWeekField = StringUtils.replace( dayOfWeekField, "MON", "2" );
      dayOfWeekField = StringUtils.replace( dayOfWeekField, "TUE", "3" );
      dayOfWeekField = StringUtils.replace( dayOfWeekField, "WED", "4" );
      dayOfWeekField = StringUtils.replace( dayOfWeekField, "THU", "5" );
      dayOfWeekField = StringUtils.replace( dayOfWeekField, "FRI", "6" );
      dayOfWeekField = StringUtils.replace( dayOfWeekField, "SAT", "7" );*/

  dayOfWeekField.replace('SUN', '1');
  dayOfWeekField.replace('MON', '2');
  dayOfWeekField.replace('TUE', '3');
  dayOfWeekField.replace('WED', '4');
  dayOfWeekField.replace('THU', '5');
  dayOfWeekField.replace('FRI', '6');
  dayOfWeekField.replace('SAT', '7');

  if (dayOfWeekField == '?') {
    return true;
  }

  if (dayOfWeekField.indexOf('L') >= 0) {
    return checkFieldWithLetter(dayOfWeekField, 'L', 1, 7, -1, -1);
  } else if (dayOfWeekField.indexOf('C') >= 0) {
    return checkFieldWithLetter(dayOfWeekField, 'C', 1, 7, -1, -1);
  } else if (dayOfWeekField.indexOf('#') >= 0) {
    return checkFieldWithLetter(dayOfWeekField, '#', 1, 7, 1, 5);
  } else {
    return checkField(dayOfWeekField, 1, 7);
  }
}

function checkYearField(yearField) {
  return checkField(yearField, 1970, 2099);
}

function checkFieldWithLetter(
  value,
  letter,
  minimalBefore,
  maximalBefore,
  minimalAfter,
  maximalAfter
) {
  var canBeAlone = false;
  var canHaveIntBefore = false;
  var canHaveIntAfter = false;
  var mustHaveIntBefore = false;
  var mustHaveIntAfter = false;

  if (letter == 'L') {
    canBeAlone = true;
    canHaveIntBefore = true;
    canHaveIntAfter = false;
    mustHaveIntBefore = false;
    mustHaveIntAfter = false;
  }
  if (letter == 'W' || letter == 'C') {
    canBeAlone = false;
    canHaveIntBefore = true;
    canHaveIntAfter = false;
    mustHaveIntBefore = true;
    mustHaveIntAfter = false;
  }
  if (letter == '#') {
    canBeAlone = false;
    canHaveIntBefore = true;
    canHaveIntAfter = true;
    mustHaveIntBefore = true;
    mustHaveIntAfter = true;
  }

  var beforeLetter = '';
  var afterLetter = '';

  if (value.indexOf(letter) >= 0) {
    beforeLetter = value.substring(0, value.indexOf(letter));
  }

  if (!value.endsWith(letter)) {
    afterLetter = value.substring(value.indexOf(letter) + 1);
  }

  if (value.indexOf(letter) >= 0) {
    if (letter == value) {
      return canBeAlone;
    }

    if (canHaveIntBefore) {
      if (mustHaveIntBefore && beforeLetter.length == 0) {
        return false;
      }

      if (!checkIntValue(beforeLetter, minimalBefore, maximalBefore, true)) {
        return false;
      }
    } else {
      if (beforeLetter.length > 0) {
        return false;
      }
    }

    if (canHaveIntAfter) {
      if (mustHaveIntAfter && afterLetter.length == 0) {
        return false;
      }

      if (!checkIntValue(afterLetter, minimalAfter, maximalAfter, true)) {
        return false;
      }
    } else {
      if (afterLetter.length > 0) {
        return false;
      }
    }
  }

  return true;
}

/*    function checkIntValue(value, minimal, maximal) {
      return checkIntValue(value, minimal, maximal, true);
  } */

function checkIncrementField(value, minimal, maximal) {
  var start = value.substring(0, value.indexOf('/'));

  var increment = value.substring(value.indexOf('/') + 1);

  if (!('*' == start)) {
    return (
      checkIntValue(start, minimal, maximal, true) &&
      checkIntValue(increment, minimal, maximal, false)
    );
  } else {
    return checkIntValue(increment, minimal, maximal, true);
  }
}

function checkListField(value, minimal, maximal) {
  var st = value.split(',');

  var values = new Array(st.length);

  for (var j = 0; j < st.length; j++) {
    values[j] = st[j];
  }

  var previousValue = -1;

  for (var i = 0; i < values.length; i++) {
    var currentValue = values[i];

    if (!checkIntValue(currentValue, minimal, maximal, true)) {
      return false;
    }

    try {
      var val = parseInt(currentValue, 10);

      if (val <= previousValue) {
        return false;
      } else {
        previousValue = val;
      }
    } catch (e) {
      // we have always an int
    }
  }

  return true;
}

// cron - second valid
export function cronSecondValid(rule, value, callback) {
  // eslint-disable-next-line
  const Reg =
    /^(([1-5]?[0-9]\/[1-5]?[0-9])|(\*)|([1-5]?[0-9]\-[1-5]?[0-9])|([1-5]?[0-9])|([1-5]?[0-9](,[1-5]?[0-9])*))$/;
  if (value === '*') {
    callback(new Error('秒不能填*'));
    return;
  }
  if (!value) {
    callback(new Error('请填写秒'));
    return;
  }
  if (!Reg.test(value)) {
    callback(new Error('秒填写有误'));
    return;
  }
  callback();
}

// cron - minute valid
export function cronMinuteValid(rule, value, callback) {
  // eslint-disable-next-line
  const Reg =
    /^(([1-5]?[0-9]\/[1-5]?[0-9])|(\*)|([1-5]?[0-9]\-[1-5]?[0-9])|([1-5]?[0-9])|([1-5]?[0-9](,[1-5]?[0-9])*))$/;
  if (!value) {
    callback(new Error('请填写分'));
    return;
  }
  if (!Reg.test(value)) {
    callback(new Error('分填写有误'));
    return;
  }
  callback();
}

// cron - hour valid
export function cronHourValid(rule, value, callback) {
  // eslint-disable-next-line
  const Reg =
    /^((([0-9]|[1][0-9]|[2][0-3])\/([0-9]|[1][0-9]|[2][0-3]))|(\*)|(([0-9]|[1][0-9]|[2][0-3])\-([0-9]|[1][0-9]|[2][0-3]))|([0-9]|[1][0-9]|[2][0-3])|(([0-9]|[1][0-9]|[2][0-3])(,([0-9]|[1][0-9]|[2][0-3]))*))$/;
  if (!value) {
    callback(new Error('请填写时'));
    return;
  }
  if (!Reg.test(value)) {
    callback(new Error('时填写有误'));
    return;
  }
  callback();
}
// cron - day valid
export function cronDayValid(rule, value, callback) {
  // eslint-disable-next-line
  const Reg =
    /^(((([0-2]?[0-9])|[3][0-1]))|(((([0-2]?[0-9])|[3][0-1]))\/(([0-2]?[0-9])|[3][0-1]))|(((([0-2]?[0-9])|[3][0-1]))\-(([0-2]?[0-9])|[3][0-1]))|((([0-2]?[0-9])|[3][0-1])W)|((([0-2]?[0-9])|[3][0-1])(,(([0-2]?[0-9])|[3][0-1])))|(L)|(\?)|(\*))$/;
  if (!value) {
    callback(new Error('请填写日'));
    return;
  }
  if (!Reg.test(value)) {
    callback(new Error('日填写有误'));
    return;
  }
  callback();
}
// cron - month valid
export function cronMonthValid(rule, value, callback) {
  // eslint-disable-next-line
  const Reg =
    /^((([0-9]|[1][0-2]))|(([0-9]|[1][0-2])\-([0-9]|[1][0-2]))|(([0-9]|[1][0-2])\/([0-9]|[1][0-2]))|(([0-9]|[1][0-2])(,([0-9]|[1][0-2])))|(\*))$/;
  if (!value) {
    callback(new Error('请填写月'));
    return;
  }
  if (!Reg.test(value)) {
    callback(new Error('月填写有误'));
    return;
  }
  callback();
}
// cron - week valid
export function cronWeekValid(rule, value, callback) {
  // eslint-disable-next-line
  const Reg =
    /^(([1-7]\-[1-7])|([1-4]\#[1-7])|([1-7]L)|([1-7](,[1-7])*)|(\?)|(\*))$/;
  if (!value) {
    callback(new Error('请填写周'));
    return;
  }
  if (!Reg.test(value)) {
    callback(new Error('周填写有误'));
    return;
  }
  callback();
}
// cron - year valid
export function cronYearValid(rule, value, callback) {
  // eslint-disable-next-line
  const Reg =
    /^(([1][9][0-9][0-9]|[2][0][0-9][0-9])|(([1][9][0-9][0-9]|[2][0][0-9][0-9])\-([1][9][0-9][0-9]|[2][0][0-9][0-9]))|(([1][9][0-9][0-9]|[2][0][0-9][0-9])(,([1][9][0-9][0-9]|[2][0][0-9][0-9]))*)|(\?)|(\*))$/;
  if (!value) {
    callback(new Error('请填写年'));
    return;
  }
  if (!Reg.test(value)) {
    callback(new Error('年填写有误'));
    return;
  }
  callback();
}

export function checkRuleEventLogic(list, fieldName) {
  const curList = fieldName
    ? list.filter((item) => item.outputparams === fieldName)
    : list;
  let max = null;
  let min = null;
  curList.forEach((item) => {
    if (item.operator === '>') {
      min = Number(item.value);
    }
    if (item.operator === '<') {
      max = Number(item.value);
    }
  });
  if (max !== null && min !== null && min >= max) {
    return false;
  }
  return true;
}
