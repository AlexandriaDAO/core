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

interface Slot {
	id: number;
	content: { Nft: string } | { Markdown: string };
	position: number;
}

interface Shelf {
	title: string;
	description: [] | [string];
	shelf_id: string;
	slots: Array<[number, Slot]>;
	slot_positions: Array<[number, number]>;
	owner: Principal;
	created_at: bigint;
	updated_at: bigint;
}

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
			const result = await lexigraphActor.store_shelf(
				newShelfTitle,
				newShelfDescription ? [newShelfDescription] : [],
				[]
			);
			if ("Ok" in result) {
				await loadShelves();
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
			const newSlot: Slot = {
				id: Math.max(0, ...selectedShelf.slots.map(([_, slot]) => slot.id)) + 1,
				content: slotType === "Nft" 
					? { Nft: newSlotContent }
					: { Markdown: newSlotContent },
				position: selectedShelf.slots.length
			};
			
			const existingSlots = selectedShelf.slots.map(([_, slot]) => slot);
			const allSlots = [...existingSlots, newSlot];
			
			const result = await lexigraphActor.update_shelf(selectedShelf.shelf_id, {
				title: [],
				description: [],
				slots: [allSlots]
			});
			
			if ("Ok" in result) {
				await loadShelves();
				setIsNewSlotDialogOpen(false);
				setNewSlotContent("");
			}
		} catch (error) {
			console.error("Failed to add slot:", error);
		}
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="container mx-auto p-4">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">My Shelves</h1>
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

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{shelves.map((shelf) => (
					<Card key={shelf.shelf_id}>
						<CardHeader>
							<CardTitle>{shelf.title}</CardTitle>
							<div className="text-xs text-muted-foreground mt-1">
								<div>Shelf ID: {shelf.shelf_id}</div>
								<div>Created: {new Date(Number(shelf.created_at)).toLocaleString()}</div>
								<div>Updated: {new Date(Number(shelf.updated_at)).toLocaleString()}</div>
								<div>Owner: {shelf.owner.toString()}</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								{shelf.slots.map(([slotKey, slot]) => (
									<div key={slot.id} className="p-3 bg-secondary rounded-md">
										<div className="text-xs text-muted-foreground mb-2">
											<div>Slot ID: {slot.id}</div>
											<div>Position: {slot.position}</div>
											<div>Position Value: {shelf.slot_positions.find(([key]) => key === slotKey)?.[1] || 'N/A'}</div>
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
