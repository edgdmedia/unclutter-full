// src/components/journal/NotebookEditor.jsx
import React from 'react';

const NotebookEditor = ({ content, onChange }) => {
    const notebookClasses = `
    min-h-[calc(100vh-8rem)]
    bg-white
    rounded-lg
    shadow-lg
    p-8
    mx-auto
    max-w-4xl
    relative
    border-l-4
    border-blue-100
  `;

    const pageLineClasses = `
    bg-white
    relative
    min-h-[2rem]
    border-b
    border-blue-50
    focus:outline-none
    text-lg
    leading-relaxed
    w-full
    px-4
    py-2
    resize-none
  `;

    return (
        <div className={notebookClasses}>
            <textarea
                className={pageLineClasses}
                value={content}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Start writing..."
                rows={20}
            />
        </div>
    );
};

export default NotebookEditor;