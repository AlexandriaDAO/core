import DDC from '@/data/categories';
import React from 'react';
import { setNewBook } from "../mintSlice";
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';

const SelectedCategories: React.FC = () => {
	const dispatch = useAppDispatch();
	const { newBook } = useAppSelector((state) => state.mint);

	const removeCategory = (category: number) => {
		const categories = newBook.categories.filter((c) => c !== category);
		dispatch(setNewBook({...newBook, categories}));
	};


	return (
		<div className='flex flex-wrap w-full gap-1'>
			{newBook.categories.map((category, index) => (
				<span
					key={index}
					onClick={() => removeCategory(category)}
					style={{
						cursor: 'pointer',
						margin: '0 5px',
						padding: '5px 10px',
						display: 'inline-block',
						background: '#e0e0e0',
						borderRadius: '15px',
						border: 'none',
						fontSize: '14px'
					}}
				>
					{DDC[Math.floor(category / 10)]?.category[category]} <b style={{ cursor: 'pointer' }}>✕</b>
				</span>
			))}
		</div>
	);
};

export default SelectedCategories;
