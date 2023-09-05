; ModuleID = 'probe6.4cfde88763a71e9a-cgu.0'
source_filename = "probe6.4cfde88763a71e9a-cgu.0"
target datalayout = "e-m:e-p:32:32-p10:8:8-p20:8:8-i64:64-n32:64-S128-ni:1:10:20"
target triple = "wasm32-unknown-unknown"

; core::f64::<impl f64>::is_subnormal
; Function Attrs: inlinehint nounwind
define internal zeroext i1 @"_ZN4core3f6421_$LT$impl$u20$f64$GT$12is_subnormal17hbcd472b15759951cE"(double %self) unnamed_addr #0 {
start:
  %_2 = alloca i8, align 1
; call core::f64::<impl f64>::classify
  %0 = call i8 @"_ZN4core3f6421_$LT$impl$u20$f64$GT$8classify17h97db4cf417749bfbE"(double %self) #2, !range !0
  store i8 %0, ptr %_2, align 1
  %1 = load i8, ptr %_2, align 1, !range !0, !noundef !1
  %_3 = zext i8 %1 to i32
  %2 = icmp eq i32 %_3, 3
  ret i1 %2
}

; probe6::probe
; Function Attrs: nounwind
define hidden void @_ZN6probe65probe17hcfb2f442e3dd438dE() unnamed_addr #1 {
start:
; call core::f64::<impl f64>::is_subnormal
  %_1 = call zeroext i1 @"_ZN4core3f6421_$LT$impl$u20$f64$GT$12is_subnormal17hbcd472b15759951cE"(double 1.000000e+00) #2
  ret void
}

; core::f64::<impl f64>::classify
; Function Attrs: nounwind
declare dso_local i8 @"_ZN4core3f6421_$LT$impl$u20$f64$GT$8classify17h97db4cf417749bfbE"(double) unnamed_addr #1

attributes #0 = { inlinehint nounwind "target-cpu"="generic" }
attributes #1 = { nounwind "target-cpu"="generic" }
attributes #2 = { nounwind }

!0 = !{i8 0, i8 5}
!1 = !{}
