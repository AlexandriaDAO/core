// import React, { useEffect, useState } from "react";
// import { useIdentity } from "@/hooks/useIdentity";
// import { Button } from "@/lib/components/button";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/lib/components/card";
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/lib/components/dialog";
// import { Input } from "@/lib/components/input";
// import { Label } from "@/lib/components/label";
// import { Textarea } from "@/lib/components/textarea";
// import { Plus, Edit, Trash2, MoveVertical, FileText, Image } from "lucide-react";
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
// import { useLexigraph } from "@/hooks/actors";
// import type { _SERVICE, ShelfUpdate, Slot, SlotContent } from "../../../../../declarations/lexigraph/lexigraph.did";

// interface Shelf {
// 	title: string;
// 	description: string | null;
// 	shelf_id: string;
// 	slots: Array<Slot>;
// 	slot_positions: Array<[number, number]>;
// }

// function Lexigraph() {
// 	const { identity } = useIdentity();
// 	const [shelves, setShelves] = useState<Shelf[]>([]);
// 	const [loading, setLoading] = useState(true);
// 	const [newShelfTitle, setNewShelfTitle] = useState("");
// 	const [newShelfDescription, setNewShelfDescription] = useState("");
// 	const [newSlotContent, setNewSlotContent] = useState("");
// 	const [selectedShelf, setSelectedShelf] = useState<Shelf | null>(null);
// 	const [isNewShelfDialogOpen, setIsNewShelfDialogOpen] = useState(false);
// 	const [isNewSlotDialogOpen, setIsNewSlotDialogOpen] = useState(false);
// 	const [slotType, setSlotType] = useState<"Nft" | "Markdown">("Markdown");
	
// 	const { actor: lexigraphActor } = useLexigraph();

// 	useEffect(() => {
// 		if (lexigraphActor && identity) {
// 			console.log("Loading shelves with identity:", identity.getPrincipal().toString());
// 			loadShelves();
// 		} else {
// 			console.log("Waiting for actor and identity...", { actor: !!lexigraphActor, identity: !!identity });
// 		}
// 	}, [lexigraphActor, identity]);

