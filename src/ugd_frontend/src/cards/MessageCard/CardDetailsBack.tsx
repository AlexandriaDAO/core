import React from 'react'
import { CardDetailsBackProps } from './types'
import useAuthorBooks from '../../utils/useAuthorBooks';
import { useSettings } from '../../contexts/SettingsContext';

const CardDetailsBack: React.FC<CardDetailsBackProps> = ({ currentAuthorId }) => {
    const books = useAuthorBooks(currentAuthorId);
    const { topBooksCount } = useSettings();
    const topNBooks = books.slice(0, topBooksCount);


    return (
        <div className="messageCardDetailsBack">
            <div className="featureMessageCard">
                <p>Sources by Relevance</p>
            </div>
            {
                topNBooks?.map((book, index) => {
                    return (
                        <div className="messageBookCard" key={index}>
                            <h2>{book.title}</h2>
                            <p>{book.description}</p>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default CardDetailsBack
