import { Outlet, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAccount } from '../context/AccountContext';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Send, 
  CreditCard,
  LogOut,
  Server,
  Building
} from 'lucide-react';
import { cn } from '../utils/cn';

export default function DashboardLayout() {
  const { currentAccount, isLoading, logoutAccount } = useAccount();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutAccount();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ArrowRightLeft },
    { name: 'Transfer', path: '/transfer', icon: Send },
    { name: 'Payments', path: '/payments', icon: CreditCard },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin shadow-sm"></div>
      </div>
    );
  }

  if (!currentAccount) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-[100dvh] bg-gray-50 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-dark-900 text-white hidden md:flex flex-col shadow-xl z-20">
        <div className="h-16 flex items-center px-6 border-b border-gray-800 shrink-0">
          <Building className="w-6 h-6 text-primary-500 mr-2" />
          <span className="text-xl font-semibold tracking-tight text-white">DigitalBank</span>
        </div>
        
        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                  isActive 
                    ? "bg-gray-800 text-white shadow-sm ring-1 ring-gray-700 relative overflow-hidden" 
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-r-full"></span>
                )}
                <Icon className={cn("w-5 h-5 mr-3 transition-colors duration-200", isActive ? "text-primary-500" : "")} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-800 bg-gray-900/50 shrink-0">
          <div className="px-4 py-3 mb-3 rounded-xl bg-gray-800/80 text-sm shadow-inner border border-gray-700/50">
            <div className="text-gray-400 text-[10px] uppercase tracking-wider mb-1 font-semibold">Logged in as</div>
            <div className="font-medium truncate text-gray-100">{currentAccount.accountHolderName}</div>
            <div className="text-xs text-primary-400 mt-1 font-mono">AC: ••••{currentAccount.accountNumber?.slice(-4)}</div>
          </div>
          
          <Link to="/system" className="flex items-center px-4 py-2 mb-1 text-sm font-medium text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white transition-colors">
            <Server className="w-4 h-4 mr-3" />
            System Status
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-400 rounded-lg hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile & Desktop Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-20 shadow-sm shrink-0">
          <div className="flex items-center">
            <Building className="w-6 h-6 text-primary-500 mr-2" />
            <span className="text-lg font-bold text-gray-900">DigitalBank</span>
          </div>
          <button onClick={handleLogout} className="text-gray-500 p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 pb-20 md:pb-0">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 md:px-8">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex justify-around items-center h-16 px-2 pb-safe">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
                    isActive ? "text-primary-600" : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-primary-600" : "")} />
                  <span className={cn("text-[10px] font-medium", isActive ? "text-primary-600" : "")}>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
