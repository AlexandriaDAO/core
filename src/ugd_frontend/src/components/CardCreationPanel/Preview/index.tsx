import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import Card from "./Card";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { LoadStatus, useAI } from "@/contexts/AIContext";

interface PreviewInterface {
	selectedSourceCards: any[];
	setSelectedSourceCards: React.Dispatch<React.SetStateAction<any[]>>;
}

const Preview: React.FC<PreviewInterface> = ({
	selectedSourceCards,
	setSelectedSourceCards,
}) => {
	const { initRef, model, loadModel, loadStatus } = useAI();

	const [isOpened, setIsOpened] = useState<boolean>(true);
	const grid = selectedSourceCards.length;

	const reorder = (list: any, startIndex: any, endIndex: any) => {
		const result = Array.from(list);
		const [removed] = result.splice(startIndex, 1);
		result.splice(endIndex, 0, removed);

		return result;
	};

	function onDragEnd(result: any) {
		if (!result.destination) {
			return;
		}

		const items = reorder(
			selectedSourceCards,
			result.source.index,
			result.destination.index
		);

		setSelectedSourceCards(items);
	}

	const getItemStyle = (isDragging: any, draggableStyle: any) => ({
		userSelect: "none",
		padding: grid * 2,
		margin: `0 0 ${grid}px 0`,
		background: isDragging ? "lightgreen" : "#fff",
		...draggableStyle,
	});

	const getListStyle = (isDraggingOver: any) => ({
		background: isDraggingOver ? "lightblue" : "#fff",
		padding: grid,
	});

	const summarize = () => {
		console.log(selectedSourceCards);
	};

	return (
		<div>
			{loadStatus == LoadStatus.Initialized && (
				<div ref={initRef} className="p-2 bg-white">
					Waiting...
				</div>
			)}
			<div className="mainPreviewCardsContainer">
				<div className="innerPreviewContainer">
					<div className="previewContainerHeader">
						<h2>Preview Card</h2>

						<button onClick={() => setIsOpened(!isOpened)}>
							<FontAwesomeIcon
								icon={isOpened ? faChevronUp : faChevronDown}
								size="sm"
							/>
						</button>
					</div>
					<div
						className={
							!isOpened
								? "innerPreviewCardsContainerBx hide"
								: "innerPreviewCardsContainerBx"
						}
					>
						<div className="PreviewCardsContainerBx">
							<div className="previewCardBx">
								<DragDropContext onDragEnd={onDragEnd}>
									<Droppable droppableId="droppable">
										{(provided, snapshot) => (
											<div
												{...provided.droppableProps}
												ref={provided.innerRef}
												style={getListStyle(
													snapshot.isDraggingOver
												)}
											>
												{selectedSourceCards?.map(
													(item, index) => {
														let uniqueId =
															item.title + index;
														return (
															<Draggable
																key={uniqueId}
																draggableId={
																	uniqueId
																}
																index={index}
															>
																{(
																	provided,
																	snapshot
																) => (
																	<div
																		ref={
																			provided.innerRef
																		}
																		{...provided.draggableProps}
																		{...provided.dragHandleProps}
																		style={getItemStyle(
																			snapshot.isDragging,
																			provided
																				.draggableProps
																				.style
																		)}
																	>
																		<Card
																			item={
																				item
																			}
																		/>
																	</div>
																)}
															</Draggable>
														);
													}
												)}
												{provided.placeholder}
											</div>
										)}
									</Droppable>
								</DragDropContext>
							</div>
							<div className="previewCardCta">
								{model ? (
									<button 
                                        disabled = {model ? true : false }
                                        className={`${ model ? '!bg-gray-500 cursor-not-allowed':''}`}
                                    >
										Model Loaded
									</button>
								) : (
									<button
										onClick={loadModel}
										disabled={
											loadStatus == LoadStatus.Initialized
										}
										className={`${
											loadStatus == LoadStatus.Initialized
												? "bg-gray-500 cursor-not-allowed"
												: "bg-[#00b5ad] cursor-pointer"
										} px-4 py-1 w-auto h-auto text-white rounded text-lg font-medium`}
									>
										Load AI Model
									</button>
								)}
								<button>Ai Output</button>
								<button>Rating</button>
								<button>Optimze Results</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Preview;
