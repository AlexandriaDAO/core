import React from "react";
import MainLayout from "@/layouts/MainLayout";
import { MdEdit } from "react-icons/md";
import { FaCopy } from "react-icons/fa";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import EngineOverview from "@/features/engine-overview";
import PublicEngines from "@/features/public-engines";
import MyEngine from "@/components/MyEngine";
import Librarian from "@/features/librarian";

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
			{/* <div className="flex-grow flex items-start p-4 gap-4">
				<div className="flex-grow flex flex-col gap-4">
          <EngineOverview />
				</div>
        {
						user !== "" && (
							<>
								<MyEngine />
								<Librarian />
							</>
						)
					}
			</div> */}
		</MainLayout>
	);
}

export default MintPage;