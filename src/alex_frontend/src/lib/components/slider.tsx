import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }





// recent slider with dual thumb and tooltip

// import * as React from "react";
// import * as SliderPrimitive from "@radix-ui/react-slider";
// import * as TooltipPrimitive from "@radix-ui/react-tooltip";

// import { cn } from "@/lib/utils";

// function Slider({
// 	className,
// 	defaultValue,
// 	value,
// 	min = 0,
// 	max = 100,
// 	showTooltip = false,
// 	...props
// }: React.ComponentProps<typeof SliderPrimitive.Root> & {
// 	showTooltip?: boolean;
// }) {
// 	const [draggedThumb, setDraggedThumb] = React.useState<number | null>(null);
// 	const _values = React.useMemo(
// 		() =>
// 			Array.isArray(value)
// 				? value
// 				: Array.isArray(defaultValue)
// 					? defaultValue
// 					: [min, max],
// 		[value, defaultValue, min, max]
// 	);

// 	return (
// 		<TooltipPrimitive.Provider>
// 			<SliderPrimitive.Root
// 				data-slot="slider"
// 				defaultValue={defaultValue}
// 				value={value}
// 				min={min}
// 				max={max}
// 				onValueChange={props.onValueChange}
// 				className={cn(
// 					"relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
// 					className
// 				)}
// 				{...props}
// 			>
// 				<SliderPrimitive.Track
// 					data-slot="slider-track"
// 					className={cn(
// 						"bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
// 					)}
// 				>
// 					<SliderPrimitive.Range
// 						data-slot="slider-range"
// 						className={cn(
// 							"bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
// 						)}
// 					/>
// 				</SliderPrimitive.Track>
// 				{Array.from({ length: _values.length }, (_, index) => (
// 					<TooltipPrimitive.Root key={index} open={showTooltip && draggedThumb === index}>
// 						<TooltipPrimitive.Trigger asChild>
// 							<SliderPrimitive.Thumb
// 								data-slot="slider-thumb"
// 								onPointerDown={() => setDraggedThumb(index)}
// 								onPointerUp={() => setDraggedThumb(null)}
// 								className="border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
// 							/>
// 						</TooltipPrimitive.Trigger>
// 						<TooltipPrimitive.Portal>
// 							<TooltipPrimitive.Content
// 								className="bg-black text-white px-2 py-1 rounded text-xs"
// 								sideOffset={8}
// 							>
// 								{_values[index]?.toLocaleString()}
// 								<TooltipPrimitive.Arrow className="fill-black" />
// 							</TooltipPrimitive.Content>
// 						</TooltipPrimitive.Portal>
// 					</TooltipPrimitive.Root>
// 				))}
// 			</SliderPrimitive.Root>
// 		</TooltipPrimitive.Provider>
// 	);
// }

// export { Slider };