// 	const loadShelves = async () => {
// 		if (!lexigraphActor || !identity) return;
// 		try {
// 			console.log("Calling get_user_shelves with identity:", identity.getPrincipal().toString());
// 			const result = await (lexigraphActor as any).get_user_shelves(identity.getPrincipal(), []);
// 			console.log("get_user_shelves result:", result);
// 			if ("Ok" in result) {
// 				setShelves(result.Ok);
// 			} else {
// 				console.error("Error loading shelves:", result.Err);
// 			}
// 		} catch (error) {
// 			console.error("Failed to load shelves:", error);
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	const createShelf = async () => {
// 		if (!lexigraphActor) return;
// 		try {
// 			const result = await lexigraphActor.store_shelf(
// 				newShelfTitle,
// 				newShelfDescription ? [newShelfDescription] : [],
// 				[]
// 			);
// 			if ("Ok" in result) {
// 				await loadShelves();
// 				setIsNewShelfDialogOpen(false);
// 				setNewShelfTitle("");
// 				setNewShelfDescription("");
// 			}
// 		} catch (error) {
// 			console.error("Failed to create shelf:", error);
// 		}
// 	};

// 	const addSlot = async () => {
// 		if (!lexigraphActor || !selectedShelf) return;
// 		try {
// 			const newSlot: Slot = {
// 				id: Date.now(),
// 				content: slotType === "Nft" 
// 					? { Nft: newSlotContent }
// 					: { Markdown: newSlotContent },
// 				position: selectedShelf.slots.length
// 			};
			
// 			const update: ShelfUpdate = {
// 				title: newShelfTitle ? [newShelfTitle] : [],
// 				description: newShelfDescription ? [newShelfDescription] : [],
// 				slots: [[...selectedShelf.slots, newSlot]]
// 			};
			
// 			const result = await lexigraphActor.update_shelf(selectedShelf.shelf_id, update);
			
// 			if ("Ok" in result) {
// 				await loadShelves();
// 				setIsNewSlotDialogOpen(false);
// 				setNewSlotContent("");
// 			}
// 		} catch (error) {
// 			console.error("Failed to add slot:", error);
// 		}
// 	};

// 	const onDragEnd = async (result: any) => {
// 		if (!result.destination || !selectedShelf || !lexigraphActor) return;

// 		const sourceIndex = result.source.index;
// 		const destinationIndex = result.destination.index;

// 		if (sourceIndex === destinationIndex) return;

// 		try {
// 			const slotId = selectedShelf.slots[sourceIndex].id;
// 			const referenceSlotId = destinationIndex < selectedShelf.slots.length 
// 				? selectedShelf.slots[destinationIndex].id 
// 				: null;

// 			const result = await (lexigraphActor as any).reorder_shelf_slot(selectedShelf.shelf_id, {
// 				slot_id: slotId,
// 				reference_slot_id: referenceSlotId ? [referenceSlotId] : [],
// 				before: destinationIndex < sourceIndex
// 			});

// 			if ("Ok" in result) {
// 				await loadShelves();
// 			}
// 		} catch (error) {
// 			console.error("Failed to reorder slots:", error);
// 		}
// 	};

// 	if (loading) {
// 		return <div>Loading...</div>;
// 	}

// 	return (
// 		<div className="min-h-screen min-w-screen flex flex-col bg-background">
// 			<div className="container mx-auto p-4">
// 				<div className="flex justify-between items-center mb-6">
// 					<h1 className="text-2xl font-bold">My Shelves</h1>
// 					<Dialog open={isNewShelfDialogOpen} onOpenChange={setIsNewShelfDialogOpen}>
// 						<DialogTrigger asChild>
// 							<Button>
// 								<Plus className="w-4 h-4 mr-2" />
// 								New Shelf
// 							</Button>
// 						</DialogTrigger>
// 						<DialogContent>
// 							<DialogHeader>
// 								<DialogTitle>Create New Shelf</DialogTitle>
// 								<DialogDescription>
// 									Create a new shelf to organize your NFTs and content.
// 								</DialogDescription>
// 							</DialogHeader>
// 							<div className="grid gap-4 py-4">
// 								<div className="grid gap-2">
// 									<Label htmlFor="title">Title</Label>
// 									<Input
// 										id="title"
// 										value={newShelfTitle}
// 										onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewShelfTitle(e.target.value)}
// 										placeholder="My Amazing Collection"
// 									/>
// 								</div>
// 								<div className="grid gap-2">
// 									<Label htmlFor="description">Description</Label>
// 									<Textarea
// 										id="description"
// 										value={newShelfDescription}
// 										onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewShelfDescription(e.target.value)}
// 										placeholder="Describe your shelf..."
// 									/>
// 								</div>
// 							</div>
// 							<DialogFooter>
// 								<Button variant="outline" onClick={() => setIsNewShelfDialogOpen(false)}>
// 									Cancel
// 								</Button>
// 								<Button onClick={createShelf}>Create</Button>
// 							</DialogFooter>
// 						</DialogContent>
// 					</Dialog>
// 				</div>

// 				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// 					{shelves.map((shelf) => (
// 						<Card key={shelf.shelf_id} className="flex flex-col">
// 							<CardHeader>
// 								<CardTitle>{shelf.title}</CardTitle>
// 								{shelf.description && (
// 									<CardDescription>{shelf.description}</CardDescription>
// 								)}
// 							</CardHeader>
// 							<CardContent className="flex-grow">
// 								<DragDropContext onDragEnd={onDragEnd}>
// 									<Droppable droppableId={shelf.shelf_id}>
// 										{(provided) => (
// 											<div
// 												{...provided.droppableProps}
// 												ref={provided.innerRef}
// 												className="space-y-2"
// 											>
// 												{shelf.slots.map((slot, index) => (
// 													<Draggable
// 														key={slot.id.toString()}
// 														draggableId={slot.id.toString()}
// 														index={index}
// 													>
// 														{(provided) => (
// 															<div
// 																ref={provided.innerRef}
// 																{...provided.draggableProps}
// 																{...provided.dragHandleProps}
// 																className="p-3 bg-secondary rounded-md flex items-center gap-2"
// 															>
// 																<MoveVertical className="w-4 h-4 text-muted-foreground" />
// 																{slot.content.type === "Nft" ? (
// 																	<>
// 																		<Image className="w-4 h-4" />
// 																		<span className="truncate">{slot.content.content}</span>
// 																	</>
// 																) : (
// 																	<>
// 																		<FileText className="w-4 h-4" />
// 																		<span className="truncate">{slot.content.content}</span>
// 																	</>
// 																)}
// 															</div>
// 														)}
// 													</Draggable>
// 												))}
// 												{provided.placeholder}
// 											</div>
// 										)}
// 									</Droppable>
// 								</DragDropContext>
// 							</CardContent>
// 							<CardFooter className="justify-between">
// 								<Dialog open={isNewSlotDialogOpen} onOpenChange={setIsNewSlotDialogOpen}>
// 									<DialogTrigger asChild>
// 										<Button
// 											variant="outline"
// 											onClick={() => setSelectedShelf(shelf)}
// 										>
// 											<Plus className="w-4 h-4 mr-2" />
// 											Add Slot
// 										</Button>
// 									</DialogTrigger>
// 									<DialogContent>
// 										<DialogHeader>
// 											<DialogTitle>Add New Slot</DialogTitle>
// 											<DialogDescription>
// 												Add a new NFT or Markdown content to your shelf.
// 											</DialogDescription>
// 										</DialogHeader>
// 										<div className="grid gap-4 py-4">
// 											<div className="grid gap-2">
// 												<Label>Content Type</Label>
// 												<div className="flex gap-4">
// 													<Button
// 														variant={slotType === "Markdown" ? "primary" : "outline"}
// 														onClick={() => setSlotType("Markdown")}
// 													>
// 														<FileText className="w-4 h-4 mr-2" />
// 														Markdown
// 													</Button>
// 													<Button
// 														variant={slotType === "Nft" ? "primary" : "outline"}
// 														onClick={() => setSlotType("Nft")}
// 													>
// 														<Image className="w-4 h-4 mr-2" />
// 														NFT
// 													</Button>
// 												</div>
// 											</div>
// 											<div className="grid gap-2">
// 												<Label htmlFor="content">
// 													{slotType === "Nft" ? "NFT ID" : "Markdown Content"}
// 												</Label>
// 												{slotType === "Markdown" ? (
// 													<Textarea
// 														id="content"
// 														value={newSlotContent}
// 														onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewSlotContent(e.target.value)}
// 														placeholder="Enter your markdown content..."
// 													/>
// 												) : (
// 													<Input
// 														id="content"
// 														value={newSlotContent}
// 														onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSlotContent(e.target.value)}
// 														placeholder="Enter NFT ID..."
// 													/>
// 												)}
// 											</div>
// 										</div>
// 										<DialogFooter>
// 											<Button variant="outline" onClick={() => setIsNewSlotDialogOpen(false)}>
// 												Cancel
// 											</Button>
// 											<Button onClick={addSlot}>Add</Button>
// 										</DialogFooter>
// 									</DialogContent>
// 								</Dialog>
// 								<Button variant="outline" className="w-10 h-10 p-0">
// 									<Edit className="w-4 h-4" />
// 								</Button>
// 							</CardFooter>
// 						</Card>
// 					))}
// 				</div>
// 			</div>
// 		</div>
// 	);
// }

// export default Lexigraph;
