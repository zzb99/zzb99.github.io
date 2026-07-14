import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BrowserRouter,
  HashRouter,
  Link,
  Route,
  Routes,
  useLocation,
  useSearchParams,
} from 'react-router-dom';
import '@fontsource-variable/geist';
import ProofDrawer from './components/ProofDrawer';
import { navItems, proofArchive, projects } from './data/content';
import { useActiveSection, useReveal } from './hooks/usePageEffects';
import ProjectPage from './routes/ProjectPage';
import StitchPortfolio from './sections/StitchPortfolio';
import { AppleGlassButton } from './components/AppleComponents';
import AdminDashboard from './routes/AdminDashboard';
import { ExhibitionProvider } from './data/exhibitionStore';
import './style.css';

document.documentElement.classList.add('js');

function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (pathname !== '/') {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    if (!hash) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash, pathname]);

  return null;
}

function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isAdmin = location.pathname.startsWith('/admin');
  const { active, scrolled } = useActiveSection(navItems, { enabled: isHome });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [location.pathname, location.hash]);

  if (isAdmin) return null;

  const navHref = (id) => (isHome ? `#${id}` : `/#${id}`);

  return (
    <header className={`header site-header ${scrolled ? 'is-compact' : ''} ${menuOpen ? 'is-menu-open' : ''}`}>
      <nav className="site-nav" aria-label="主导航">
        <div className="site-nav__left">
          <Link className="site-brand" to="/#about">张智博</Link>
          <div className="site-nav__links" id="primary-navigation">
            {navItems.map(([id, label]) => (
              <Link key={id} to={navHref(id)} className={isHome && active === id ? 'active' : ''}>{label}</Link>
            ))}
          </div>
        </div>
        <div className="site-nav__actions">
          {!isHome && <Link className="site-back" to="/#projects">返回项目</Link>}
          <AppleGlassButton className="apple-glass-button--nav site-contact" to={navHref('contact')} variant="prominent">联系</AppleGlassButton>
          <button
            className="site-menu-toggle"
            type="button"
            aria-label={menuOpen ? '关闭导航菜单' : '打开导航菜单'}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen((value) => !value)}
          >
            <i /><i />
          </button>
        </div>
      </nav>
    </header>
  );
}

function HomePage() {
  useReveal();
  const [searchParams, setSearchParams] = useSearchParams();
  const proofId = searchParams.get('proof');
  const proofItem = proofArchive.find((item) => item.id === proofId);
  const proofProject = proofItem ? projects[proofItem.projectId] : null;

  const openProof = (id) => {
    const next = new URLSearchParams(searchParams);
    next.set('proof', id);
    setSearchParams(next);
  };

  const closeProof = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('proof');
    setSearchParams(next, { replace: true });
  };

  return (
    <>
      <StitchPortfolio onSelectProof={openProof} />
      {proofProject && <ProofDrawer project={proofProject} onClose={closeProof} />}
    </>
  );
}

function App() {
  return (
    <>
      <ScrollManager />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/projects/:slug" element={<ProjectPage />} />
        <Route path="*" element={<ProjectPage />} />
      </Routes>
    </>
  );
}

const Router = import.meta.env.VITE_GITHUB_PAGES === 'true' ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')).render(
  <Router>
    <ExhibitionProvider>
      <App />
    </ExhibitionProvider>
  </Router>,
);
