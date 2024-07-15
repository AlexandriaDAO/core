import DDC from "@/data/categories";

export interface CategoryInterface {
    id: string;
    title: string;
    typeId: string;
}

export const getCategories = (): CategoryInterface[] => {
    let categories:CategoryInterface[] = [];
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
