import DDC from "@/data/categories";

export interface CategoryInterface {
    id: number;
    title: string;
    typeId: number;
}

export const getCategories = (): CategoryInterface[] => {
    let categories:CategoryInterface[] = [];
	Object.entries(DDC).forEach(([typeId, {category}])=>{
        Object.entries(category).forEach(([categoryId, categoryTitle])=>{
            categories.push({
                id: Number(categoryId),
                typeId: Number(typeId),
                title: categoryTitle,
            })
        })
    });
    return categories;
};
