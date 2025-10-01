import React, { useState } from 'react';
import SidebarWrapper from './SidebarWrapper';

type Props = {
  onClose: () => void;
};

export default function ClientFormSidebar({ onClose }: Props) {
  const [form, setForm] = useState({
    company: '',
    contact: '',
    title: '',
    email: '',
    phone: '',
    location: '',
  });

  const [mode, setMode] = useState<'create' | 'saved'>('create');

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Submitted:', form);
    setMode('saved');
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this inquiry?')) {
      setForm({
        company: '',
        contact: '',
        title: '',
        email: '',
        phone: '',
        location: '',
      });
      setMode('create');
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6 text-sm">
      {[
        { label: 'Company Name', field: 'company' },
        { label: 'Contact Person', field: 'contact' },
        { label: 'Title', field: 'title' },
        { label: 'Email Address', field: 'email', type: 'email' },
        { label: 'Phone Number', field: 'phone' },
        { label: 'Location', field: 'location' },
      ].map(({ label, field, type }) => (
        <DarkInput
          key={field}
          label={label}
          type={type}
          value={(form as any)[field]}
          onChange={(val) => updateField(field, val)}
        />
      ))}

      <button
        type="submit"
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md w-full font-semibold text-sm transition"
      >
        ✅ Submit Inquiry
      </button>
    </form>
  );

  const renderInfo = () => (
    <div className="space-y-6 text-base">
      {Object.values(form).every((val) => !val.trim()) ? (
        <div className="text-gray-500 italic text-center mt-8">No information provided yet.</div>
      ) : (
        <div className="space-y-4 text-gray-200">
          {Object.entries(form).map(([key, val]) => (
            <div key={key} className="flex justify-between items-center border-b border-gray-800 pb-2">
              <span className="capitalize text-gray-400 text-sm font-medium">
                {key.replace('_', ' ')}:
              </span>
              <span className="text-lg font-semibold truncate">{val || '-'}</span>
            </div>
          ))}
        </div>
      )}
  
      <div className="pt-6 flex gap-4">
        <button
          onClick={() => setMode('create')}
          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded text-sm"
        >
          ✏️ Edit
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
  
  return (
    <SidebarWrapper title="📋 Client Inquiry Form" onClose={onClose} defaultExpanded={false}>
      {mode === 'create' ? renderForm() : renderInfo()}
    </SidebarWrapper>
  );
}

type InputProps = {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
};

const DarkInput = ({ label, value, onChange, type = 'text' }: InputProps) => (
  <div>
    <label className="block mb-1 text-gray-300 text-sm font-medium">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
    />
  </div>
);
