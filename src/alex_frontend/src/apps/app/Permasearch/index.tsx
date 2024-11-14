import React from "react";
import MainLayout from "@/layouts/MainLayout";
import ArweaveSearch from "@/apps/Modules/LibModules/arweaveSearch";
import ContentDisplay from "@/apps/Modules/AppModules/contentGrid";
import { useWipeOnUnmount } from "@/apps/Modules/shared/state/wiper";
import styled from "styled-components";
import { Search, SlidersHorizontal } from "lucide-react";

const OwnerIcon = styled(Search)`
	width: 24px;
	height: 24px;
	margin-right: 12px;
`;

const FiltersIcon = styled(SlidersHorizontal)`
	transform: rotate(90deg);
	width: 18px;
	height: var(--Fonts-Size-body, 16px);
	flex-shrink: 0;
`;


const PageContainer = styled.div`
	width: 1440px;
	height: 1186px;
	background: var(--Colors-LightMode-Text-text-100, #FFF);
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 40px 0;
`;

const Title = styled.h1`
	width: 1328px;
	color: var(--Colors-LightMode-Text-text-500, #000);
	text-align: center;
	font-family: Syne;
	font-size: 54px;
	font-style: normal;
	font-weight: 700;
	line-height: normal;
	margin-bottom: 24px;
`;

const Description = styled.p`
	color: var(--Colors-LightMode-Text-text-500, #000);
	text-align: center;
	font-family: Poppins;
	font-size: 18px;
	font-style: normal;
	font-weight: 400;
	line-height: 150%;
	margin-bottom: 16px;
`;

const Hint = styled(Description)`
	font-weight: 700;
	margin-bottom: 32px;
`;

const SearchBox = styled.div`
	display: flex;
	width: 800px;
	height: 60px;
	padding: 16px 20px;
	align-items: center;
	border-radius: 30px;
	border: 1px solid var(--black-grey-400, #CCC);
	background: var(--Colors-LightMode-Text-text-100, #FFF);
	margin-bottom: 24px;
`;

const Input = styled.input`
	flex: 1;
	border: none;
	outline: none;
	color: var(--black-grey-300, #808080);
	font-family: Syne;
	font-size: 18px;
	font-style: normal;
	font-weight: 400;
	line-height: normal;
`;

const ControlsContainer = styled.div`
	display: flex;
	gap: 16px;
	margin-bottom: 32px;
`;

const FiltersButton = styled.button`
	display: flex;
	width: 221px;
	height: 60px;
	padding: 10px 24px;
	justify-content: center;
	align-items: center;
	gap: 10px;
	border-radius: 30px;
	border: 1px solid var(--black-grey-100, #353535);
	background: transparent;
	cursor: pointer;
	font-family: Syne;
	font-size: 16px;
`;

const SearchButton = styled.button`
	display: flex;
	height: 60px;
	padding: 10px 24px;
	justify-content: center;
	align-items: center;
	gap: 10px;
	flex: 1 0 0;
	border-radius: 30px;
	background: var(--black-grey-100, #353535);
	border: none;
	color: white;
	cursor: pointer;
	font-family: Syne;
	font-size: 16px;
`;

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
