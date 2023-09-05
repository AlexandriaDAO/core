import type { FullToken } from '../../theme/internal';
import type { GenStyleFn } from '../../theme/util/genComponentStyleHook';
export interface FormToken extends FullToken<'Form'> {
    formItemCls: string;
    rootPrefixCls: string;
}
export declare const prepareToken: (token: Parameters<GenStyleFn<'Form'>>[0], rootPrefixCls: string) => FormToken;
declare const _default: (prefixCls: string) => import("../../theme/interface").UseComponentStyleResult;
export default _default;
