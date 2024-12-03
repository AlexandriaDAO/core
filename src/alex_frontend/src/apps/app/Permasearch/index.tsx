import React, { useState, useEffect, useRef, forwardRef } from "react";
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
import ArweaveOwnerSelector from '@/apps/Modules/AppModules/search/selectors/ArweaveOwnerSelector';

type ContentDisplayProps = {
	ref?: React.RefObject<HTMLDivElement>;
}

function Permasearch() {
	useWipeOnUnmount();
	const dispatch = useDispatch<AppDispatch>();
	const { isLoading, handleSearch } = useHandleSearch();
	const [isFiltersOpen, setIsFiltersOpen] = useState(false);
	const contentRef = useRef<HTMLDivElement>(null);

	const handleSearchClick = async () => {
		await dispatch(wipe());
		handleSearch();
	};

	const toggleFilters = () => {
		setIsFiltersOpen(!isFiltersOpen);
	};

	useEffect(() => {
		if (isLoading === false) {
			setTimeout(() => {
				contentRef.current?.scrollIntoView({ 
					behavior: 'smooth',
					block: 'start'
				});
			}, 100);
		}
	}, [isLoading]);

	return (
		<MainLayout>
			<PageContainer>
				<Title>Permasearch</Title>
				<Description>
					Search for any asset on Arweave.
				</Description>
				<Hint>
					Save them as NFTs.
				</Hint>
				<ArweaveOwnerSelector />
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
			<div ref={contentRef}>
				<ContentDisplay />
			</div>
		</MainLayout>
	);
}

export default Permasearch;
