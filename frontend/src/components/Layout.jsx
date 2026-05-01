import React, { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, LogOut, CheckSquare, UserCircle } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Profile', path: '/profile', icon: UserCircle },
  ];

  return (
    <div className="app-container">
      {/* Sidebar - Dark Blue Glassmorphism */}
      <div style={{ 
        width: '260px', 
        backgroundColor: 'var(--bg-panel)', 
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)', 
        display: 'flex', 
        flexDirection: 'column',
        color: 'var(--text-main)',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', borderRadius: 'var(--radius-md)', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
            <CheckSquare color="white" size={24} />
          </div>
          <span className="text-2xl font-bold" style={{ color: 'var(--text-main)', letterSpacing: '-0.02em' }}>TeamTask</span>
        </div>
        
        <nav style={{ flex: 1, padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.name} 
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem',
                  borderRadius: 'var(--radius-md)', color: isActive ? 'white' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--primary-color)' : 'transparent',
                  fontWeight: isActive ? '700' : '500',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isActive ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
                }}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
          <div className="mb-4 flex items-center gap-3">
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: user?.profile_photo ? `url(${import.meta.env.DEV ? 'http://localhost:8000' : ''}${user.profile_photo}) center/cover` : 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
              {!user?.profile_photo && user?.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>{user?.username}</div>
              <span className={`badge mt-1 ${user?.role === 'admin' ? 'badge-admin' : 'badge-member'}`} style={{ padding: '0.15rem 0.5rem', fontSize: '0.65rem' }}>
                {user?.role}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <header style={{ 
          height: '72px', 
          backgroundColor: 'rgba(15, 23, 42, 0.4)', 
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0 2.5rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
        }}>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
             {location.pathname.includes('/dashboard') ? 'Dashboard' : location.pathname.includes('/projects') ? 'Projects' : location.pathname.includes('/profile') ? 'Profile' : 'TeamTask'}
          </h2>
        </header>
        <main className="page-container animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
