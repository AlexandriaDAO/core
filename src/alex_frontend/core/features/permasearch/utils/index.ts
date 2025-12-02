import { FILE_TYPES } from "@/features/pinax/constants";

// Get categories for filtering
export const categoryOptions = Object.entries(FILE_TYPES).map(([key, category]) => ({
	value: key,
	label: category.label,
	icon: category.icon,
	description: category.description,
	types: category.types,
}));

export * from './blocks';
export * from './constants';
export * from './helpers';