import { Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onMenuClick }) => {
    const { user } = useAuth();

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 h-16 px-6 flex items-center justify-between md:justify-end">
            <button
                onClick={onMenuClick}
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
                <Menu size={24} />
            </button>

            <div className="flex items-center space-x-4">
                <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-gray-900">{user?.name || 'Admin'}</span>
                    <span className="text-xs text-gray-500 capitalize">{user?.role || 'Administrator'}</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                    {user?.name?.[0]?.toUpperCase() || 'A'}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
