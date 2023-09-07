import { setTime as utilSetTime } from "../utils/timeUtil";
export default function useTimeSelection(_ref) {
  var value = _ref.value,
    generateConfig = _ref.generateConfig,
    disabledMinutes = _ref.disabledMinutes,
    disabledSeconds = _ref.disabledSeconds,
    minutes = _ref.minutes,
    seconds = _ref.seconds,
    use12Hours = _ref.use12Hours;
  var setTime = function setTime(isNewPM, newHour, newMinute, newSecond) {
    var now = generateConfig.getNow();
    var newDate = value || now;
    var mergedHour = newHour < 0 ? generateConfig.getHour(now) : newHour;
    var mergedMinute = newMinute < 0 ? generateConfig.getMinute(now) : newMinute;
    var mergedSecond = newSecond < 0 ? generateConfig.getSecond(now) : newSecond;
    var newDisabledMinutes = disabledMinutes && disabledMinutes(mergedHour);
    if (newDisabledMinutes !== null && newDisabledMinutes !== void 0 && newDisabledMinutes.includes(mergedMinute)) {
      // find the first available minute in minutes
      var availableMinute = minutes.find(function (i) {
        return !newDisabledMinutes.includes(i.value);
      });
      if (availableMinute) {
        mergedMinute = availableMinute.value;
      } else {
        return null;
      }
    }
    var newDisabledSeconds = disabledSeconds && disabledSeconds(mergedHour, mergedMinute);
    if (newDisabledSeconds !== null && newDisabledSeconds !== void 0 && newDisabledSeconds.includes(mergedSecond)) {
      // find the first available second in seconds
      var availableSecond = seconds.find(function (i) {
        return !newDisabledSeconds.includes(i.value);
      });
      if (availableSecond) {
        mergedSecond = availableSecond.value;
      } else {
        return null;
      }
    }
    newDate = utilSetTime(generateConfig, newDate, !use12Hours || !isNewPM ? mergedHour : mergedHour + 12, mergedMinute, mergedSecond);
    return newDate;
  };
  return setTime;
}