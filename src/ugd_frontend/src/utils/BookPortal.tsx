export const titleToFileName = (title: string) => {
  // Check if 'title' is not a string or if it's undefined/null
  if (typeof title !== 'string' || title == null || title == undefined) {
      console.error('title must be a string and cannot be undefined or null');
      return ''; // Return a default value or handle the error as appropriate
  }

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
              author: bookData.author,
              description: bookData.description,
              fiction: bookData.fiction,
              type: bookData.type,
              subtype: bookData.subtype,
              pubyear: bookData.pubyear,
              language: bookData.language,
              publisher: bookData.publisher,
              rights: bookData.rights,
              isbn: bookData.isbn,

              // not filled by user. Preset by backend.
              asset: bookData.asset,
              ucbg: bookData.ucbg,
              minted: bookData.minted,
              modified: bookData.modified,
            })
        ],
        { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = titleToFileName(bookData.title) + "_MetaData.json";
    link.click();
};
