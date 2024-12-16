import React, { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import fetchMyBooks from "./thunks/fetchMyBooks";
import { Info, LoaderCircle } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/lib/components/table";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/lib/components/dialog";
import AssetMint from "./components/AssetMint";
import BookModal from "./components/BookModal";
import { setBooks, setCursor } from "./assetSlice";

const MyBooks = () => {
	const dispatch = useAppDispatch();
	const { books, loading, error } = useAppSelector((state)=>state.asset);

	useEffect(() => {
		dispatch(fetchMyBooks());

		return () => {
			dispatch(setCursor(''));
			dispatch(setBooks([]));
		}
	}, [dispatch]);

	if(loading) return (
		<div className="flex justify-start items-center gap-1">
			<span>Loading Books</span>
			<LoaderCircle size={20} className="animate animate-spin" />
		</div>
	)

	if(error) return(
		<div className="flex flex-col gap-2 justify-start items-start font-roboto-condensed text-base leading-[18px] text-black font-normal">
			<span>Error loading books</span>
			<span>{error}</span>
		</div>
	)

	if(books.length<=0) return <span>No Book Uploaded</span>

	return (
		<div className="py-10">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="text-center">Cover</TableHead>
						<TableHead className="text-center">Fiction</TableHead>
						<TableHead className="text-center">Title</TableHead>
						<TableHead className="text-center">Creator</TableHead>
						<TableHead className="text-center">Language</TableHead>
						<TableHead className="text-center">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{books.map((book) => (
						<TableRow key={book.manifest}>
							<TableCell className="flex justify-center items-center">
								<div className="flex items-center justify-center">
									<LoaderCircle size={26} className="animate animate-spin"/>
								</div>
								<img
									src={`https://gateway.irys.xyz/${book.manifest}/cover`}
									alt={book.title}
									className="w-0 h-0 hidden"
									onLoad={(e) => {
										(e.currentTarget.previousElementSibling as HTMLElement).style.display = 'none';
										(e.currentTarget as HTMLImageElement).className = 'w-10 h-10 object-cover rounded block';
									}}
									onError={(e) => {
										(e.currentTarget as HTMLElement).style.display = 'none';
										(e.currentTarget.previousElementSibling as HTMLElement).style.display = 'none';
										(e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
									}}
								/>
								<div className="hidden w-80 h-80 items-center justify-center">
									<Info size={26} className="text-destructive"/>
								</div>
							</TableCell>
							<TableCell className="text-center">{book.fiction ? "Yes" : "No"}</TableCell>
							<TableCell className="text-center">{book.title}</TableCell>
							<TableCell className="text-center">{book.creator}</TableCell>
							<TableCell className="text-center">{book.language}</TableCell>
							<TableCell className="text-center">
								<div className="flex justify-center items-center gap-2">
									<Dialog >
										<DialogTrigger asChild>
											<Button variant="outline">
												View Book
											</Button>
										</DialogTrigger>
										<DialogContent className="max-w-7xl font-roboto-condensed p-0 border-none" closeIcon={null} onOpenAutoFocus={(e) => e.preventDefault()}>
											<DialogTitle className="hidden">{book.title}</DialogTitle>
											<DialogDescription className="hidden">Displaying Book</DialogDescription>
											<BookModal book={book}/>
										</DialogContent>
									</Dialog>
									<AssetMint asset={book}/>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
};

export default MyBooks;
