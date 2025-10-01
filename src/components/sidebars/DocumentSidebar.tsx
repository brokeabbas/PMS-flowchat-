// src/components/sidebars/DocumentSidebar.tsx

import React, { useState } from 'react';
import SidebarWrapper from './SidebarWrapper';

type Props = {
  nodeId: string;
  onClose: () => void;
};

const DocumentSidebar: React.FC<Props> = ({ nodeId, onClose }) => {
  const [documents, setDocuments] = useState<File[]>([]);

  const handleFiles = (files: FileList) => {
    setDocuments((prev) => [...prev, ...Array.from(files)]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <SidebarWrapper title={`📄 Upload for ${nodeId}`} onClose={onClose}>
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-700 bg-gray-900/40 p-4 rounded-md text-center mb-6 transition hover:bg-gray-800"
      >
        <p className="text-gray-300">Drag and drop files here</p>
        <p className="text-gray-500 text-sm">or</p>
        <label className="cursor-pointer text-blue-400 hover:underline">
          Browse files
          <input
            type="file"
            multiple
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />
        </label>
      </div>

      {/* File list */}
      <ul className="space-y-3 text-sm">
        {documents.map((doc, index) => (
          <li key={index} className="flex justify-between items-center bg-gray-800 rounded px-3 py-2">
            <span className="text-gray-100 truncate">{doc.name}</span>
            <button
              onClick={() => removeDocument(index)}
              className="text-red-400 hover:text-red-600 text-xs"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* Placeholder footer */}
      {documents.length === 0 && (
        <div className="text-xs text-gray-500 italic mt-8">No uploaded documents yet.</div>
      )}
    </SidebarWrapper>
  );
};

export default DocumentSidebar;
