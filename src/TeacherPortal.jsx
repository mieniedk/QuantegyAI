// src/pages/TeacherPortal.jsx

import React, { useState } from 'react';

const TeacherPortal = () => {
  const [className, setClassName] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [classCreated, setClassCreated] = useState(false);

  const handleCreateClass = () => {
    // In a real application, you would send this data to a server
    setClassCreated(true);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ textAlign: 'center' }}>
        <img
          src="/path/to/your/logo.png"
          alt="Quantagy AI Logo"
          style={{ maxWidth: '200px', marginBottom: '20px' }}
        />
        <h1>Teacher Portal</h1>
      </header>
      
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2>Create Class</h2>
        
        <div style={{ marginBottom: '10px' }}>
          <label>
            Class Name:
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label>
            Class Description:
            <textarea
              value={classDescription}
              onChange={(e) => setClassDescription(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>
        
        <button
          onClick={handleCreateClass}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007BFF',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Create Class
        </button>

        {classCreated && (
          <div style={{ marginTop: '20px', color: 'green', fontWeight: 'bold' }}>
            Class Created: {className}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherPortal;
