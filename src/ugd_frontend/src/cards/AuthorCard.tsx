import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Link } from "react-router-dom";
import useStreamingText from '../utils/Stream';
import '../styles/AuthorCard.css'
import { useAuthors } from '../contexts/AuthorContext';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faRepeat, faRotateLeft, faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';

interface AuthorCardProps {
	authorId: string;
}

const AuthorCard: React.FC<AuthorCardProps> = ({ authorId }) => {
	const { authors, stats, setStats, shelf, setShelf } = useAuthors();
	const author = authors.find(a => a.id === authorId);

	if (!author) {
		return null;
	}

	const [flipped, setFlipped] = useState(false);
	const [streamed, setStreamed] = useState(false);

	const streamedDescription = useStreamingText(author.description, 10, streamed);

	useEffect(() => {

		if (flipped && !streamed) {
			setStreamed(true);
		}
	}, [flipped]);

	const handleFavorite = () => {
		alert("Favorited");
	}


	const handleCardFlip = ()=>{
		setFlipped(!flipped)

		setStats(null);
		setShelf(null);
	} 
	
	return (
		<div className="outer-div font-sans">
			<div className={`inner-div ${flipped ? 'flipped' : ''}`} style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>

				<div className="front relative bg-gradient-to-b from-[#4FCFD1] to-[#E5EBAE]">
					<div className="absolute">
						<FontAwesomeIcon icon={faStar} size='2xl' color="white" className='m-2 cursor-pointer px-1 py-1 hover:text-[#fc0]' onClick={handleFavorite} />
					</div>
					<div className='flex flex-col w-[300px] rounded overflow-hidden'>
						<div className='basis-[300px] w-full flex-grow-0 flex-shrink-0'>
							<img className="w-full h-full" src={`/images/authors/${author.id}.png`} alt="" />
						</div>
						<div className='basis-[50px] w-full flex justify-between items-center'>
							<FontAwesomeIcon icon={faRotateLeft} size='lg' className='icon-button' onClick={handleCardFlip} />
							
							<Link to="/author">
								<h3 className="hover:underline underline-offset-4 text-xl whitespace-nowrap text-ellipsis overflow-hidden p-2 flex-grow text-center">{author.id}</h3>
							</Link>

							{stats && stats == author.id ? (
								<FontAwesomeIcon onClick={()=>setStats(null)} icon={faArrowUp} size='lg' className='cursor-pointer hover:text-gray-600 m-2 px-2 py-1' /> 
							) : (
								<FontAwesomeIcon onClick={()=>setStats(author.id)} icon={faArrowDown} size='lg' className='animate-bounce cursor-pointer hover:text-gray-600 m-2 px-2 py-1' />
							)}

						</div>
						{ stats && stats == author.id && (
							<div className='stats text-sm flex flex-grow flex-col w-full py-1 gap-2 bg-gradient-to-r from-[#40C9FF] to-[#DB69E7]'>
								<div className='flex w-auto justify-center items-center'>
									<span className='px-2 font-semibold'>Rating: </span>
									<FontAwesomeIcon icon={faStar} className='text-[#fc0]' />
									<FontAwesomeIcon icon={faStar} className='text-[#fc0]' />
									<FontAwesomeIcon icon={faStar} className='text-[#fc0]' />
									<FontAwesomeIcon icon={faStar} className='text-[#fc0]' />
									<FontAwesomeIcon icon={faStar} className='text-white' />
								</div>
								<table className='table-fixed border-seperate border-spacing-2'>
									<tbody>
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
									</tbody>
								</table>
								<table className='table-fixed border-seperate border-spacing-2'>
									<tbody>
										<tr>
											<th>AI-Model</th>
											<td>Lamma-002</td>
											<th>Vectors</th>
											<td>ada-002</td>
										</tr>
									</tbody>
								</table>

								
								<div className="scrollbar-sm  w-full h-auto flex-wrap overflow-x-auto flex items-center p-3 gap-1 ">			
									<span className='font-bold px-2 '>Training</span>
									<span className="text-xs whitespace-nowrap inline-flex items-center font-semibold leading-sm px-3 py-1 bg-blue-200 text-blue-700 rounded-full">#5.21G Tokens</span>
									<span className="text-xs whitespace-nowrap inline-flex items-center font-semibold leading-sm px-3 py-1 bg-blue-200 text-blue-700 rounded-full">#4 Epochs</span>
									<span className="text-xs whitespace-nowrap inline-flex items-center font-semibold leading-sm px-3 py-1 bg-blue-200 text-blue-700 rounded-full">#35 Books</span>
									<span className="text-xs whitespace-nowrap inline-flex items-center font-semibold leading-sm px-3 py-1 bg-blue-200 text-blue-700 rounded-full">#57,829 cells</span>
									<span className="text-xs whitespace-nowrap inline-flex items-center font-semibold leading-sm px-3 py-1 bg-blue-200 text-blue-700 rounded-full">#4 Epochs</span>
									<span className="text-xs whitespace-nowrap inline-flex items-center font-semibold leading-sm px-3 py-1 bg-blue-200 text-blue-700 rounded-full">#5.21G Tokens</span>
									<span className="text-xs whitespace-nowrap inline-flex items-center font-semibold leading-sm px-3 py-1 bg-blue-200 text-blue-700 rounded-full">#35 Books</span>
								</div>
							</div>
						)}
					</div>
				</div>
				<div className="back flex flex-col justify-between items-center bg-gradient-to-b from-[#4FCFD1] to-[#E5EBAE]">
					<div className="scrollbar-sm w-full flex flex-nowrap overflow-x-auto items-center basis-[45px] shrink-0 px-2 gap-5 bg-gradient-to-r from-[#40C9FF] to-[#DB69E7]">
						{/* Should be a carousel of author.categories list. Each element should be scrollable at the top like the bookcards. These will serve as the category tags. */}
						{author.category.map((category, index) => (
							<span key={index} className="text-xs whitespace-nowrap inline-flex items-center font-semibold leading-sm px-3 py-1 bg-blue-200 text-blue-700 rounded-full">
								#{category}
							</span>
						))}
					</div>
					<div className="flex-grow flex items-center p-3 overflow-auto ">
						{/* lexend, monospace */}
						{/* <div className='h-auto max-h-full w-full '>
							{streamedDescription.split('|').map((para, index) => (
								<p key={index}>{para}</p>
							))}
						</div> */}
						<p className='h-auto max-h-full w-full text-justify break-words' >
							{streamedDescription}
						</p>
					</div>
					{/* bg-gradient-to-r from-[#fad961] to-[#FF5E00] */}
					<div className='flex basis-[50px] shrink-0 justify-evenly items-center w-full'>

						{shelf && shelf == author.id ? (
							<button onClick={()=>setShelf(null)} className='read-button flex gap-1 justify-center items-center'>
								Read <FontAwesomeIcon icon={faArrowUp} className='animate-bounce' />
							</button>
						) : (
							<button onClick={()=>setShelf(author.id)} className='read-button flex gap-1 justify-center items-center'>
								Read <FontAwesomeIcon icon={faArrowDown} className='animate-bounce' />
							</button>
						)}
						<FontAwesomeIcon icon={faRepeat} size='lg' className='icon-button' onClick={handleCardFlip} />
						<button className='buy-button'>Buy</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AuthorCard;