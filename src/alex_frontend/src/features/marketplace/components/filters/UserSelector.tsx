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
import { Principal } from "@dfinity/principal";
import { useListingUsers } from "../../hooks";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setSelectedUser } from "@/features/marketplace/marketplaceSlice";

interface UserSelectorProps {
	disabled?: boolean;
}

export function UserSelector({ disabled }: UserSelectorProps) {
	const dispatch = useAppDispatch();
	const { selectedUser } = useAppSelector((state) => state.marketplace);
	const [open, setOpen] = useState(false);
	const { users, isLoading } = useListingUsers();

	const getUserDisplayName = (userPrincipal?: Principal) => {
		if (!userPrincipal) return "All Users";
		
		// Find the user info for this principal
		const userInfo = users.find(u => u.principal.toString() === userPrincipal.toString());
		if (userInfo) {
			return `${userInfo.username} (${userInfo.listing_count})`;
		}
		
		return "Unknown User";
	};

	const handleUserSelect = (user?: Principal) => {
		dispatch(setSelectedUser(user));
		setOpen(false);
	};

	if (isLoading) {
		return (
			<Button variant="outline" disabled className="min-w-[150px] justify-between h-10">
				Loading users...
				<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
			</Button>
		);
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					disabled={disabled}
					className="min-w-[150px] justify-between h-10"
				>
					{getUserDisplayName(selectedUser)}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[250px] p-0">
				<Command>
					<CommandInput placeholder="Search users..." />
					<CommandList>
						<CommandEmpty>No users found.</CommandEmpty>
						<CommandGroup>
							{/* "All Users" option */}
							<CommandItem onSelect={() => handleUserSelect(undefined)}>
								<CheckIcon
									className={cn(
										"mr-2 h-4 w-4",
										!selectedUser ? "opacity-100" : "opacity-0"
									)}
								/>
								All Users
							</CommandItem>

							{/* Individual users */}
							{users.map((userInfo) => (
								<CommandItem
									key={userInfo.principal.toString()}
									onSelect={() => handleUserSelect(userInfo.principal)}
								>
									<CheckIcon
										className={cn(
											"mr-2 h-4 w-4",
											selectedUser?.toString() === userInfo.principal.toString()
												? "opacity-100"
												: "opacity-0"
										)}
									/>
									<div className="flex flex-col">
										<span className="font-medium text-sm">
											{userInfo.username}
										</span>
										<span className="text-xs text-muted-foreground">
											{userInfo.listing_count.toString()} listing{userInfo.listing_count !== 1n ? 's' : ''}
										</span>
									</div>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}