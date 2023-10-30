import React, { useState } from 'react';
import { createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';

const Post = () => {
    const editor = withReact(createEditor());
    const [value, setValue] = useState([
        {
            type: 'paragraph',
            children: [{ text: 'Start writing your post here...' }],
        },
    ]);

    return (
        <div>
            <h1>Create a New Post</h1>
            <Slate editor={editor} value={value} onChange={newValue => setValue(newValue)}>
                <Editable />
            </Slate>
        </div>
    );
};

export default Post;
