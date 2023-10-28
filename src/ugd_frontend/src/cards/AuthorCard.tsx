import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import useStreamingText from '../../utils/Stream';
import '../../styles/AuthorCard.css';
import { useAuthors } from '../contexts/AuthorContext';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faStar, faRepeat, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import VirtualBookShelf from '../semantic-library/VirtualBookshelf';

interface AuthorCardProps {
	authorId: string;
	setActiveAuthor?: Dispatch<SetStateAction<string>> 
}

const AuthorCard: React.FC<AuthorCardProps> = ({ authorId, setActiveAuthor}) => {
	const { authors } = useAuthors();
	const author = authors.find(a => a.id === authorId);

	if (!author) {
		return null;
	}

	const [flipped, setFlipped] = useState(false);
	const [streamed, setStreamed] = useState(false);

	const [statsVisible, setStatsVisible] = useState(false);
	const [shelfVisible, setShelfVisible] = useState(false);

	const streamedDescription = useStreamingText(author.description, 10, streamed);

	useEffect(() => {

		if (flipped && !streamed) {
			setStreamed(true);
		}
	}, [flipped]);

	const handleFavorite = () => {
		alert("Favorited");
	}

	const handleReadClick = ()=>{
		if(setActiveAuthor) setActiveAuthor(author.id);
		setShelfVisible(!shelfVisible)
	}

	return (
		<div>
			<div className="outer-div font-sans">
				<div className={`inner-div ${flipped ? 'flipped' : ''}`} style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>

					<div className="front flex flex-col">
					<div className="front__bkg-photo flex-shrink-0  flex items-start justify-between">
						<FontAwesomeIcon icon={faStar} size='2xl' className='front__icon text-gray-300 m-2 cursor-pointer px-1 py-1 hover:text-[#fc0]' onClick={handleFavorite} />
=					</div>
						<div className='relative flex-shrink-0 basis-[150px]'>
							<img className="front__face-photo" src={`/images/${author.id}.png`} alt="" />
							<div className='flex justify-between items-center relative top-[100px]'>
							<FontAwesomeIcon icon={faRotateLeft} size='2xl' className='front__icon text-black-300 m-2 cursor-pointer px-2 py-1' onClick={() => setFlipped(true)} />

								<h3 className="text-2xl p-2 flex-grow text-center">{author.id}</h3>
								{!statsVisible && <FontAwesomeIcon onClick={()=>setStatsVisible(true)} icon={faChevronDown} size='xl' className='m-2 cursor-pointer px-2 py-1' /> }
								{statsVisible && <FontAwesomeIcon onClick={()=>setStatsVisible(false)} icon={faChevronUp} size='xl' className='m-2 cursor-pointer px-2 py-1' /> }
							</div>
						</div>

						{statsVisible && <div className='text-sm flex flex-grow flex-col w-full py-1 gap-2'>
							<div className='flex w-auto justify-center items-center'>
								<span>Rating: </span> 
								<FontAwesomeIcon icon={faStar}  className='text-[#fc0] p-2' />
								<FontAwesomeIcon icon={faStar}  className='text-[#fc0] p-2' />
								<FontAwesomeIcon icon={faStar}  className='text-[#fc0] p-2' />
								<FontAwesomeIcon icon={faStar}  className='text-[#fc0] p-2' />
								<FontAwesomeIcon icon={faStar}  className='text-white p-2' />
							</div>
							<table className='table-fixed border-seperate border-spacing-2'>
								<tr>
									<th>TTS</th>
									<td>3.6m</td>
									<th>CPT</th>
									<td>$0.024</td>
									<th>30d</th>
									<td>623k</td>
								</tr>
								<tr>
									<th>MP</th>
									<td>$15</td>
	
									<th>CBT</th>
									<td>$0.004</td>

									<th>90d</th>
									<td>923k</td>
								</tr>
								<tr>
									<th></th>
									<td></td>
									<th>AP</th>
									<td>--</td>
									<th>Age</th>
									<td>8mo</td>
								</tr>
							</table>
							<table className='table-fixed border-seperate border-spacing-2'>
								<tr>
									<th>AI-Model</th>
									<td>Lamma-002</td>
									<th>Vectors</th>
									<td>ada-002</td>
								</tr>
							</table>
							
							<div className='flex flex-wrap gap-0.5'>
								<span className='font-bold px-2 '>Training</span>
								<span className='border-2 border-solid border-black rounded-full px-1 mx-1'> #5.21G Tokens </span>
								<span className='border-2 border-solid border-black rounded-full px-1 mx-1'> #4 Epochs </span>
								<span className='border-2 border-solid border-black rounded-full px-1 mx-1'> #35 Books </span>
								<span className='border-2 border-solid border-black rounded-full px-1 mx-1'> #57,829 cells </span>
							</div>
						</div>}

					</div>
					<div className="back flex flex-col justify-between items-center">
						<div className="w-full flex basis-[30px] shrink-0 items-center justify-end">
							{/* Should be a carousel of author.categories list. Each element should be scrollable at the top like the bookcards. These will serve as the category tags. */}
							{author.category.map((category, index) => (
								<span key={index} className="category-tag">
										#{category}
								</span>
							))}
						</div>
						<div className="flex-grow flex items-center p-3 text-xl overflow-auto text-justify">
							<p className='h-auto max-h-full w-full'>
								{streamedDescription}
							</p>
						</div>
						<div className='flex basis-[60px] shrink-0 justify-evenly items-center w-full'>
							<button onClick={handleReadClick} className='bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-5 border-2 border-black border-solid rounded'>Read</button>
								<FontAwesomeIcon icon={faRepeat} size='xl' className='bg-gray-200 m-2 cursor-pointer rounded-full px-2 py-1 border-2 border-black border-solid hover:bg-black hover:text-white' onClick={() => setFlipped(false)} />
							<button className='bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-5 border-2 border-black border-solid rounded'>Buy</button>
						</div>
					</div>
				</div>
			</div>
			{shelfVisible && (
				<div key={`extra-${author.id}`} className="virtual-bookshelf-container" style={{ height: '100%', gridColumnStart: 1, gridColumnEnd: -1 }}>
				<VirtualBookShelf author={author.id} />
				</div>
			)}
		</div>

	);
};

export default AuthorCard;