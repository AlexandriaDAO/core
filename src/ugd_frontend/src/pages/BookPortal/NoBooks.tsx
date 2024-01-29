import React from "react";

const NoBooks = () => {
	return (
        <div className="flex items-center mt-6 text-center border border-gray-800 rounded-lg h-auto py-10 bg-blue-200">
            <div className="flex flex-col w-full px-4 mx-auto">
                <div className="p-3 mx-auto text-blue-500 bg-blue-100 rounded-full ">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        />
                    </svg>
                </div>
                <h1 className="mt-3 text-lg font-semibold text-gray-800 ">
                    No Books found
                </h1>
                <p className="mt-2 text-base text-gray-500 ">
                    You haven't uploaded any file yet. Feel free
                    to upload an ebook. Thank You!
                </p>
            </div>
        </div>
	);
};

export default NoBooks;
