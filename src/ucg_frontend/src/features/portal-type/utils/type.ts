import DDC from "@/data/categories";

export interface TypeInterface {
    id: string;
    title: string;
    image: string;
}
export const getTypes = ():TypeInterface[] => {
	return Object.entries(DDC).map(([typeId, {image, type}])=>({
        id: typeId,
        title: type,
        image: image
    }))
};
