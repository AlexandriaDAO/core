import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import React, { useEffect, useRef } from 'react';
import MutateObserver from '@rc-component/mutate-observer';
import classNames from 'classnames';
import theme from '../theme';
import useClips, { FontGap } from './useClips';
import { getPixelRatio, getStyleStr, reRendering } from './utils';
const Watermark = props => {
  var _a, _b;
  const {
    /**
     * The antd content layer zIndex is basically below 10
     * https://github.com/ant-design/ant-design/blob/6192403b2ce517c017f9e58a32d58774921c10cd/components/style/themes/default.less#L335
     */
    zIndex = 9,
    rotate = -22,
    width,
    height,
    image,
    content,
    font = {},
    style,
    className,
    rootClassName,
    gap = [100, 100],
    offset,
    children
  } = props;
  const {
    token
  } = theme.useToken();
  const {
    color = token.colorFill,
    fontSize = token.fontSizeLG,
    fontWeight = 'normal',
    fontStyle = 'normal',
    fontFamily = 'sans-serif'
  } = font;
  const [gapX, gapY] = gap;
  const gapXCenter = gapX / 2;
  const gapYCenter = gapY / 2;
  const offsetLeft = (_a = offset === null || offset === void 0 ? void 0 : offset[0]) !== null && _a !== void 0 ? _a : gapXCenter;
  const offsetTop = (_b = offset === null || offset === void 0 ? void 0 : offset[1]) !== null && _b !== void 0 ? _b : gapYCenter;
  const getMarkStyle = () => {
    const markStyle = {
      zIndex,
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      backgroundRepeat: 'repeat'
    };
    /** Calculate the style of the offset */
    let positionLeft = offsetLeft - gapXCenter;
    let positionTop = offsetTop - gapYCenter;
    if (positionLeft > 0) {
      markStyle.left = `${positionLeft}px`;
      markStyle.width = `calc(100% - ${positionLeft}px)`;
      positionLeft = 0;
    }
    if (positionTop > 0) {
      markStyle.top = `${positionTop}px`;
      markStyle.height = `calc(100% - ${positionTop}px)`;
      positionTop = 0;
    }
    markStyle.backgroundPosition = `${positionLeft}px ${positionTop}px`;
    return markStyle;
  };
  const containerRef = useRef(null);
  const watermarkRef = useRef();
  const stopObservation = useRef(false);
  const destroyWatermark = () => {
    if (watermarkRef.current) {
      watermarkRef.current.remove();
      watermarkRef.current = undefined;
    }
  };
  const appendWatermark = (base64Url, markWidth) => {
    var _a;
    if (containerRef.current && watermarkRef.current) {
      stopObservation.current = true;
      watermarkRef.current.setAttribute('style', getStyleStr(Object.assign(Object.assign({}, getMarkStyle()), {
        backgroundImage: `url('${base64Url}')`,
        backgroundSize: `${Math.floor(markWidth)}px`
      })));
      (_a = containerRef.current) === null || _a === void 0 ? void 0 : _a.append(watermarkRef.current);
      // Delayed execution
      setTimeout(() => {
        stopObservation.current = false;
      });
    }
  };
  /**
   * Get the width and height of the watermark. The default values are as follows
   * Image: [120, 64]; Content: It's calculated by content;
   */
  const getMarkSize = ctx => {
    let defaultWidth = 120;
    let defaultHeight = 64;
    if (!image && ctx.measureText) {
      ctx.font = `${Number(fontSize)}px ${fontFamily}`;
      const contents = Array.isArray(content) ? content : [content];
      const sizes = contents.map(item => {
        const metrics = ctx.measureText(item);
        return [metrics.width, metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent];
      });
      defaultWidth = Math.ceil(Math.max.apply(Math, _toConsumableArray(sizes.map(size => size[0]))));
      defaultHeight = Math.ceil(Math.max.apply(Math, _toConsumableArray(sizes.map(size => size[1])))) * contents.length + (contents.length - 1) * FontGap;
    }
    return [width !== null && width !== void 0 ? width : defaultWidth, height !== null && height !== void 0 ? height : defaultHeight];
  };
  const getClips = useClips();
  const renderWatermark = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (!watermarkRef.current) {
        watermarkRef.current = document.createElement('div');
      }
      const ratio = getPixelRatio();
      const [markWidth, markHeight] = getMarkSize(ctx);
      const drawCanvas = drawContent => {
        const [textClips, clipWidth] = getClips(drawContent || '', rotate, ratio, markWidth, markHeight, {
          color,
          fontSize,
          fontStyle,
          fontWeight,
          fontFamily
        }, gapX, gapY);
        appendWatermark(textClips, clipWidth);
      };
      if (image) {
        const img = new Image();
        img.onload = () => {
          drawCanvas(img);
        };
        img.onerror = () => {
          drawCanvas(content);
        };
        img.crossOrigin = 'anonymous';
        img.referrerPolicy = 'no-referrer';
        img.src = image;
      } else {
        drawCanvas(content);
      }
    }
  };
  const onMutate = mutations => {
    if (stopObservation.current) {
      return;
    }
    mutations.forEach(mutation => {
      if (reRendering(mutation, watermarkRef.current)) {
        destroyWatermark();
        renderWatermark();
      }
    });
  };
  useEffect(renderWatermark, [rotate, zIndex, width, height, image, content, color, fontSize, fontWeight, fontStyle, fontFamily, gapX, gapY, offsetLeft, offsetTop]);
  return /*#__PURE__*/React.createElement(MutateObserver, {
    onMutate: onMutate
  }, /*#__PURE__*/React.createElement("div", {
    ref: containerRef,
    className: classNames(className, rootClassName),
    style: Object.assign({
      position: 'relative'
    }, style)
  }, children));
};
if (process.env.NODE_ENV !== 'production') {
  Watermark.displayName = 'Watermark';
}
export default Watermark;