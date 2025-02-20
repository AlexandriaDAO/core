import React, { useEffect, useState } from "react";
import { useIdentity } from "@/hooks/useIdentity";
import { Button } from "@/lib/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/lib/components/dialog";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { Textarea } from "@/lib/components/textarea";
import { Plus } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import 'github-markdown-css/github-markdown.css';
import { getActorLexigraph } from "@/features/auth/utils/authUtils";
import { Principal } from "@dfinity/principal";
import { Slot, SlotContent, Shelf } from "../../../../../declarations/lexigraph/lexigraph.did";

const Lexigraph: React.FC = () => {
	const { identity } = useIdentity();
	const [shelves, setShelves] = useState<Shelf[]>([]);
	const [loading, setLoading] = useState(true);
	const [newShelfTitle, setNewShelfTitle] = useState("");
	const [newShelfDescription, setNewShelfDescription] = useState("");
	const [newSlotContent, setNewSlotContent] = useState("");
	const [selectedShelf, setSelectedShelf] = useState<Shelf | null>(null);
	const [isNewShelfDialogOpen, setIsNewShelfDialogOpen] = useState(false);
	const [isNewSlotDialogOpen, setIsNewSlotDialogOpen] = useState(false);
	const [slotType, setSlotType] = useState<"Nft" | "Markdown">("Markdown");

	useEffect(() => {
		if (identity) {
			loadShelves();
		}
	}, [identity]);

	const loadShelves = async () => {
		if (!identity) return;
		try {
			const lexigraphActor = await getActorLexigraph();
			const result = await lexigraphActor.get_user_shelves(identity.getPrincipal(), []);
			if ("Ok" in result) {
				setShelves(result.Ok);
			}
		} catch (error) {
			console.error("Failed to load shelves:", error);
		} finally {
			setLoading(false);
		}
	};

	const createShelf = async () => {
		try {
			const lexigraphActor = await getActorLexigraph();
			// Initialize with a single empty slot to establish proper structure
			const initialSlots: Slot[] = [
				{
					id: 1,
					content: { Markdown: "New shelf" } as SlotContent,
					position: 0
				}
			];
			
			console.log('Creating shelf with initial slots:', initialSlots);
			
			const result = await lexigraphActor.store_shelf(
				newShelfTitle,
				newShelfDescription ? [newShelfDescription] : [],
				initialSlots
			);
			console.log('New shelf creation result:', result);
			
			if ("Ok" in result) {
				await loadShelves();
				const newShelf = shelves[shelves.length - 1];
				console.log('Created shelf details:', {
					id: newShelf?.shelf_id,
					slots: newShelf?.slots.map(([key, slot]) => ({
						key,
						id: slot.id,
						position: slot.position,
						content: slot.content
					})),
					positions: newShelf?.slot_positions
				});
				
				setIsNewShelfDialogOpen(false);
				setNewShelfTitle("");
				setNewShelfDescription("");
			}
		} catch (error) {
			console.error("Failed to create shelf:", error);
		}
	};

	const addSlot = async () => {
		if (!selectedShelf) return;
		try {
			const lexigraphActor = await getActorLexigraph();
			console.log('Adding slot to shelf:', {
				shelfId: selectedShelf.shelf_id,
				currentSlots: selectedShelf.slots.map(([key, slot]) => ({
					key,
					id: slot.id,
					position: slot.position,
					content: slot.content
				})),
				currentPositions: selectedShelf.slot_positions
			});

			const existingSlots = selectedShelf.slots.map(([_, slot]) => slot);
			const newPosition = existingSlots.length;
			
			const newSlot: Slot = {
				id: Math.max(0, ...existingSlots.map(slot => slot.id)) + 1,
				content: slotType === "Nft" 
					? { Nft: newSlotContent } as SlotContent
					: { Markdown: newSlotContent } as SlotContent,
				position: newPosition
			};
			
			console.log('New slot to add:', newSlot);
			
			// Create a new array of slots including the new one
			const allSlots: Slot[] = [...existingSlots, newSlot];
			
			console.log('All slots being sent to update_shelf:', allSlots);
			
			// Use update_shelf instead of store_shelf
			const result = await lexigraphActor.update_shelf(
				selectedShelf.shelf_id,
				{
					title: [],
					description: [],
					slots: [allSlots]
				}
			);
			
			console.log('Update shelf result:', result);
			
			if ("Ok" in result) {
				await loadShelves();
				const updatedShelf = shelves.find(s => s.shelf_id === selectedShelf.shelf_id);
				console.log('Shelf after update:', {
					id: updatedShelf?.shelf_id,
					slots: updatedShelf?.slots.map(([key, slot]) => ({
						key,
						id: slot.id,
						position: slot.position,
						content: slot.content
					})),
					positions: updatedShelf?.slot_positions
				});
				
				const orderedSlotsResult = await lexigraphActor.get_shelf_slots(selectedShelf.shelf_id);
				console.log('Ordered slots after update:', orderedSlotsResult);
				
				setIsNewSlotDialogOpen(false);
				setNewSlotContent("");
			}
		} catch (error) {
			console.error("Failed to add slot:", error);
		}
	};

	const deleteShelf = async (shelfId: string) => {
		try {
			const lexigraphActor = await getActorLexigraph();
			const result = await lexigraphActor.delete_shelf(shelfId);
			
			if ("Ok" in result) {
				await loadShelves();
			}
		} catch (error) {
			console.error("Failed to delete shelf:", error);
		}
	};

	const reorderSlot = async (shelfId: string, slotId: number, referenceSlotId: number | null, before: boolean) => {
		try {
			const lexigraphActor = await getActorLexigraph();
			const result = await lexigraphActor.reorder_shelf_slot(shelfId, {
				slot_id: slotId,
				reference_slot_id: referenceSlotId ? [referenceSlotId] : [],
				before: before
			});
			
			if ("Ok" in result) {
				await loadShelves();
				// Verify the reordering
				const orderedSlotsResult = await lexigraphActor.get_shelf_slots(shelfId);
				console.log('Ordered slots after reorder:', orderedSlotsResult);
			}
		} catch (error) {
			console.error("Failed to reorder slot:", error);
		}
	};

	const createTestShelf = async () => {
		try {
			const lexigraphActor = await getActorLexigraph();
			console.log('Creating test shelf...');
			
			const slots = [
				{
					id: 1,
					content: { Markdown: "First slot" },
					position: 0
				},
				{
					id: 2,
					content: { Markdown: "Second slot" },
					position: 1
				},
				{
					id: 3,
					content: { Markdown: "Third slot" },
					position: 2
				}
			];
			
			console.log('Slots to create:', slots);
			
			const result = await lexigraphActor.store_shelf(
				"Test Shelf",
				["A test shelf for reordering"],
				slots
			);
			
			console.log('Store shelf result:', result);
			
			if ("Ok" in result) {
				await loadShelves();
				const shelf = shelves[shelves.length - 1];
				console.log('Created shelf details:', {
					id: shelf.shelf_id,
					slots: shelf.slots.map(([key, slot]) => ({
						key,
						id: slot.id,
						position: slot.position,
						content: slot.content
					})),
					positions: shelf.slot_positions
				});
				
				// Try to reorder slot 3 before slot 2
				console.log('Attempting to reorder slot 3 before slot 2...');
				const reorderResult = await lexigraphActor.reorder_shelf_slot(
					shelf.shelf_id,
					{
						slot_id: 3,
						reference_slot_id: [2],
						before: true
					}
				);
				console.log('Reorder result:', reorderResult);
				
				// Get the updated shelf state
				await loadShelves();
				const updatedShelf = shelves.find(s => s.shelf_id === shelf.shelf_id);
				console.log('Shelf state after reorder:', {
					id: updatedShelf?.shelf_id,
					slots: updatedShelf?.slots.map(([key, slot]) => ({
						key,
						id: slot.id,
						position: slot.position,
						content: slot.content
					})),
					positions: updatedShelf?.slot_positions
				});
				
				// Also get the ordered slots directly
				const orderedSlotsResult = await lexigraphActor.get_shelf_slots(shelf.shelf_id);
				console.log('Ordered slots after reorder:', orderedSlotsResult);
			}
		} catch (error) {
			console.error('Test failed:', error);
		}
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="container mx-auto p-4">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">My Shelves</h1>
				<div className="flex gap-2">
					<Button onClick={createTestShelf}>
						Create Test Shelf
					</Button>
					<Dialog open={isNewShelfDialogOpen} onOpenChange={setIsNewShelfDialogOpen}>
						<DialogTrigger asChild>
							<Button>
								<Plus className="w-4 h-4 mr-2" />
								New Shelf
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Create New Shelf</DialogTitle>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								<div className="grid gap-2">
									<Label htmlFor="title">Title</Label>
									<Input
										id="title"
										value={newShelfTitle}
										onChange={(e) => setNewShelfTitle(e.target.value)}
										placeholder="Shelf Title"
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="description">Description</Label>
									<Textarea
										id="description"
										value={newShelfDescription}
										onChange={(e) => setNewShelfDescription(e.target.value)}
										placeholder="Description"
									/>
								</div>
							</div>
							<DialogFooter>
								<Button onClick={createShelf}>Create</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{shelves.map((shelf) => (
					<Card key={shelf.shelf_id}>
						<CardHeader>
							<div className="flex justify-between items-center">
								<CardTitle>{shelf.title}</CardTitle>
								<Button
									variant="destructive"
									onClick={() => deleteShelf(shelf.shelf_id)}
								>
									Delete Shelf
								</Button>
							</div>
							<div className="text-xs text-muted-foreground mt-1">
								<div>Shelf ID: {shelf.shelf_id}</div>
								<div>Created: {new Date(Number(shelf.created_at)).toLocaleString()}</div>
								<div>Updated: {new Date(Number(shelf.updated_at)).toLocaleString()}</div>
								<div>Owner: {shelf.owner.toString()}</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								{[...shelf.slots]
									.sort(([_keyA, slotA], [_keyB, slotB]) => {
										const posA = shelf.slot_positions.find(([key]) => key === _keyA)?.[1] ?? 0;
										const posB = shelf.slot_positions.find(([key]) => key === _keyB)?.[1] ?? 0;
										return posA - posB;
									})
									.map(([slotKey, slot], index, sortedSlots) => (
									<div key={slot.id} className="p-3 bg-secondary rounded-md">
										<div className="flex justify-between items-start">
											<div className="text-xs text-muted-foreground mb-2">
												<div>Slot ID: {slot.id}</div>
												<div>Position: {slot.position}</div>
												<div>Position Value: {shelf.slot_positions.find(([key]) => key === slotKey)?.[1] || 'N/A'}</div>
											</div>
											<div className="flex gap-2">
												{index > 0 && (
													<Button
														variant="outline"
														onClick={() => {
															const prevSlot = sortedSlots[index - 1][1];
															reorderSlot(shelf.shelf_id, slot.id, prevSlot.id, true);
														}}
													>
														Move Up
													</Button>
												)}
												{index < sortedSlots.length - 1 && (
													<Button
														variant="outline"
														onClick={() => {
															const nextSlot = sortedSlots[index + 1][1];
															reorderSlot(shelf.shelf_id, slot.id, nextSlot.id, false);
														}}
													>
														Move Down
													</Button>
												)}
											</div>
										</div>
										{"Nft" in slot.content ? (
											<div>NFT ID: {slot.content.Nft}</div>
										) : (
											<ReactMarkdown>{slot.content.Markdown}</ReactMarkdown>
										)}
									</div>
								))}
								<Button
									variant="outline"
									onClick={() => {
										setSelectedShelf(shelf);
										setIsNewSlotDialogOpen(true);
									}}
								>
									Add Slot
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<Dialog open={isNewSlotDialogOpen} onOpenChange={setIsNewSlotDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add New Slot</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label>Content Type</Label>
							<div className="flex gap-4">
								<Button
									variant={slotType === "Markdown" ? "primary" : "outline"}
									onClick={() => setSlotType("Markdown")}
								>
									Markdown
								</Button>
								<Button
									variant={slotType === "Nft" ? "primary" : "outline"}
									onClick={() => setSlotType("Nft")}
								>
									NFT
								</Button>
							</div>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="content">Content</Label>
							{slotType === "Markdown" ? (
								<Textarea
									id="content"
									value={newSlotContent}
									onChange={(e) => setNewSlotContent(e.target.value)}
									placeholder="Enter markdown content..."
								/>
							) : (
								<Input
									id="content"
									value={newSlotContent}
									onChange={(e) => setNewSlotContent(e.target.value)}
									placeholder="Enter NFT ID..."
								/>
							)}
						</div>
					</div>
					<DialogFooter>
						<Button onClick={addSlot}>Add</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default Lexigraph;
