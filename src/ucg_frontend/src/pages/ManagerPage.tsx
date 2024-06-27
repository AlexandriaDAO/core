import React from "react";
import MainLayout from "@/layouts/MainLayout";
import { MdEdit } from "react-icons/md";
import { FaCopy } from "react-icons/fa";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import MyEngines from "@/features/my-engines";
import EngineOverview from "@/features/engine-overview";
import PublicEngines from "@/features/public-engines";
import Librarian from "@/features/librarian";
import LibrarianProfile from "@/features/librarian-profile";


function ManagerPage() {
	const { activeEngine } = useAppSelector(
		(state) => state.engineOverview
	);
	const { user } = useAppSelector(
		(state) => state.auth
	);

	const {showProfile} = useAppSelector(
		(state)=>state.librarianProfile
	)

	return (
		<MainLayout>
			<div className="flex-grow flex items-start p-4 gap-4">
				<div className="basis-1/4 flex flex-col items-start gap-10">
					<div className="w-full p-3 flex gap-2 flex-col shadow-lg rounded-xl bg-white">
						<div className="flex justify-between items-center">
							<div className="font-syne font-medium text-xl text-black">Manager Data</div>
							<MdEdit/>
						</div>
						<div>
							<span className="uppercase font-roboto-condensed text-base">Principal:</span>
							<div className="flex gap-2 justify-start items-center">
								<span className="uppercase font-roboto-condensed text-base">234fh567thgkl.456000thgkl.45</span>
								<FaCopy size={16}/>
							</div>
						</div>
						<div>
							<span className="uppercase font-roboto-condensed text-base">Wallet:</span>
							<div className="flex gap-2 justify-start items-center">
								<span className="uppercase font-roboto-condensed text-base">234fh567thgkl.45600034fh567</span>
								<FaCopy size={16}/>
							</div>
						</div>
						<div className="bg-yellow-200 p-2 flex flex-col gap-1">
							<span className="uppercase font-roboto-condensed text-base font-bold">Balance:</span>
							<span className="uppercase font-roboto-condensed text-3xl font-bold">32.01 ICP</span>
						</div>
					</div>
					{
						user !== "" && (
							<>
								<MyEngines />
								<Librarian />
							</>
						)
					}

				</div>

				<div className="flex-grow flex flex-col gap-4">
					{showProfile && <LibrarianProfile />}

					{activeEngine ? <EngineOverview /> : <PublicEngines />}
				</div>

			</div>
		</MainLayout>
	);
}

export default ManagerPage;


// <!-- This was my way (evan). Above is zeeshans way.					{user!=='' && <MyEngines /> }
// 				</div>

// 				{activeEngine ? <EngineOverview /> : <PublicEngines />} -->