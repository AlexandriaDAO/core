import React, { useEffect } from "react";
import {
	FullScreenToggleStyle as defaultFullScreenToggleStyles,
	type IFullScreenToggleStyle,
} from "./style";
import { useReader } from "../../hooks/useReaderContext";

interface FullScreenToggleProps {
	fullScreenToggleStyles?: IFullScreenToggleStyle;
}

const FullScreenToggle: React.FC<FullScreenToggleProps> = ({
	fullScreenToggleStyles = defaultFullScreenToggleStyles,
}) => {
	const { bookLocation, fullScreen, setFullScreen } = useReader();

	useEffect(() => {
		const handleFullScreenChange = () => {
			setFullScreen(document.fullscreenElement !== null);
		};

		document.addEventListener("fullscreenchange", handleFullScreenChange);

		return () => {
			document.removeEventListener(
				"fullscreenchange",
				handleFullScreenChange
			);
		};
	}, [setFullScreen]);

	function toggleFullScreen() {
		if (!bookLocation.current) return;
		const element = bookLocation.current;

		if (!document.fullscreenElement) {
			if (element.requestFullscreen) {
				element.requestFullscreen();
			}
			setFullScreen(true);
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			}
			setFullScreen(false);
		}
	}

	return (
		<>
			{/* {fullScreen ? (
				<BiExitFullscreen
					onClick={toggleFullScreen}
					size={30}
					className="cursor-pointer p-0.5 text-indigo-800 hover:text-gray-500"
				/>
			) : (
				<BiFullscreen
					onClick={toggleFullScreen}
					size={30}
					className="cursor-pointer p-0.5 hover:text-indigo-800 text-gray-500"
				/>
			)} */}

			{fullScreen ? (
				<button
					onClick={toggleFullScreen}
					className="font-roboto-condensed text-xl text-white underline"
				>
					Exit
				</button>
			) : (
				<button
					onClick={toggleFullScreen}
					className="font-roboto-condensed text-xl text-white underline"
				>
					Full Screen
				</button>
			)}
		</>
	);
};

export default FullScreenToggle;
