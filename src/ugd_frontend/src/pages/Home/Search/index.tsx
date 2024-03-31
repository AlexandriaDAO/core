import React from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import Card from "./Card";
import Read from "./Read";
import { useAppSelector } from "@/store/hooks/useAppSelector";

type Props = {};
const cards = [
	{
		id: 1,
		image: "generalities-and-it.png",
		title: "Card 1",
		description: "This is card 1 description.",
	},
	{
		id: 2,
		image: "generalities-and-it.png",
		title: "Card 2",
		description: "This is card 2 description.",
	},
	{
		id: 3,
		image: "generalities-and-it.png",
		title: "Card 3",
		description: "This is card 3 description.",
	},
	{
		id: 4,
		image: "generalities-and-it.png",
		title: "Card 4",
		description:
			"Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda ex nostrum architecto eum ab eaque, possimus maxime officia deleniti necessitatibus nulla quo obcaecati corrupti. Iure expedita totam asperiores natus laboriosam repudiandae sint, enim necessitatibus eveniet eum quae veniam quidem rerum officia quam dolor et nisi porro id eius molestias repellendus voluptate. Delectus nam minus quisquam magnam quia. Corporis explicabo quas, aperiam illum beatae voluptatem natus illo iste doloribus ipsum quae atque ea consectetur repudiandae dolorem inventore sed! Veritatis, dignissimos, expedita porro excepturi harum asperiores velit veniam quod fugit, reprehenderit nesciunt! Qui culpa non rerum corrupti odit quidem aspernatur. Quam, itaque.",
	},
	{
		id: 5,
		image: "generalities-and-it.png",
		title: "Card 5",
		description: "UFOs and extraterrestrials on the moon, and worries about ET telepathic/mind control powers. The agency was so secret that it had no paper trail, and hence no written secrecy agreements.The agency was so secret that it had no paper trail, and hence no written secrecy agreements.UFOs and extraterrestrials on the moon, and worries about ET telepathic/mind control powers. UFOs and extraterrestrials on the moon, and worries about ET telepathic/mind control powers. The agency was so secret that it had no paper trail, and hence no written secrecy agreements.The agency was so secret that it had no paper trail, and hence no written secrecy agreements.UFOs and extraterrestrials on the moon, and worries about ET telepathic/mind control powers. UFOs and extraterrestrials on the moon, and worries about ET telepathic/mind control powers. The agency was so secret that it had no paper trail, and hence no written secrecy agreements.The agency was so secret that it had no paper trail, and hence no written secrecy agreements.UFOs and extraterrestrials on the moon, and worries about ET telepathic/mind control powers. ",
	},
	{
		id: 6,
		image: "generalities-and-it.png",
		title: "Card 6",
		description: "This is card 3 description.",
	},
	{
		id: 7,
		image: "generalities-and-it.png",
		title: "Card 7",
		description: "UFOs and extraterrestrials on the moon, and worries about ET telepathic/mind control powers. The agency was so secret that it had no paper trail, and hence no written secrecy agreements.The agency was so secret that it had no paper trail, and hence no written secrecy agreements.UFOs and extraterrestrials on the moon, and worries about ET telepathic/mind control powers. ",
	},
	{
		id: 8,
		image: "generalities-and-it.png",
		title: "Card 8",
		description:
			"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Molestiae atque esse hic consequuntur nostrum quia minima sapiente vero perspiciatis sed beatae, voluptatem sint, reiciendis voluptates corporis laudantium incidunt repudiandae eveniet?",
	},
	{
		id: 9,
		image: "generalities-and-it.png",
		title: "Card 9",
		description: "This is card 3 description.",
	},
	{
		id: 10,
		image: "generalities-and-it.png",
		title: "Card 10",
		description: "This is card 1 description.",
	},
	{
		id: 11,
		image: "generalities-and-it.png",
		title: "Card 11",
		description: "This is card 2 description.",
	},
	{
		id: 12,
		image: "generalities-and-it.png",
		title: "Card 12",
		description: "This is card 3 description.",
	},
];

const Search = (props: Props) => {
    const {selectedSearchedBook} =  useAppSelector(state=>state.home)

	return (
		<div className="p-4 flex flex-col gap-2">
			{selectedSearchedBook && <Read item={selectedSearchedBook}/>}
			<ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
				<Masonry gutter="25px">
					{cards.map((card) => card.id !== selectedSearchedBook?.id && (
						<Card item={card} />
					))}
				</Masonry>
			</ResponsiveMasonry>
		</div>
	);
};

export default Search;
