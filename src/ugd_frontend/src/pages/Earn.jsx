import React, { useEffect, useState } from 'react'
import SearchBar from '../header/SearchBar';
import useBackgroundPosition from '../../utils/useBackgroundPosition';
import Tabs from '../header/Tabs'
import AuthorPanel from '../the-greats/AuthorPanel';
import AUTHOR_INFO from '../../assets/author_data';

function Earn() {
	const [imageUrl, setImageUrl] = useState(null);
	const backgroundPosition = useBackgroundPosition();
	const [selectedAuthors, setSelectedAuthors] = useState(AUTHOR_INFO.map(author => author.id));
	const [selectedCategories, setSelectedCategories] = useState([]);
  
	useEffect(() => {
	  const image = require.context('../../assets/public/images/', false, /\.(png|jpe?g|svg)$/);
	  setImageUrl(image('./BlackedOut.png').default);
	}, []);
  
	return (
		<div style={{ position: 'relative', minHeight: '100vh' }}>
		{imageUrl && (
		  <div id="imageContainer" style={{
			backgroundImage: `url(${imageUrl})`,
			backgroundPosition: backgroundPosition,
			backgroundSize: 'cover',
			backgroundAttachment: 'fixed',
			position: 'absolute',
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			opacity: '0.5',
			zIndex: -1,
		  }} />
		)}
		<div style={{ paddingTop: '25px' }}>
		  <Tabs/>

		  	<div className='w-3/4 mt-10 flex flex-col items-center justify-center mx-auto font-sans gap-2'>
				<div className='flex justify-between w-full'> 
					<h3> Your Assets: </h3> 
					<button className='bg-[#ebb8af] border-2 border-sold border-black rounded px-4 py-1 '>Wallet 50 icp</button>
				</div>
				<div className='flex justify-between items-center w-full'> 
					<h3> Author Cards: </h3> 
					<div className='flex gap-2 items-center'>
						<button className='bg-[#ebb8af] border-2 border-sold border-black rounded px-4 py-1 '>Unclaimed 5 icp</button>						
						<button className='bg-[#8fd14f] border-2 border-sold border-black rounded px-2 py-0.5 '>Claim All</button>
					</div>
				</div>
			</div>



		  <div className='main-grid-container'>
			<AuthorPanel authors={AUTHOR_INFO.filter(author => 
			  selectedAuthors.includes(author.id) &&
			  (selectedCategories.length === 0 || 
			  selectedCategories.some(cat => author.category.includes(cat)))
			)} />
		  </div>
		</div>
	  </div>
	)
}

export default Earn