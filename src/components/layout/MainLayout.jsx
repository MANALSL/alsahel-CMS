import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
            <Sidebar />

            <div className="flex-1 md:ml-64 flex flex-col min-h-screen transition-all duration-300 overflow-x-hidden">
                <Navbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
                <main className="flex-1 p-6 overflow-x-hidden w-full">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Drawer (simplified for now) */}
            {/* In a real app, I'd implement a proper mobile drawer here using the Sidebar */}
        </div>
    );
};

export default MainLayout;
