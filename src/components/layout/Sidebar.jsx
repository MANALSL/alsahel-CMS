import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Beef, Factory, LogOut, Syringe } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { pathname } = useLocation();
    const { logout } = useAuth();

    const links = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Élevage', path: '/elevage', icon: Beef },
        { name: 'Vaccination', path: '/vaccination', icon: Syringe },
        { name: 'Production', path: '/production', icon: Factory },
    ];

    return (
        <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0">
            <div className="p-6 flex items-center justify-center border-b border-gray-100">
                <img
                    src="/logo.png"
                    alt="Couvoir Jaber"
                    className="h-20 w-auto object-contain"
                />
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.path;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={clsx(
                                'flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group',
                                isActive
                                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            )}
                        >
                            <Icon
                                size={20}
                                className={clsx(
                                    'mr-3 transition-colors duration-200',
                                    isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                                )}
                            />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={logout}
                    className="flex w-full items-center px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors duration-200"
                >
                    <LogOut size={20} className="mr-3" />
                    Déconnexion
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
