import DDC from "@/data/categories";

export interface TypeInterface {
    id: number;
    title: string;
    image: string;
}
// export const getTypes = ():TypeInterface[] => {
// 	return Object.entries(DDC).map(([typeId, {image, type}])=>({
//         id: typeId,
//         title: type,
//         image: image
//     }))
// };


export const types: TypeInterface[] = Object.keys(DDC).map(key => {
    const id = Number(key);
    return {
        id: id,
        title: DDC[id].type,
        image: DDC[id].image
    };
});