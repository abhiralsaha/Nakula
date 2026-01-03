import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    CheckSquare,
    Target,
    Headphones,
    Trophy,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    User,
    MoreVertical,
    Sun,
    Moon,
    Menu,
    X,
    Home,
    LayoutGrid,
    PieChart,
    Focus,
    Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Layout = ({ children }) => {
    // Media query hook equivalent
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Sidebar state
    // On mobile: isOpen controls the drawer (false by default)
    // On desktop: isOpen controls the collapsed state (true by default)
    const [isOpen, setIsOpen] = useState(!isMobile);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const { user, logout } = useAuth();
    const { theme, toggleTheme, isDark } = useTheme();
    const location = useLocation();

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile && !isOpen) {
                setIsOpen(true); // Default to open on desktop if switching from mobile
            } else if (mobile && isOpen) {
                setIsOpen(false); // Default to closed on mobile
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close mobile drawer on route change
    useEffect(() => {
        if (isMobile) {
            setIsOpen(false);
        }
    }, [location, isMobile]);

    const navItems = [
        { path: '/', label: 'Home', icon: <Home /> },
        { path: '/tasks', label: 'Daily Planner', icon: <LayoutGrid /> },
        { path: '/focus', label: 'Focus Mode', icon: <Focus /> },
        { path: '/habits', label: 'Habits', icon: <Activity /> },
        { path: '/goals', label: 'Goals', icon: <Target /> },

    ];

    const toggleSidebar = () => setIsOpen(!isOpen);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const avatarUrl = user?.user_metadata?.avatar_url;
    const email = user?.email;

    // Sidebar variants
    const sidebarVariants = {
        desktop: {
            width: isOpen ? 300 : 90,
            transition: { type: "spring", stiffness: 300, damping: 30 }
        },
        mobileOpen: {
            x: 0,
            width: 280, // Fixed width for mobile drawer
            position: 'fixed',
            zIndex: 50,
            height: '100%',
            transition: { type: "spring", stiffness: 300, damping: 30 }
        },
        mobileClosed: {
            x: "-100%",
            width: 280,
            position: 'fixed',
            zIndex: 50,
            height: '100%',
            transition: { type: "spring", stiffness: 300, damping: 30 }
        }
    };

    return (
        <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-300 ${isDark ? 'bg-black text-white selection:bg-white selection:text-black' : 'bg-gray-50 text-gray-900 selection:bg-gray-900 selection:text-white'}`}>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobile && isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black z-40 backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={isMobile ? "mobileClosed" : "desktop"}
                animate={
                    isMobile
                        ? (isOpen ? "mobileOpen" : "mobileClosed")
                        : "desktop"
                }
                variants={sidebarVariants}
                className={`h-full flex flex-col flex-shrink-0 border-r transition-colors duration-300 ${isMobile ? 'absolute shadow-2xl' : 'relative'
                    } ${isDark ? 'bg-black border-zinc-800' : 'bg-white border-gray-200'}`}
            >
                {/* Header */}
                <div className="p-8 h-24 flex items-center justify-between">
                    <AnimatePresence mode='wait'>
                        {!isMobile && !isOpen ? (
                            <motion.div
                                key="logo-collapsed"
                                className="w-full flex justify-center"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="relative w-10 h-6">
                                    <div className={`absolute left-0 top-0 w-6 h-6 rounded-full ${isDark ? 'bg-indigo-500' : 'bg-gray-900'}`} />
                                    <div className={`absolute left-3 top-0 w-6 h-6 rounded-full ${isDark ? 'bg-indigo-500' : 'bg-gray-900'}`} />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="logo-expanded"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-3 cursor-pointer group"
                                onClick={!isMobile ? toggleSidebar : undefined}
                            >
                                <div className="relative w-10 h-6 group-hover:scale-105 transition-transform">
                                    <div className={`absolute left-0 top-0 w-6 h-6 rounded-full ${isDark ? 'bg-indigo-500' : 'bg-gray-900'}`} />
                                    <div className={`absolute left-3 top-0 w-6 h-6 rounded-full ${isDark ? 'bg-indigo-500' : 'bg-gray-900'}`} />
                                </div>
                                <span className={`text-2xl font-bold tracking-tighter select-none transition-colors ${isDark ? 'text-zinc-100 group-hover:text-white' : 'text-gray-900 group-hover:text-gray-700'}`}>Nakula.</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {isMobile && (
                        <button onClick={() => setIsOpen(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'}`}>
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Theme Toggle Button */}
                <div className={`mx-4 mb-4 ${!isMobile && !isOpen ? 'flex justify-center' : ''}`}>
                    <motion.button
                        onClick={toggleTheme}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${isDark ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'}`}
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        <AnimatePresence>
                            {(isOpen || isMobile) && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="font-medium text-sm whitespace-nowrap"
                                >
                                    {isDark ? 'Light Mode' : 'Dark Mode'}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>

                <motion.nav
                    className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar overflow-x-hidden transition-all ease-in-out duration-300"
                    initial="closed"
                    animate="open"
                    variants={{
                        open: { transition: { staggerChildren: 0.1 } },
                        closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
                    }}
                >
                    {navItems.map((item) => (
                        <div key={item.path} className="relative">
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-4 rounded-2xl transition-all duration-300 relative z-20 ${isActive
                                        ? (isDark ? 'text-zinc-200' : 'text-gray-800')
                                        : (isDark ? 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100')
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <motion.div
                                        className="w-full h-full flex items-center"
                                        whileHover={{ scale: 1.05, x: 5 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <span className={`relative z-20 flex items-center justify-center ${!isMobile && !isOpen ? 'w-full' : ''}`}>
                                            {React.cloneElement(item.icon, {
                                                size: 24,
                                                strokeWidth: 2
                                            })}
                                        </span>

                                        <AnimatePresence>
                                            {(isOpen || isMobile) && (
                                                <motion.span
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="font-medium text-lg tracking-tight ml-4 whitespace-nowrap z-20"
                                                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif' }}
                                                >
                                                    {item.label}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>

                                        {/* Magic Motion Active Background */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeNavBackground"
                                                className={`absolute inset-0 rounded-2xl z-10 ${isDark ? 'bg-zinc-800' : 'bg-gray-200'}`}
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                    </motion.div>
                                )}
                            </NavLink>
                        </div>
                    ))}
                </motion.nav>

                {/* Profile Section */}
                <div className="p-6">
                    <div
                        className={`
                            rounded-full transition-all duration-200 cursor-pointer
                            ${(isOpen || isMobile) ? (isDark ? 'bg-zinc-900 hover:bg-zinc-800' : 'bg-gray-100 hover:bg-gray-200') + ' p-2 pr-4' : 'bg-transparent p-0 flex justify-center'}
                        `}
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full overflow-hidden border shrink-0 ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className={`w-full h-full flex items-center justify-center font-bold select-none ${isDark ? 'bg-zinc-800 text-zinc-100' : 'bg-gray-200 text-gray-700'}`}>
                                        {displayName.charAt(0)}
                                    </div>
                                )}
                            </div>

                            <AnimatePresence>
                                {(isOpen || isMobile) && (
                                    <>
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="flex-1 overflow-hidden"
                                        >
                                            <h4 className={`font-bold text-sm truncate select-none ${isDark ? 'text-zinc-100' : 'text-gray-900'}`}>{displayName}</h4>
                                            <p className={`text-xs truncate select-none ${isDark ? 'text-zinc-500' : 'text-gray-600'}`}>Free Plan</p>
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0 }}
                                        >
                                            <MoreVertical size={16} className={isDark ? 'text-zinc-500' : 'text-gray-400'} />
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Profile Dropdown */}
                    <AnimatePresence>
                        {showProfileMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowProfileMenu(false)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="fixed bottom-24 left-6 w-64 z-[100]"
                                >
                                    <div className="bg-[#111] border border-zinc-800 rounded-2xl shadow-2xl p-2 overflow-hidden">
                                        <div className="px-3 py-3 border-b border-zinc-800 mb-1">
                                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider select-none">Signed in as</p>
                                            <p className="text-sm font-bold text-white truncate mt-1 select-none">{email}</p>
                                        </div>
                                        <NavLink
                                            to="/profile"
                                            className="w-full flex items-center gap-3 px-3 py-3 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition-colors text-left font-medium"
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            <Settings size={18} />
                                            <span>Account Settings</span>
                                        </NavLink>
                                        <div className="h-px bg-zinc-800 my-1" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors text-left font-medium"
                                        >
                                            <LogOut size={18} />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* Desktop Toggle Button */}
                {!isMobile && (
                    <button
                        onClick={toggleSidebar}
                        className={`absolute top-12 w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition-all z-[100] cursor-pointer ${isDark ? 'bg-zinc-800 shadow-[0_0_20px_rgba(0,0,0,0.5)]' : 'bg-gray-900 shadow-[0_0_20px_rgba(0,0,0,0.2)]'}`}
                        style={{
                            right: '-24px',
                            border: isDark ? '4px solid #000000' : '4px solid #ffffff'
                        }}
                        aria-label="Toggle Sidebar"
                    >
                        {isOpen
                            ? <ChevronLeft size={24} strokeWidth={3} color={isDark ? '#9ca3af' : '#ffffff'} />
                            : <ChevronRight size={24} strokeWidth={3} color={isDark ? '#9ca3af' : '#ffffff'} />
                        }
                    </button>
                )}
            </motion.aside>

            {/* Main Content */}
            <main className={`flex-1 h-screen overflow-hidden transition-colors duration-300 ${isMobile ? 'p-0' : 'p-3'} ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
                {/* Mobile Header for hamburger */}
                {isMobile && (
                    <div className="flex items-center justify-between mb-4 px-4 pt-4">
                        <button
                            onClick={() => setIsOpen(true)}
                            className={`p-2 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-gray-200 text-black'}`}
                        >
                            <Menu size={24} />
                        </button>
                        <span className={`font-bold text-xl ${isDark ? 'text-white' : 'text-black'}`}>Nakula.</span>
                        <div className="w-10" /> {/* Spacer for centering */}
                    </div>
                )}

                <div className={`w-full h-full ${isMobile ? 'border-t border-b-0 rounded-t-[30px]' : 'rounded-[40px] border'} overflow-hidden relative shadow-2xl transition-colors duration-300 ${isDark ? 'bg-[#09090b] border-zinc-800' : 'bg-white border-gray-200'}`}>
                    {/* Inner content scrollable */}
                    <div className={`absolute inset-0 overflow-y-auto custom-scrollbar ${isMobile ? 'pt-4 px-4 pb-8' : 'pt-20 px-8 pb-8'}`}>
                        {/* Ambient background only inside the card */}
                        {isDark && (
                            <>
                                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />
                            </>
                        )}

                        <div className="relative z-10">
                            {children}
                        </div>
                    </div>
                </div>
            </main>
        </div >
    );
};

export default Layout;
