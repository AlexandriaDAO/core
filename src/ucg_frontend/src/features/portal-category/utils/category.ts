import DDC from "src/ucg_frontend/src/data/categories";

export interface CategoryInterface {
    id: string;
    title: string;
    image: string;
}

export const getCategories = (): CategoryInterface[] => {
    let categories:any = [];
	Object.entries(DDC).forEach(([typeId, {category}])=>{
        Object.entries(category).forEach(([categoryId, categoryTitle])=>{
            categories.push({
                id: categoryId,
                typeId: typeId,
                title: categoryTitle,
            })
        })
    });
    return categories;
};
