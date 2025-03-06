import React from "react";
import {
	CheckCircle,
	XCircle,
	AlertCircle,
	Info,
	AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
	success: {
		container: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/50",
        heading: "text-green-700 dark:text-green-500",
		text: "text-green-600 dark:text-green-400",
		icon: CheckCircle,
	},
	danger: {
		container: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50",
        heading: "text-red-700 dark:text-red-500",
		text: "text-red-600 dark:text-red-400",
		icon: XCircle,
	},
	warning: {
		container: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50",
        heading: "text-amber-700 dark:text-amber-500",
		text: "text-amber-600 dark:text-amber-400",
		icon: AlertTriangle,
	},
	info: {
		container: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50",
        heading: "text-blue-700 dark:text-blue-500",
		text: "text-blue-600 dark:text-blue-400",
		icon: Info,
	},
	default: {
		container: "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800",
        heading: "text-gray-900 dark:text-gray-100",
		text: "text-gray-500 dark:text-gray-400",
		icon: AlertCircle,
	},
};

interface AlertProps {
	variant?: keyof typeof variants;
	title?: string;
	children: React.ReactNode;
	className?: string;
	icon?: React.ElementType;
}

export function Alert({
	variant = "default",
	title,
	children,
	className,
	icon: CustomIcon,
}: AlertProps) {
	const { container, heading, text, icon: DefaultIcon } = variants[variant];
	const Icon = CustomIcon || DefaultIcon;

	return (
		<div className={cn("rounded-md p-3 border mb-3", container, className)}>
			<div className={cn("flex items-center gap-2", heading)}>
				<Icon className="h-4 w-4" />
				{title && <h4 className="font-medium text-sm">{title}</h4>}
			</div>
			<div className={cn("mt-1 text-sm", text)}>{children}</div>
		</div>
	);
}
