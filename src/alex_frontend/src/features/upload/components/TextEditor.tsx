import React, { useState } from "react";
import { Button } from "@/lib/components/button";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { ContentType, setContentType, setTextEditor } from "@/features/upload/uploadSlice";
import { ChevronDown, ChevronUp, FilePlus } from "lucide-react";

interface TextEditorProps {
    setFile: React.Dispatch<React.SetStateAction<File | null>>;
}

function TextEditor({ setFile }: TextEditorProps) {
    const dispatch = useAppDispatch();
    const { textEditor } = useAppSelector(state => state.upload);
    const [content, setContent] = useState("");
    const [fileType, setFileType] = useState("text/plain");

    const fileTypes = [
        {
            mimeType: "text/plain",
            extension: ".txt",
            label: "Plain Text",
            icon: "📄"
        },
        {
            mimeType: "text/markdown",
            extension: ".md",
            label: "Markdown",
            icon: "📝"
        },
        {
            mimeType: "text/html",
            extension: ".html",
            label: "HTML",
            icon: "🌐"
        }
    ];

    const handleCreate = () => {
        if (!content.trim()) return;

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const selectedType = fileTypes.find(type => type.mimeType === fileType);
        const fileName = `note-${timestamp}${selectedType?.extension}`;
        const blob = new Blob([content], { type: fileType });
        const file = new File([blob], fileName, { type: fileType });
        setContent("");
        setFile(file);
    };

    return (
        <div className="w-full font-roboto-condensed space-y-4">
            <button
                onClick={() => dispatch(setTextEditor(!textEditor))}
                className="w-full font-syne text-xl flex items-center justify-between hover:opacity-70 transition-opacity"
            >
                <h2 className="text-xl font-semibold">Enter Text Content</h2>
                <span className="text-sm">
                    {textEditor ? (
                        <ChevronUp
                            className="w-6 h-6"
                            strokeWidth={2}
                        />
                    ) : (
                        <ChevronDown
                            className="w-6 h-6"
                            strokeWidth={2}
                        />
					)}
				</span>
            </button>

            {textEditor && (
                <>
                    <div className="flex flex-col gap-2">
                        {/* <h3 className="text-base font-medium">Type {"("}.txt, .md, .html{")"}</h3> */}

                        <div className="grid grid-cols-3 gap-2">
                            {fileTypes.map(({ mimeType, extension, label, icon }) => (
                                <div
                                    key={mimeType}
                                    className={`grid grid-cols-[auto,1fr] grid-rows-2 items-center gap-x-2 p-2 rounded cursor-pointer transition-colors ${
                                        fileType === mimeType
                                            ? 'bg-gray-100 dark:bg-gray-700'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                    onClick={() => setFileType(mimeType)}
                                >
                                    <input
                                        type="radio"
                                        name="fileType"
                                        value={mimeType}
                                        checked={fileType === mimeType}
                                        onChange={() => setFileType(mimeType)}
                                        className="row-span-1 self-center"
                                    />
                                    <span className="font-medium">{label}</span>
                                    <div className="col-start-2 text-xs text-gray-500 dark:text-gray-400">{extension}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Enter your content here..."
                            className="w-full h-64 p-3 font-mono rounded-md bg-white text-black dark:bg-gray-800 dark:text-foreground border border-gray-400 focus-visible:ring-gray-700"
                        />
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground">Enter the text that will become the content of your NFT</p>
                            <Button variant="muted" className="h-4" scale="sm" onClick={handleCreate} disabled={!content.trim()}>
                                <FilePlus className="w-4 h-4" />Create Your File
                            </Button>
                        </div>
                    </div>

                </>
            )}

        </div>
    );
}

export default TextEditor; 