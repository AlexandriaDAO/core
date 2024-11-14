import React from "react";
import MainLayout from "@/layouts/MainLayout";
import ArweaveSearch from "@/apps/Modules/LibModules/arweaveSearch";
import ContentDisplay from "@/apps/Modules/AppModules/contentGrid";
import { useWipeOnUnmount } from "@/apps/Modules/shared/state/wiper";
import {
	PageContainer,
	Title,
	Description,
	Hint,
	SearchBox,
	Input,
	ControlsContainer,
	FiltersButton,
	SearchButton,
	OwnerIcon,
	FiltersIcon
} from "./styles";

function Permasearch() {
	useWipeOnUnmount();

	return (
		<MainLayout>
			<PageContainer>
				<Title>Permasearch</Title>
				<Description>
					Welcome to Permasearch! Here, you can explore NFTs, search by owner address 
					or principal ID, and use filters to find exactly what you're looking for.
				</Description>
				<Hint>
					Not sure where to start? Just hit 'Search' to see a random selection of 
					NFTs and discover something new!
				</Hint>
				<SearchBox>
					<OwnerIcon />
					<Input placeholder="Enter owner address or principal ID" />
				</SearchBox>
				<ControlsContainer>
					<FiltersButton>
						Filters
						<FiltersIcon />
					</FiltersButton>
					<SearchButton>Search</SearchButton>
				</ControlsContainer>
				<ArweaveSearch />
				<ContentDisplay />
			</PageContainer>
		</MainLayout>
	);
}

export default Permasearch;
