
import React, {
    useEffect,
	useRef,
} from "react";
import BookModal from "./BookModal";
import { setSelectedCategory } from "@/features/home/homeSlice";
import BooksCarousel from "./BookCarousel";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";


const categories = [
	{
		key: 1,
		title: "Generalities And IT",
		image: "generalities-and-it.png",
		books: 2014,
	},
	{ key: 2, title: "Philosophy", image: "philosophy.png", books: 519 },
	{ key: 3, title: "Religion", image: "religion.png", books: 1300 },
	{
		key: 4,
		title: "Social Sciences",
		image: "social-sciences.png",
		books: 2014,
	},
	{ key: 5, title: "Language", image: "language.png", books: 405 },
	{ key: 6, title: "Science", image: "science.png", books: 780 },
	{ key: 7, title: "Technology", image: "technology.png", books: 1900 },
	{
		key: 8,
		title: "Art and Recreation",
		image: "art-and-recreation.png",
		books: 3400,
	},
	{ key: 9, title: "Literature", image: "literature.png", books: 4750 },
	{
		key: 10,
		title: "History and Geography",
		image: "history-and-geography.png",
		books: 2713,
	},
];

function Categories() {

    const dispatch = useAppDispatch();
    const {selectedBook, selectedCategory} = useAppSelector(state=>state.home)

    const categoryRef = useRef<HTMLDivElement>(null); // Ref for the container div
	const bookModalRef = useRef<HTMLDivElement>(null); // Ref for the container div
	const bookCarouselRef = useRef<HTMLDivElement>(null); // Ref for the container div

	const handleCategoryClick = (category: any) => {
        dispatch(setSelectedCategory(category))
	};

    useEffect(()=>{
        if(selectedCategory && categoryRef.current) {
            // Use scrollIntoView to smoothly scroll the container
            categoryRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    },[selectedCategory])

	const hideSelectedCategory = (e: React.MouseEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		dispatch(setSelectedCategory(null));
	};

    useEffect(()=>{
        if(selectedBook){
            if (bookModalRef.current) {
                // Use scrollIntoView to smoothly scroll the container
                bookModalRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }else if(bookCarouselRef.current){
                bookCarouselRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "end",
                });
            }
        }else{
            if(bookCarouselRef.current){
                bookCarouselRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }
        }
    } , [selectedBook])

	return (    
        <div
            className="flex-grow flex flex-wrap items-stretch text-white"
            ref={categoryRef}
        >
            {categories.map((category) => (
                <div
                    key={category.title}
                    className={`flex flex-col  ${
                        selectedCategory &&
                        selectedCategory.key == category.key
                            ? "basis-full order-first"
                            : "basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 order-none"
                    }`}
                >
                    <div
                        className={`flex-grow flex-shrink-0 basis-[780px] border text-center cursor-pointer bg-cover bg-center flex flex-col justify-end relative`}
                        onClick={() => handleCategoryClick(category)}
                        style={{
                            backgroundImage: `url(images/categories/${category.image})`,
                        }}
                    >
                        {selectedCategory &&
                            selectedCategory.key === category.key && (
                                <div
                                    onClick={hideSelectedCategory}
                                    className="flex justify-between items-center p-2 border border-solid border-white rounded-full absolute top-8 right-8"
                                >
                                    <svg
                                        width="30"
                                        height="30"
                                        viewBox="0 0 30 26"
                                        fill="currentColor"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M13.1617 1.08745C13.3372 1.26323 13.4359 1.50151 13.4359 1.74995C13.4359 1.99838 13.3372 2.23667 13.1617 2.41245L3.51324 12.0624L28.7492 12.0624C28.9978 12.0624 29.2363 12.1612 29.4121 12.337C29.5879 12.5128 29.6867 12.7513 29.6867 12.9999C29.6867 13.2486 29.5879 13.487 29.4121 13.6629C29.2363 13.8387 28.9978 13.9374 28.7492 13.9374L3.51324 13.9374L13.1617 23.5874C13.3273 23.7652 13.4174 24.0002 13.4131 24.2431C13.4089 24.486 13.3105 24.7177 13.1387 24.8895C12.9669 25.0612 12.7352 25.1596 12.4923 25.1639C12.2495 25.1682 12.0144 25.078 11.8367 24.9124L0.586675 13.6624C0.411112 13.4867 0.3125 13.2484 0.3125 12.9999C0.3125 12.7515 0.411112 12.5132 0.586675 12.3374L11.8367 1.08745C12.0125 0.911882 12.2507 0.813271 12.4992 0.813271C12.7476 0.813271 12.9859 0.911882 13.1617 1.08745Z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                </div>
                            )}

                        <div
                            className={`md:p-6 p-4 ${
                                selectedCategory &&
                                selectedCategory.key === category.key
                                    ? "w-1/5"
                                    : "w-full"
                            } flex flex-col justify-between items-center  gap-6`}
                        >
                            {/* <h1 className=" font-syne text-2xl lg:text-3xl xl:text-4xl basis-20"> */}
                            <h1 className="text-[5vw] sm:text-[4vw] md:text-[3vw] lg:text-[2vw]  font-syne basis-20">
                                {category.title}
                            </h1>
                            <span className="font-roboto-condensed text-2xl self-end">
                                {category.books} books
                            </span>
                        </div>
                    </div>

                    {selectedCategory && selectedCategory.key === category.key && <div ref={bookCarouselRef} className="" > <BooksCarousel/></div>}

                    {selectedBook && selectedCategory && selectedCategory.key === category.key && <div ref={bookModalRef}> <BookModal /> </div> }

                </div>
            ))}
        </div>
	);
}

export default Categories;
