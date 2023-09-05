import type { FullToken } from '../../theme/internal';
import type { GenStyleFn } from '../../theme/util/genComponentStyleHook';
export interface BadgeToken extends FullToken<'Badge'> {
    badgeFontHeight: number;
    badgeZIndex: number | string;
    badgeHeight: number;
    badgeHeightSm: number;
    badgeTextColor: string;
    badgeFontWeight: string;
    badgeFontSize: number;
    badgeColor: string;
    badgeColorHover: string;
    badgeDotSize: number;
    badgeFontSizeSm: number;
    badgeStatusSize: number;
    badgeShadowSize: number;
    badgeShadowColor: string;
    badgeProcessingDuration: string;
    badgeRibbonOffset: number;
    badgeRibbonCornerTransform: string;
    badgeRibbonCornerFilter: string;
}
export declare const prepareToken: (token: Parameters<GenStyleFn<'Badge'>>[0]) => BadgeToken;
declare const _default: (prefixCls: string) => import("../../theme/interface").UseComponentStyleResult;
export default _default;
