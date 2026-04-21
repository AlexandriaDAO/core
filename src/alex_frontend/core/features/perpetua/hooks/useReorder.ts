import { useState, useCallback } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

interface UseReorderOptions<T> {
	items: T[];
	getId: (item: T) => string;
	onSave: (reordered: T[]) => Promise<void>;
}

export function useReorder<T>({ items, getId, onSave }: UseReorderOptions<T>) {
	const [isEditMode, setIsEditMode] = useState(false);
	const [editedItems, setEditedItems] = useState<T[]>([]);
	const [isSaving, setIsSaving] = useState(false);

	const enterEditMode = useCallback(() => {
		setEditedItems([...items]);
		setIsEditMode(true);
	}, [items]);

	const cancelEditMode = useCallback(() => {
		setIsEditMode(false);
		setEditedItems([]);
	}, []);

	const onDragEnd = useCallback((event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		setEditedItems((prev) => {
			const oldIndex = prev.findIndex((item) => getId(item) === String(active.id));
			const newIndex = prev.findIndex((item) => getId(item) === String(over.id));
			if (oldIndex === -1 || newIndex === -1) return prev;
			return arrayMove(prev, oldIndex, newIndex);
		});
	}, [getId]);

	const save = useCallback(async () => {
		setIsSaving(true);
		try {
			await onSave(editedItems);
			setIsEditMode(false);
			setEditedItems([]);
		} finally {
			setIsSaving(false);
		}
	}, [editedItems, onSave]);

	const displayItems = isEditMode ? editedItems : items;

	return {
		isEditMode,
		displayItems,
		isSaving,
		enterEditMode,
		cancelEditMode,
		save,
		onDragEnd,
	};
}
