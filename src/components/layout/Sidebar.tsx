import React, { useState } from 'react';
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiClock,
  FiUser,
  FiLogOut,
} from 'react-icons/fi';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  return (
    <div
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-white h-screen border-r transition-all duration-300 flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <img
              src="../../assets/kougar-logo.png"
              alt="Kougar Logo"
              className="h-6 w-6 object-contain"
            />
            <h1 className="text-xl font-bold">KougarPM</h1>
          </div>
        )}
        <button onClick={toggleSidebar}>
          {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="flex items-center bg-gray-100 rounded px-2 py-1">
          <FiSearch className="text-gray-500" />
          {!isCollapsed && (
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="bg-transparent ml-2 outline-none w-full"
            />
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="p-4">
        {!isCollapsed && <h2 className="text-sm font-semibold mb-2">Filter by Status</h2>}
        <div className="flex flex-col space-y-2">
          {['all', 'approved', 'pending', 'not_approved'].map((status) => {
            const color =
              status === 'approved'
                ? 'green'
                : status === 'pending'
                ? 'orange'
                : status === 'not_approved'
                ? 'red'
                : 'gray';
            return (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`flex items-center space-x-2 ${
                  statusFilter === status
                    ? `text-${color}-500`
                    : 'text-gray-700'
                }`}
              >
                {status !== 'all' ? (
                  <span className={`w-2 h-2 bg-${color}-500 rounded-full`}></span>
                ) : (
                  <FiFilter />
                )}
                {!isCollapsed && (
                  <span className="capitalize">
                    {status.replace('_', ' ')}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Past Projects */}
      <div className="p-4 flex-1 overflow-y-auto">
        {!isCollapsed && <h2 className="text-sm font-semibold mb-2">Past Projects</h2>}
        <ul className="space-y-2">
          {['Project Alpha', 'Project Beta'].map((project) => (
            <li key={project} className="flex items-center space-x-2 text-gray-700">
              <FiClock />
              {!isCollapsed && <span>{project}</span>}
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <FiUser className="text-gray-700" />
          {!isCollapsed && <span className="text-gray-700">John Doe</span>}
        </div>
        <button className="flex items-center space-x-2 mt-2 text-red-500">
          <FiLogOut />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
