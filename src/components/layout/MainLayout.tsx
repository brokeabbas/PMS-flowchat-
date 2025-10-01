import React, { useState } from 'react';
import Sidebar from './Sidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen w-screen flex bg-gray-50 font-sans transition-all duration-300">
      {/* Sidebar wrapper with animated width */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          sidebarOpen ? 'w-64' : 'w-0'
        } overflow-hidden`}
      >
        <Sidebar collapsed={!sidebarOpen} />
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-hidden relative transition-all duration-500">
        {React.cloneElement(children as React.ReactElement, {
          toggleSidebar: () => setSidebarOpen((prev) => !prev),
          sidebarOpen,
        })}
      </div>
    </div>
  );
}
