import { useState, useEffect } from "react";
import { MeiliSearch } from "meilisearch";
import { getClient } from "@/services/meiliService";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setError, setLoading, setSearchResults } from "@/features/search/searchSlice";

const useMeili = () => {
    const dispatch = useAppDispatch();
    const {searchText} = useAppSelector(state=>state.search)
    const {types, subTypes} = useAppSelector(state=>state.filter)
	const [client, setClient] = useState<MeiliSearch | null>(null);

	useEffect(() => {
		const initialize = async () => {
            const meiliClient = await getClient();
			setClient(meiliClient);
		}
        initialize();
	}, []);


    const performSearch = async () =>{
        try {
            if(!client ) return;
            dispatch(setLoading(true))

            const indexes = await client.getIndexes();
            if(indexes.total > 0 && searchText.length>0){
                const filter = [];
                if(types.length > 0){
                    filter.push('type IN ['+ types.join(',')+']')
                }
                if(subTypes.length>0){
                    filter.push('subtype IN ['+ subTypes.join() + ']')
                }

                const config:any = {
                    attributesToHighlight: ['text', 'title'],
                    highlightPreTag: '<span class="bg-yellow-300">',
                    highlightPostTag: '</span>',
                }

                if(filter.length>0 ){
                    config.filter = filter;
                }

                console.log(config);
                const results = await indexes.results[0].search(searchText, config)

                dispatch(setSearchResults(results.hits))
            }
        } catch (error) {
            console.log("Unable to perform search", error);
            dispatch(setSearchResults([]))
            if (error instanceof Error) {
                dispatch(setError(error.message))
            }else{
                dispatch(setError("An unknown error occurred while performing Search"))
            }
        }finally{
            dispatch(setLoading(false))
        }
    }
	return { client, performSearch };
};

export default useMeili;
