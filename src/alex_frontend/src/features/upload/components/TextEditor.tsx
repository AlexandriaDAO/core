import React, { useState } from "react";
import { Button } from "@/lib/components/button";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setTextMode } from "../uploadSlice";

interface TextEditorProps {
    setFile: React.Dispatch<React.SetStateAction<File | null>>;
}

function TextEditor({ setFile }: TextEditorProps) {
    const dispatch = useAppDispatch();
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
        setFile(file);
    };

    return (
        <div className="font-roboto-condensed bg-secondary rounded-lg shadow-md p-8 border border-border">
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                    {fileTypes.map(({ mimeType, extension, label, icon }) => (
                        <button
                            key={mimeType}
                            onClick={() => setFileType(mimeType)}
                            className={`
                                flex items-center justify-center gap-2 p-3 rounded-lg
                                transition-all duration-200 ease-in-out
                                ${fileType === mimeType
                                    ? 'bg-gray-100 ring-2 ring-gray-400 dark:bg-gray-700 dark:ring-gray-500'
                                    : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700'}
                                border border-gray-200 dark:border-gray-600
                            `}
                        >
                            <span className="text-xl" role="img" aria-label={label}>{icon}</span>
                            <div className="flex flex-col items-start">
                                <span className="text-sm font-medium">{label}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {extension}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter your content here..."
                    className="w-full h-64 p-3 font-mono rounded-md bg-white text-black dark:bg-gray-800 dark:text-foreground border border-gray-400 focus-visible:ring-gray-700"
                />

                <div className="flex justify-end space-x-3">
                    <Button onClick={() => dispatch(setTextMode(false))} variant="muted">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={!content.trim()}
                        variant="inverted"
                    >
                        Create File
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default TextEditor; 