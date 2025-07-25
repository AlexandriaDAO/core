import React, { useState } from "react";
import { Button } from "@/lib/components/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/lib/components/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/lib/components/popover";
import { Check as CheckIcon, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setSelectedUser } from "../../alexandrianSlice";

export function UserSelector() {
	const dispatch = useAppDispatch();
	const { selectedUser, users, collectionType } = useAppSelector((state) => state.alexandrian);
	const [open, setOpen] = useState(false);

	const getUserDisplayName = (userId: string | null) => {
		if (!userId) return "Most Recent";
		const foundUser = users.find((u) => u.principal === userId);
		return foundUser ? foundUser.username : userId;
	};

	const getApplicableUsers = () => {
		return users.filter((user) =>
			collectionType === "NFT" ? user.hasNfts : user.hasSbts
		);
	};

	const handleUserSelect = (userId: string | null) => {
		dispatch(setSelectedUser(userId));
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="min-w-[200px] justify-between h-10"
				>
					{getUserDisplayName(selectedUser)}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandInput placeholder="Search users..." />
					<CommandList>
						<CommandEmpty>No users found.</CommandEmpty>
						<CommandGroup>
							<CommandItem onSelect={() => handleUserSelect(null)}>
								<CheckIcon
									className={cn(
										"mr-2 h-4 w-4",
										selectedUser === null ? "opacity-100" : "opacity-0"
									)}
								/>
								Most Recent
							</CommandItem>
							{getApplicableUsers().map((user) => (
								<CommandItem
									key={user.principal}
									onSelect={() => handleUserSelect(user.principal)}
								>
									<CheckIcon
										className={cn(
											"mr-2 h-4 w-4",
											selectedUser === user.principal
												? "opacity-100"
												: "opacity-0"
										)}
									/>
									{user.username}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}