import { NavLink, Outlet } from 'react-router-dom';
import { 
  FiHome,
  FiUser,
  FiPackage,
  FiArchive,
  FiBarChart2,
  FiShoppingCart,
  FiLogOut,
  FiList
} from 'react-icons/fi';
import ReactLogo from '../components/ReactLogo';
const NavItem = ({ to, end, icon: Icon, label, badge }) => (
  <NavLink
    to={to}
    end={end}
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
  if (!controller || !controller.activeUser) return null;
  const isAdmin = controller.activeUser.role === 'admin';
  const hasLowStock = controller.inventory.some(i => i.stock < i.minStock);
  const initials = controller.activeUser.username.slice(0, 2).toUpperCase();
  return (
    <div className="flex-grow flex flex-col md:flex-row min-h-screen md:h-screen md:overflow-hidden font-sans bg-slate-50">
      <aside className="w-full md:w-56 shrink-0 flex flex-col h-auto md:h-full overflow-y-auto border-r border-white/5 bg-slate-900">
        <div className="px-5 py-6 flex flex-col items-center border-b border-white/5">
          <div className="h-16 flex items-center justify-center mb-3">
            <img src="/logo.png" alt="Logo" className="h-full w-auto object-contain" />
          </div>
          <span className="text-xs text-green-600 font-bold uppercase tracking-widest text-center">
            Pekanbaru · Riau
          </span>
        </div>
        <div className="px-4 py-3.5 mx-3 mt-3 rounded-xl border border-white/5 bg-white/5 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-green-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate leading-none mb-0.5">{controller.activeUser.username}</p>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{controller.activeUser.role}</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-3 space-y-0.5 mt-1">
          {isAdmin ? (
            <>
              <NavItem to="/" end icon={FiHome} label="Dashboard" />
              <NavItem to="/users" icon={FiUser} label="Kelola Pengguna" />
              <NavItem to="/produk" icon={FiPackage} label="Produk" />
              <NavItem to="/resep" icon={FiList} label="Resep" />
              <NavItem to="/inventaris" icon={FiArchive} label="Inventaris" badge={hasLowStock} />
              <NavItem to="/laporan" icon={FiBarChart2} label="Laporan" />
            </>
          ) : (
            <>
              <NavItem to="/pos" icon={FiShoppingCart} label="Kasir (POS)" />
              <NavItem to="/produk" icon={FiPackage} label="Produk" />
            </>
          )}
        </nav>
        <div className="border-t border-white/5 mt-auto">
          <button
            onClick={controller.handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 text-xs font-semibold text-slate-400 hover:bg-rose-950/30 hover:text-rose-400 transition-colors"
          >
            <FiLogOut className="text-sm" />
            <span>Keluar Sistem</span>
          </button>
          <div className="py-2.5 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <ReactLogo className="w-3 h-3 animate-spin" color="#15803d" />
            <span>Es Salju App &middot; React</span>
          </div>
        </div>
      </aside>
      <main className="flex-grow flex flex-col min-w-0 p-5 md:p-7 overflow-y-auto h-auto md:h-full">
        <Outlet />
      </main>
    </div>
  );
}
