import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, BarChart3, Users, Factory, Zap } from 'lucide-react';

export default function MainLayout() {
  return (
    <div className="app-container">
      {/* HUD Top Navigation */}
      <div className="topbar-hud">
        <div className="hud-brand">
          <Zap size={24} color="var(--primary)" />
          <span>SMART<span style={{ color: 'var(--primary)' }}>CBG</span> GRID</span>
        </div>
        
        <div className="nav-links-hud">
          <NavLink to="/dashboard" className={({isActive}) => isActive ? "nav-item-hud active" : "nav-item-hud"}>
            <LayoutDashboard size={14} />
            Dashboard
          </NavLink>
          <NavLink to="/optimize" className={({isActive}) => isActive ? "nav-item-hud active" : "nav-item-hud"}>
            <Map size={14} />
            Optimization
          </NavLink>
          <NavLink to="/smart-planner" className={({isActive}) => isActive ? "nav-item-hud active" : "nav-item-hud"}>
            <Map size={14} />
            TSP Planner
          </NavLink>
          <NavLink to="/analytics" className={({isActive}) => isActive ? "nav-item-hud active" : "nav-item-hud"}>
            <BarChart3 size={14} />
            Analytics
          </NavLink>

          <NavLink to="/suppliers" className={({isActive}) => isActive ? "nav-item-hud active" : "nav-item-hud"}>
            <Users size={14} />
            Suppliers
          </NavLink>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', pointerEvents: 'auto' }}>
           <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontFamily: 'Orbitron', fontWeight: 700, color: 'var(--text-main)' }}>SYS_ADMIN</div>
              <div style={{ fontSize: '11px', color: 'var(--primary)', letterSpacing: '1px' }}>ONLINE</div>
           </div>
           <div style={{ width: 36, height: 36, backgroundColor: 'rgba(0,255,136,0.1)', border: '1px solid var(--primary)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary)'}}>
             A
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
