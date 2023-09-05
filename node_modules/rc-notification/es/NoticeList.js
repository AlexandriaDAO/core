import _extends from "@babel/runtime/helpers/esm/extends";
import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import React, { useContext } from 'react';
import clsx from 'classnames';
import { CSSMotionList } from 'rc-motion';
import Notice from "./Notice";
import { NotificationContext } from "./NotificationProvider";
var NoticeList = function NoticeList(props) {
  var configList = props.configList,
    placement = props.placement,
    prefixCls = props.prefixCls,
    className = props.className,
    style = props.style,
    motion = props.motion,
    onAllNoticeRemoved = props.onAllNoticeRemoved,
    onNoticeClose = props.onNoticeClose;
  var _useContext = useContext(NotificationContext),
    ctxCls = _useContext.classNames;
  var keys = configList.map(function (config) {
    return {
      config: config,
      key: config.key
    };
  });
  var placementMotion = typeof motion === 'function' ? motion(placement) : motion;
  return /*#__PURE__*/React.createElement(CSSMotionList, _extends({
    key: placement,
    className: clsx(prefixCls, "".concat(prefixCls, "-").concat(placement), ctxCls === null || ctxCls === void 0 ? void 0 : ctxCls.list, className),
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
    return /*#__PURE__*/React.createElement(Notice, _extends({}, config, {
      ref: nodeRef,
      prefixCls: prefixCls,
      className: clsx(motionClassName, configClassName, ctxCls === null || ctxCls === void 0 ? void 0 : ctxCls.notice),
      style: _objectSpread(_objectSpread({}, motionStyle), configStyle),
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
export default NoticeList;