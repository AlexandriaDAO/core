import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import SearchedCards from './SearchedCards'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'



interface PreviewCardInterface {
    selectedSourceCards: any[]
    setSelectedSourceCards: React.Dispatch<React.SetStateAction<any[]>>
}

const PreviewCard: React.FC<PreviewCardInterface> = ({ selectedSourceCards, setSelectedSourceCards }) => {
    const [isOpened, setIsOpened] = useState<boolean>(true)
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

        setSelectedSourceCards(items)

    }

    const getItemStyle = (isDragging: any, draggableStyle: any) => ({
        userSelect: "none",
        padding: grid * 2,
        margin: `0 0 ${grid}px 0`,
        background: isDragging ? "lightgreen" : "#fff",
        ...draggableStyle
    });


    const getListStyle = (isDraggingOver: any) => ({
        background: isDraggingOver ? "lightblue" : "#fff",
        padding: grid,
    });

    return (
        <div className='mainPreviewCardsContainer' >
            <div className="innerPreviewContainer">
                <div className="previewContainerHeader">
                    <h2>Preview Card</h2>

                    <button onClick={() => setIsOpened(!isOpened)}><FontAwesomeIcon icon={isOpened ? faChevronUp : faChevronDown} size='sm' /></button>
                </div>
                <div className={!isOpened ? "innerPreviewCardsContainerBx hide" : "innerPreviewCardsContainerBx"}>

                    <div className="PreviewCardsContainerBx">
                        <div className="previewCardBx">
                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="droppable">
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            style={getListStyle(snapshot.isDraggingOver)}
                                        >
                                            {
                                                selectedSourceCards?.map((item, index) => {
                                                    let uniqueId = item.title + index
                                                    return (
                                                        <Draggable key={uniqueId} draggableId={uniqueId} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    style={getItemStyle(
                                                                        snapshot.isDragging,
                                                                        provided.draggableProps.style
                                                                    )}
                                                                >
                                                                    <SearchedCards item={item} isHideCta={true} />
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    )
                                                })
                                            }
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>

                        </div>
                        <div className="previewCardCta">

                            <button>Sumarize</button>
                            <button>Ai Output</button>
                            <button>Rating</button>
                            <button>Optimze Results</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PreviewCard
