// Will revisit this when vetkeys works.
// It's time to upload generic content as well. Not just books.

import React from "react";
import MainLayout from "@/layouts/MainLayout";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Mint from "@/features/mint";


function MintPage() {
	const { activeEngine } = useAppSelector(
		(state) => state.engineOverview
	);
	const { user } = useAppSelector(
		(state) => state.auth
	);

	return (
		<MainLayout>
      <Mint />
		</MainLayout>
	);
}

export default MintPage;