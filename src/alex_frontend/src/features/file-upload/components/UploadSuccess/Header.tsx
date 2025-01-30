import React from "react";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setDetails } from "../../fileUploadSlice";

interface HeaderProps {
	file: File;
}

export const Header: React.FC<HeaderProps> = ({
	file,
}) => {
    const dispatch = useAppDispatch();
    const {details} = useAppSelector(state=>state.fileUpload);
	return (
        <div className="p-4 border-b">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <CheckCircle2
                        className="w-6 h-6 text-green-500"
                        strokeWidth={2}
                    />
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">
                            Upload Successful
                        </h3>
                        <p className="text-sm text-gray-500">{file.name}</p>
                    </div>
                </div>
                <button
                    onClick={()=>dispatch(setDetails(!details))}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                >
                    {details ? (
                        <>
                            Hide details
                            <ChevronUp
                                className="w-4 h-4 ml-1"
                                strokeWidth={2}
                            />
                        </>
                    ) : (
                        <>
                            Show details
                            <ChevronDown
                                className="w-4 h-4 ml-1"
                                strokeWidth={2}
                            />
                        </>
					)}
				</button>
			</div>
		</div>
	);
};
