import React from "react";
import { useNavigate } from "react-router";
import { Button } from "@/lib/components/button";
import { ArrowLeft, Home } from "lucide-react";

const UnauthorizedPage: React.FC = () => {
	const navigate = useNavigate();

	return (
		<>
			<div className="min-h-[80vh] flex items-center justify-center px-4">
				<div className="text-center">
					<h1 className="text-9xl font-bold text-gray-200">401</h1>

					<div className="mt-4">
						<h3 className="text-2xl font-semibold text-gray-800 md:text-3xl">
							Unauthorized
						</h3>

						<p className="mt-4 text-gray-600">
							You are not authorized to access this page.
						</p>

						<div className="mt-8 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
                            <Button variant="info" className="px-8 flex gap-2 justify-center items-center" onClick={() => navigate(-1)}>
                                <ArrowLeft size={20}/>
                                <span>Go Back</span>
                            </Button>
                            <Button variant="link" className="px-8 flex gap-2 justify-center items-center" onClick={() => navigate("/")}>
                                <Home size={18} />
                                <span>Go Home</span>
                            </Button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default UnauthorizedPage;
