import DDC from "@/data/categories";
import React from "react";

export const getSubTypes = (bookSubType: number[] = []) => {
    if(bookSubType.length == 0 ) return [];

    const subtypeTexts:Array<string> = [];

    // Iterate over each type
    Object.values(DDC).forEach(type => {
        // Check each subtype in the category
        Object.entries(type.category).forEach(([key, value]) => {
            if (bookSubType.includes(parseInt(key))) {
                subtypeTexts.push(value);
            }
        });
    });

    return subtypeTexts;
}