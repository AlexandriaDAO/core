import React from "react";
import type { SerializableGame } from "../types";
import MinesTile from "./MinesTile";

interface MinesGridProps {
	game: SerializableGame;
	onTileClick: (index: number) => void;
	disabled: boolean;
	loadingTileIndex?: number | null;
}

const MinesGrid: React.FC<MinesGridProps> = ({ game, onTileClick, disabled, loadingTileIndex }) => {
	const isGameActive = "Active" in game.status;

	return (
		<div className="grid grid-cols-4 gap-3 p-4 bg-card border border-border rounded-xl w-full">
			{game.tiles.map((tile) => (
				<MinesTile
					key={tile.index}
					tile={tile}
					onClick={() => onTileClick(tile.index)}
					disabled={disabled}
					isClickable={isGameActive}
					isLoading={loadingTileIndex === tile.index}
				/>
			))}
		</div>
	);
};

export default MinesGrid;
