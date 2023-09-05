"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _react = _interopRequireWildcard(require("react"));
var _classnames = _interopRequireDefault(require("classnames"));
var _rcMotion = require("rc-motion");
var _Notice = _interopRequireDefault(require("./Notice"));
var _NotificationProvider = require("./NotificationProvider");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
var NoticeList = function NoticeList(props) {
  var configList = props.configList,
    placement = props.placement,
    prefixCls = props.prefixCls,
    className = props.className,
    style = props.style,
    motion = props.motion,
    onAllNoticeRemoved = props.onAllNoticeRemoved,
    onNoticeClose = props.onNoticeClose;
  var _useContext = (0, _react.useContext)(_NotificationProvider.NotificationContext),
    ctxCls = _useContext.classNames;
  var keys = configList.map(function (config) {
    return {
      config: config,
      key: config.key
    };
  });
  var placementMotion = typeof motion === 'function' ? motion(placement) : motion;
  return /*#__PURE__*/_react.default.createElement(_rcMotion.CSSMotionList, (0, _extends2.default)({
    key: placement,
    className: (0, _classnames.default)(prefixCls, "".concat(prefixCls, "-").concat(placement), ctxCls === null || ctxCls === void 0 ? void 0 : ctxCls.list, className),
    style: style,
    keys: keys,
    motionAppear: true
  }, placementMotion, {
    onAllRemoved: function onAllRemoved() {
      onAllNoticeRemoved(placement);
    }
  }), function (_ref, nodeRef) {
    var config = _ref.config,
      motionClassName = _ref.className,
      motionStyle = _ref.style;
    var _ref2 = config,
      key = _ref2.key,
      times = _ref2.times;
    var _ref3 = config,
      configClassName = _ref3.className,
      configStyle = _ref3.style;
    return /*#__PURE__*/_react.default.createElement(_Notice.default, (0, _extends2.default)({}, config, {
      ref: nodeRef,
      prefixCls: prefixCls,
      className: (0, _classnames.default)(motionClassName, configClassName, ctxCls === null || ctxCls === void 0 ? void 0 : ctxCls.notice),
      style: (0, _objectSpread2.default)((0, _objectSpread2.default)({}, motionStyle), configStyle),
      times: times,
      key: key,
      eventKey: key,
      onNoticeClose: onNoticeClose
    }));
  });
};
if (process.env.NODE_ENV !== 'production') {
  NoticeList.displayName = 'NoticeList';
}
var _default = NoticeList;
exports.default = _default;