import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  FiHome, FiUser, FiPackage, FiArchive, FiBarChart2, FiShoppingCart, FiLogOut, FiList, FiMenu, FiX
} from 'react-icons/fi';
import ReactLogo from '../components/ReactLogo';

const NavItem = ({ to, end, icon: Icon, label, badge, onClick }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onClick}
    className={({ isActive }) =>
      `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all relative ${
        isActive
          ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
      }`
    }
  >
    <Icon className="text-sm shrink-0" />
    <span className="flex-1">{label}</span>
    {badge && (
      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
    )}
  </NavLink>
);

export default function MainLayout({ controller }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();


  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  if (!controller || !controller.activeUser) return null;
  const isAdmin = controller.activeUser.role === 'pemilik';
  const hasLowStock = controller.inventory.some(i => i.stock < i.minStock);
  const initials = controller.activeUser.username.slice(0, 2).toUpperCase();

  return (
    <div className="bg-slate-900 min-h-screen">
      <div className={`flex-grow flex flex-col ${isAdmin ? 'md:flex-row' : ''} min-h-screen md:h-screen md:overflow-hidden font-sans bg-slate-50 w-full shadow-2xl relative`}>
        
        <div className="md:hidden sticky top-0 flex items-center justify-between px-5 py-4 bg-slate-900 text-white shadow-md z-50 shrink-0">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" />
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-white/10 rounded-lg text-white">
            {isSidebarOpen ? <FiX className="text-lg" /> : <FiMenu className="text-lg" />}
          </button>
        </div>


        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}


        {isAdmin && (
          <aside className={`
            fixed md:relative top-0 right-0 md:right-auto md:left-0 h-full w-64 md:w-56 shrink-0 flex flex-col overflow-y-auto border-l md:border-l-0 md:border-r border-white/5 bg-slate-900 z-[60] transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          `}>
            <div className="px-5 py-6 flex flex-col items-center border-b border-white/5 hidden md:flex">
              <div className="h-16 flex items-center justify-center">
                <img src="/logo.png" alt="Logo" className="h-full w-auto object-contain" />
              </div>
            </div>

            <div className="px-4 py-3.5 mx-3 mt-3 md:mt-3 rounded-xl border border-white/5 bg-white/5 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-green-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate leading-none mb-0.5">{controller.activeUser.username}</p>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{controller.activeUser.role}</span>
              </div>
            </div>

            <nav className="flex-1 px-3 py-3 space-y-0.5 mt-1">
              <NavItem to="/" end icon={FiHome} label="Dashboard" />
              <NavItem to="/users" icon={FiUser} label="Kelola Pengguna" />
              <NavItem to="/produk" icon={FiPackage} label="Produk" />
              <NavItem to="/resep" icon={FiList} label="Resep" />
              <NavItem to="/inventaris" icon={FiArchive} label="Inventaris" badge={hasLowStock} />
              <NavItem to="/laporan" icon={FiBarChart2} label="Laporan" />
            </nav>

            <div className="border-t border-white/5 mt-auto">
              <button onClick={controller.handleLogout} className="w-full flex items-center justify-center gap-2 py-3.5 text-xs font-semibold text-slate-400 hover:bg-rose-950/30 hover:text-rose-400 transition-colors">
                <FiLogOut className="text-sm" />
                <span>Keluar Sistem</span>
              </button>
              <div className="py-2.5 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <ReactLogo className="w-3 h-3 animate-spin" color="#15803d" />
                <span>Es Salju App &middot; React</span>
              </div>
            </div>
          </aside>
        )}


        {!isAdmin && isSidebarOpen && (
          <aside className={`
            fixed top-0 right-0 h-full w-64 shrink-0 flex flex-col overflow-y-auto border-l border-white/5 bg-slate-900 z-[60] transition-transform duration-300 ease-in-out md:hidden
            translate-x-0
          `}>
             <div className="px-4 py-5 mx-3 mt-3 rounded-xl border border-white/5 bg-white/5 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-green-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate leading-none mb-0.5">{controller.activeUser.username}</p>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{controller.activeUser.role}</span>
              </div>
            </div>

            <nav className="flex-1 px-3 py-3 space-y-0.5 mt-1">
              <NavItem to="/pos" icon={FiShoppingCart} label="Kasir (POS)" />
            </nav>

            <div className="border-t border-white/5 mt-auto">
              <button onClick={controller.handleLogout} className="w-full flex items-center justify-center gap-2 py-3.5 text-xs font-semibold text-slate-400 hover:bg-rose-950/30 hover:text-rose-400 transition-colors">
                <FiLogOut className="text-sm" />
                <span>Keluar Sistem</span>
              </button>
            </div>
          </aside>
        )}


        {!isAdmin && (
          <header className="hidden md:flex items-center justify-between px-6 py-4 bg-slate-900 text-white shadow-md z-50 shrink-0">
            <div className="flex items-center gap-8">
              <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" />
              <nav className="flex items-center gap-2">
                <NavItem to="/pos" icon={FiShoppingCart} label="Kasir (POS)" />
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-3">
                 <div className="text-right">
                   <p className="text-xs font-bold text-white leading-none mb-0.5">{controller.activeUser.username}</p>
                   <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{controller.activeUser.role}</p>
                 </div>
                 <div className="w-8 h-8 rounded-lg bg-green-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                   {initials}
                 </div>
               </div>
               <div className="w-px h-6 bg-white/10 mx-1"></div>
               <button onClick={controller.handleLogout} className="p-2 text-slate-400 hover:bg-rose-950/30 hover:text-rose-400 transition-colors rounded-lg" title="Keluar Sistem">
                 <FiLogOut className="text-lg" />
               </button>
            </div>
          </header>
        )}


        <main className="flex-grow flex flex-col min-w-0 p-4 sm:p-5 md:p-7 overflow-y-auto h-auto md:h-full bg-slate-50 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
