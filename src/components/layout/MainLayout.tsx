import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const MainLayout: React.FC = () => {
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            <Sidebar />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
