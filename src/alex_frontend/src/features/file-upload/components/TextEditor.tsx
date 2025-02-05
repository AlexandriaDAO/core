import React, { useState } from "react";
import { Button } from "@/lib/components/button";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setTextMode } from "../fileUploadSlice";
import { Input } from "@/lib/components/input";


// const createFileFromText = (content: string, fileName: string, mimeType: string) => {
//     const blob = new Blob([content], { type: mimeType });
//     const file = new File([blob], fileName, { type: mimeType });

//     return file;
// };

interface TextEditorProps {
    setFile: React.Dispatch<React.SetStateAction<File | null>>;
}

function TextEditor({ setFile }: TextEditorProps) {
    const dispatch = useAppDispatch();
    const [content, setContent] = useState("");
    const [fileName, setFileName] = useState("");
    const [fileType, setFileType] = useState("text/plain");

    const handleCreate = () => {
        if (!content.trim() || !fileName.trim()) {
            return;
        }

        const blob = new Blob([content], { type: fileType });
        const file = new File([blob], fileName, { type: fileType });
        setFile(file);
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <Input
                    type="text"
                    placeholder="File name (e.g., my-notes.txt)"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md"
                />
                <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    className="px-3 py-2 rounded-md bg-background text-black dark:text-white border"
                >
                    <option value="text/plain">Plain Text (.txt)</option>
                    <option value="text/markdown">Markdown (.md)</option>
                    <option value="text/html">HTML (.html)</option>
                </select>
            </div>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your content here..."
                className="w-full h-64 p-3 font-mono rounded-md bg-background text-black dark:text-white border"
            />
            <div className="flex justify-end space-x-3">
                <Button onClick={() => dispatch(setTextMode(false))} variant="muted">
                    Cancel
                </Button>
                <Button
                    onClick={handleCreate}
                    disabled={!content.trim() || !fileName.trim()}
                    variant="inverted"
                >
                    Create File
                </Button>
            </div>
        </div>
    );
}

export default TextEditor; 