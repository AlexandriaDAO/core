import React, { useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { ImSpinner8 } from "react-icons/im";
import MyNodes from "@/features/my-nodes";
import AddNode from "@/features/my-nodes/components/AddNode";
import NoNode from "@/features/librarian-profile/components/NoNode";
import fetchMyNodes from "@/features/my-nodes/thunks/fetchMyNodes";
import LibrarianForm from "@/features/librarian/components/LibrarianForm";
import { MdLockOutline } from "react-icons/md";
import checkLibrarian from "@/features/librarian/thunks/checkLibrarian";
import FundNode from "@/features/fund-node";
import useSession from "@/hooks/useSession";

function LibrarianPage() {
	const {checkAuthentication} = useSession();
	const dispatch = useAppDispatch();

	const { user, loading: userLoading } = useAppSelector((state) => state.auth);
	const { nodes, loading: nodesLoading } = useAppSelector((state) => state.myNodes);
	const { isLibrarian, loading: librarianLoading } = useAppSelector(state => state.librarian);

	useEffect(() => {
		checkAuthentication();
	}, [dispatch]);

	useEffect(() => {
		if (isLibrarian) {
			dispatch(fetchMyNodes());
		}
	}, [isLibrarian, dispatch]);

	useEffect(() => {
		if (user) {
			dispatch(checkLibrarian());
		}
	}, [user, dispatch]);

	if (userLoading || librarianLoading) {
		return <LoadingView />;
	} else if (!user) {
		return <LoginRequiredView />;
	} else if (isLibrarian) {
		return <LibrarianDashboard nodes={nodes} nodesLoading={nodesLoading} />;
	} else {
		return <NonLibrarianView />;
	}
}

function LoadingView() {
	return (
		<MainLayout>
			<div className="flex-grow flex items-center justify-center">
				<ImSpinner8 className="animate-spin text-4xl text-primary" />
			</div>
		</MainLayout>
	);
}

function LoginRequiredView() {
	return (
		<MainLayout>
			<div className="flex-grow flex items-center justify-center">
				<div className="bg-white p-8 rounded-xl shadow-lg">
					<h2 className="font-syne text-2xl font-bold mb-4">
						Login Required
					</h2>
					<p className="font-roboto-condensed text-lg">
						Please log in to access the Librarian Page.
					</p>
				</div>
			</div>
		</MainLayout>
	);
}

function LibrarianDashboard({ nodes, nodesLoading }: { nodes: any[], nodesLoading: boolean }) {
	return (
		<MainLayout>
			<div className="flex-grow flex items-start p-4 gap-4">
				<LibrarianSidebar nodes={nodes} nodesLoading={nodesLoading} />
				<LibrarianContent nodes={nodes} nodesLoading={nodesLoading} />
			</div>
		</MainLayout>
	);
}

function LibrarianSidebar({ nodes, nodesLoading }: { nodes: any[], nodesLoading: boolean }) {
	return (
		<div className="basis-1/4 flex flex-col items-start gap-4">
			<DashboardSummary nodesCount={nodes.length} />
			{!nodesLoading && nodes.length > 0 && <FundNode />}
			<AddNodeSection />
		</div>
	);
}

function DashboardSummary({ nodesCount }: { nodesCount: number }) {
	return (
		<div className="w-full p-3 flex gap-2 flex-col shadow-lg rounded-xl bg-white">
			<div className="font-syne font-medium text-xl text-black">
				Librarian Dashboard
			</div>
			<div className="bg-yellow-200 p-2 flex flex-col gap-1">
				<span className="uppercase font-roboto-condensed text-base font-bold">
					Total Nodes:
				</span>
				<span className="uppercase font-roboto-condensed text-3xl font-bold">
					{nodesCount}
				</span>
			</div>
		</div>
	);
}

function AddNodeSection() {
	return (
		<div className="w-full p-3 flex flex-col shadow-lg rounded-xl bg-white">
			<div className="font-syne font-medium text-xl text-black mb-2">
				Add New Node
			</div>
			<p className="font-roboto-condensed font-medium text-base mb-4">
				Create a new node to expand your library.
				Each node represents a unique piece of
				content or resource.
			</p>
			<div className="flex justify-start items-center">
				<AddNode />
			</div>
		</div>
	);
}

function LibrarianContent({ nodes, nodesLoading }: { nodes: any[], nodesLoading: boolean }) {
	return (
		<div className="basis-3/4 flex flex-col gap-6 p-8 shadow-lg rounded-xl bg-white">
			<LibrarianProfileHeader nodesLoading={nodesLoading} />
			<div className="flex flex-col justify-between gap-2 items-center">
				{nodes.length > 0 ? <MyNodes /> : <NoNode />}
			</div>
		</div>
	);
}

function LibrarianProfileHeader({ nodesLoading }: { nodesLoading: boolean }) {
	return (
		<div className="flex justify-between items-center">
			<div className="flex items-center gap-2">
				<span className="font-syne text-xl font-bold">
					Librarian Profile
				</span>
				{nodesLoading && (
					<ImSpinner8
						size={20}
						className="animate animate-spin"
					/>
				)}
			</div>
		</div>
	);
}

function NonLibrarianView() {
	return (
		<MainLayout>
			<div className="flex-grow flex items-start p-4 gap-4">
				<div className="basis-1/4">
					<NonLibrarianSidebar />
				</div>
				<div className="basis-3/4 flex flex-col gap-6 p-8 shadow-lg rounded-xl bg-white">
					<LibrarianForm />
				</div>
			</div>
		</MainLayout>
	);
}

function NonLibrarianSidebar() {
	return (
		<div className="w-full p-3 flex gap-2 flex-col shadow-lg rounded-xl bg-white">
			<div className="flex flex-col items-center justify-between gap-3">
				<MdLockOutline
					size={40}
					color="black"
					className="bg-[#D9D9D9] rounded-full border border-solid border-dark p-2"
				/>
				<span className="font-roboto-condensed font-medium text-base">
					Become Librarian to create your personal nodes and
					access librarian profile data
				</span>
			</div>
		</div>
	);
}

export default LibrarianPage;