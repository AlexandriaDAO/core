import type { FullToken } from '../../theme/internal';
import type { GenStyleFn } from '../../theme/util/genComponentStyleHook';
/** Component only token. Which will handle additional calculation of alias token */
export interface ComponentToken {
}
export interface ButtonToken extends FullToken<'Button'> {
    colorOutlineDefault: string;
    buttonPaddingHorizontal: number;
    buttonIconOnlyFontSize: number;
    buttonFontWeight: number;
}
export declare const prepareToken: (token: Parameters<GenStyleFn<'Badge'>>[0]) => ButtonToken;
declare const _default: (prefixCls: string) => import("../../theme/interface").UseComponentStyleResult;
export default _default;
