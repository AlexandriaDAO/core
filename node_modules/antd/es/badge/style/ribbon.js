import { prepareComponentToken, prepareToken } from '.';
import { resetComponent } from '../../style';
import { genComponentStyleHook, genPresetColor } from '../../theme/internal';
// ============================== Ribbon ==============================
const genRibbonStyle = token => {
  const {
    antCls,
    badgeFontHeight,
    marginXS,
    badgeRibbonOffset
  } = token;
  const ribbonPrefixCls = `${antCls}-ribbon`;
  const ribbonWrapperPrefixCls = `${antCls}-ribbon-wrapper`;
  const statusRibbonPreset = genPresetColor(token, (colorKey, _ref) => {
    let {
      darkColor
    } = _ref;
    return {
      [`&${ribbonPrefixCls}-color-${colorKey}`]: {
        background: darkColor,
        color: darkColor
      }
    };
  });
  return {
    [`${ribbonWrapperPrefixCls}`]: {
      position: 'relative'
    },
    [`${ribbonPrefixCls}`]: Object.assign(Object.assign(Object.assign(Object.assign({}, resetComponent(token)), {
      position: 'absolute',
      top: marginXS,
      padding: `0 ${token.paddingXS}px`,
      color: token.colorPrimary,
      lineHeight: `${badgeFontHeight}px`,
      whiteSpace: 'nowrap',
      backgroundColor: token.colorPrimary,
      borderRadius: token.borderRadiusSM,
      [`${ribbonPrefixCls}-text`]: {
        color: token.colorTextLightSolid
      },
      [`${ribbonPrefixCls}-corner`]: {
        position: 'absolute',
        top: '100%',
        width: badgeRibbonOffset,
        height: badgeRibbonOffset,
        color: 'currentcolor',
        border: `${badgeRibbonOffset / 2}px solid`,
        transform: token.badgeRibbonCornerTransform,
        transformOrigin: 'top',
        filter: token.badgeRibbonCornerFilter
      }
    }), statusRibbonPreset), {
      [`&${ribbonPrefixCls}-placement-end`]: {
        insetInlineEnd: -badgeRibbonOffset,
        borderEndEndRadius: 0,
        [`${ribbonPrefixCls}-corner`]: {
          insetInlineEnd: 0,
          borderInlineEndColor: 'transparent',
          borderBlockEndColor: 'transparent'
        }
      },
      [`&${ribbonPrefixCls}-placement-start`]: {
        insetInlineStart: -badgeRibbonOffset,
        borderEndStartRadius: 0,
        [`${ribbonPrefixCls}-corner`]: {
          insetInlineStart: 0,
          borderBlockEndColor: 'transparent',
          borderInlineStartColor: 'transparent'
        }
      },
      // ====================== RTL =======================
      '&-rtl': {
        direction: 'rtl'
      }
    })
  };
};
// ============================== Export ==============================
export default genComponentStyleHook(['Badge', 'Ribbon'], token => {
  const badgeToken = prepareToken(token);
  return [genRibbonStyle(badgeToken)];
}, prepareComponentToken);