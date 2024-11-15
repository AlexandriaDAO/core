import React, { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import SearchForm from '@/apps/Modules/AppModules/search/SearchForm';
import ContentDisplay from "@/apps/Modules/AppModules/contentGrid";
import { useWipeOnUnmount } from "@/apps/Modules/shared/state/wiper";
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { wipe } from '@/apps/Modules/shared/state/wiper';
import { useHandleSearch } from '@/apps/Modules/AppModules/search/hooks/useSearchHandlers';
import {
	PageContainer,
	Title,
	Description,
	Hint,
	ControlsContainer,
	FiltersButton,
	SearchButton,
	FiltersIcon,
	SearchFormContainer
} from "./styles";
import { ArrowUp } from "lucide-react";

function Permasearch() {
	useWipeOnUnmount();
	const dispatch = useDispatch<AppDispatch>();
	const { isLoading, handleSearch } = useHandleSearch();
	const [isFiltersOpen, setIsFiltersOpen] = useState(false);

	const handleSearchClick = async () => {
		await dispatch(wipe());
		handleSearch();
	};

	const toggleFilters = () => {
		setIsFiltersOpen(!isFiltersOpen);
	};

	return (
		<MainLayout>
			<PageContainer>
				<Title>Permasearch</Title>
				<Description>
					Search for any asset on Arweave.
				</Description>
				<Hint>
					Save it to your wallet as an NFT.
				</Hint>
				<ControlsContainer $isOpen={isFiltersOpen}>
					<FiltersButton 
						onClick={toggleFilters}
						$isOpen={isFiltersOpen}
					>
						Filters
						{isFiltersOpen ? <ArrowUp size={20} /> : <FiltersIcon />}
					</FiltersButton>
					<SearchButton 
						onClick={handleSearchClick}
						disabled={isLoading}
					>
						{isLoading ? 'Loading...' : 'Search'}
					</SearchButton>
				</ControlsContainer>
				<SearchFormContainer $isOpen={isFiltersOpen}>
					<SearchForm />
				</SearchFormContainer>
			</PageContainer>
			<ContentDisplay />
		</MainLayout>
	);
}

export default Permasearch;
