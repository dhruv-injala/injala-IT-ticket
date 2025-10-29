import React from 'react';
import Navbar from './Navbar';
import NotificationCenter from './NotificationCenter';

const Layout = ({ children }) => {
  return (
    <div className="min-vh-100">
      <Navbar />
      <main className="py-4">
        <div className="container-fluid">
          {children}
        </div>
      </main>
      <NotificationCenter />
    </div>
  );
};

export default Layout;

