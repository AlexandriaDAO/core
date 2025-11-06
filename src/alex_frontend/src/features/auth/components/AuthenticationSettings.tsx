import React from "react";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/lib/components/tabs";
import { Shield, Settings } from "lucide-react";
import EthereumSettingsComponent from "./EthereumSettings";
import SolanaSettingsComponent from "./SolanaSettings";
import ArweaveSettingsComponent from "./ArweaveSettings";
import OisySettingsComponent from "./OisySettings";

const AuthenticationSettings = () => {
	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
				<div>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
						Authentication Provider Settings
					</h2>
					<p className="text-gray-600 dark:text-gray-400">
						Configure authentication settings for each different providers
					</p>
				</div>
			</div>

			<Tabs defaultValue="ethereum" className="w-full max-w-2xl mr-auto">
				<TabsList className="h-auto grid items-center w-full grid-cols-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
					<TabsTrigger
						value="ethereum"
						className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                     data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
                     dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100
                     text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
					>
						<Settings size={16} />
						Ethereum
					</TabsTrigger>
					<TabsTrigger
						value="solana"
						className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                     data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
                     dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100
                     text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
					>
						<Settings size={16} />
						Solana
					</TabsTrigger>
					<TabsTrigger
						value="arweave"
						className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                     data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
                     dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100
                     text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
					>
						<Settings size={16} />
						Arweave
					</TabsTrigger>
					<TabsTrigger
						value="oisy"
						className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                     data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
                     dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100
                     text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
					>
						<Settings size={16} />
						Oisy
					</TabsTrigger>
				</TabsList>

				<TabsContent value="ethereum" className="mt-6">
					<EthereumSettingsComponent />
				</TabsContent>

				<TabsContent value="solana" className="mt-6">
					<SolanaSettingsComponent />
				</TabsContent>

				<TabsContent value="arweave" className="mt-6">
					<ArweaveSettingsComponent />
				</TabsContent>

				<TabsContent value="oisy" className="mt-6">
					<OisySettingsComponent />
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default AuthenticationSettings;
