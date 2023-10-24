import type { FullToken } from '../../theme/internal';
export interface ComponentToken {
}
export interface ColorPickerToken extends FullToken<'ColorPicker'> {
    colorPickerWidth: number;
    colorPickerInsetShadow: string;
    colorPickerHandlerSize: number;
    colorPickerHandlerSizeSM: number;
    colorPickerSliderHeight: number;
    colorPickerPreviewSize: number;
    colorPickerAlphaInputWidth: number;
    colorPickerInputNumberHandleWidth: number;
    colorPickerPresetColorSize: number;
}
export declare const genActiveStyle: (token: ColorPickerToken, borderColor: string, outlineColor: string) => {
    borderInlineEndWidth: number;
    borderColor: string;
    boxShadow: string;
    outline: number;
};
declare const _default: (prefixCls: string) => import("../../theme/interface").UseComponentStyleResult;
export default _default;
