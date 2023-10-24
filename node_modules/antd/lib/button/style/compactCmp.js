"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _ = require(".");
var _compactItem = require("../../style/compact-item");
var _compactItemVertical = require("../../style/compact-item-vertical");
var _internal = require("../../theme/internal");
// Style as inline component
// ============================== Export ==============================
var _default = exports.default = (0, _internal.genSubStyleComponent)(['Button', 'compact'], token => {
  const buttonToken = (0, _.prepareToken)(token);
  return [
  // Space Compact
  (0, _compactItem.genCompactItemStyle)(buttonToken), (0, _compactItemVertical.genCompactItemVerticalStyle)(buttonToken)];
}, _.prepareComponentToken);