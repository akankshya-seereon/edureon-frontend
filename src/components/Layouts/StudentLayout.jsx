import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar'; 
import { Header } from '../Common/Header'; 

export const StudentLayout = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Read from local storage
    const storedUserStr = localStorage.getItem('user');
    
    if (storedUserStr) {
      try {
        const parsed = JSON.parse(storedUserStr);
        
        // 🌟 THE DEEP EXTRACTOR: Backends nest data differently. 
        // This checks every possible hiding spot for the user data!
        const actualUser = 
          parsed?.data?.user || 
          parsed?.user || 
          parsed?.data || 
          parsed;

        setCurrentUser(actualUser);
        console.log("✅ Layout re-hydrated user:", actualUser);

      } catch (error) {
        console.error("Failed to parse user from local storage", error);
      }
    }
    
    // Stop the loading screen once we've checked
    setIsLoading(false);
  }, []);

  // 🌟 If we are still checking local storage, don't show the wrong header!
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50 font-bold text-slate-400 tracking-widest uppercase">Loading Portal...</div>;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Sidebar gets the verified user */}
      <Sidebar user={currentUser} />
      
      <div className="ml-64 flex-1 flex flex-col h-screen">
        
        {/* Header gets the verified user */}
        <Header user={currentUser} />
        
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {children}
        </main>

      </div>
    </div>
  );
};