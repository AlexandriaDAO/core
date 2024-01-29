export const titleToFileName = (title: string) => {
	return title
		.toLowerCase() // convert to lowercase
		.replace(/['"]/g, "") // remove apostrophes and quotes
		.replace(/\s+/g, "-") // replace spaces with hyphens
		.replace(/[^\w-]/g, ""); // remove any non-word (excluding hyphens) characters
}

export const removeNewLines = (text: string) => {
	return text.replace(/\r?\n|\r/g, "");
}


export const handleJSONDownload = (bookData:any) => {
    // <CSVLink filename={} headers={metadataHeaders} data={[metadata]} className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded">Export to JSON</CSVLink>

    const blob = new Blob(
        [
            JSON.stringify({
                title: bookData.title,
                creator: bookData.creator,
                description: bookData.description,
                pubdate: bookData.pubdate,
                publisher: bookData.publisher,
                identifier: bookData.identifier,
                language: bookData.language,
                rights: bookData.rights,
                modified_date: bookData.modified_date,
            }),
        ],
        { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = titleToFileName(bookData.title) + "_MetaData.json";
    link.click();
};
