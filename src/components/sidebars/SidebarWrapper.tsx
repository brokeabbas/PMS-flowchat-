// src/components/sidebars/SidebarWrapper.tsx

import React, { ReactNode, useEffect, useState } from 'react';
import { XMarkIcon, ChevronDoubleRightIcon, ChevronDoubleLeftIcon } from '@heroicons/react/24/solid';

type SidebarWrapperProps = {
  children: ReactNode;
  title: string;
  onClose: () => void;
  defaultExpanded?: boolean;
};

export default function SidebarWrapper({
  children,
  title,
  onClose,
  defaultExpanded = false,
}: SidebarWrapperProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    // Trigger slide-in after mount
    requestAnimationFrame(() => setAnimateIn(true));
  }, []);

  return (
    <div
      className={`
        fixed top-[56px] right-0 h-[calc(100%-56px)] z-50 flex flex-col bg-gray-950 text-white shadow-xl border-l border-gray-800
        transition-all duration-300 ease-in-out transform
        ${animateIn ? 'translate-x-0' : 'translate-x-full'}
        ${expanded ? 'w-1/2' : 'w-96'}
        rounded-l-2xl overflow-hidden
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-start px-6 pt-6 pb-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="text-xs text-gray-500">{expanded ? 'Expanded view' : 'Compact view'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="text-gray-400 hover:text-white p-1"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? (
              <ChevronDoubleRightIcon className="w-5 h-5" />
            ) : (
              <ChevronDoubleLeftIcon className="w-5 h-5" />
            )}
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1" title="Close">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
