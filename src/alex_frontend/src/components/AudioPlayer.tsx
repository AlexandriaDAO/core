import React from 'react';
import { useAppSelector } from '@/store/hooks/useAppSelector';

const AudioPlayer: React.FC = () => {
	const { selected } = useAppSelector((state) => state.sonora);
	
	// Check if it's a local file (starts with blob:) or Arweave file
	const audioUrl = selected ? 
		(selected.id.startsWith('blob:') || selected.id.includes('.') ? 
			selected.id : `https://arweave.net/${selected.id}`) : '';

	return (
		<div className="rounded-full shadow-md border">
			<audio 
				controls
				className={`w-full ${!audioUrl ? 'opacity-50' : ''}`}
				src={audioUrl}
			>
				Your browser does not support the audio element.
			</audio>
		</div>
	);
};

export default AudioPlayer;
