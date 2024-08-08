import Epub from "epubjs";

export const getCover = async (url:string)=>{
    const ebook = Epub(url, { openAs: "epub" });

    const coverUrl = await ebook.coverUrl();

    // throws error in console.
    ebook.destroy();

    return coverUrl;
}