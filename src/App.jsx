import GolfBallScroll from "./components/ui/GolfBallScroll";
import WelcomePopup from "./components/ui/WelcomePopup";
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { pagesConfig } from './pages.config'
import SearchRequest from './pages/SearchRequest';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Guides from './pages/Guides';
import AdminDashboard from './pages/admin/AdminDashboard';
import Setup from './pages/Setup';
import Contact from './pages/Contact';
import CGS from './pages/CGS';
import CGSPro from './pages/CGSPro';
import SellerOnboarding from './pages/SellerOnboarding';
import Abonnements from './pages/Abonnements';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/Guides" element={
        <LayoutWrapper currentPageName="Guides">
          <Guides />
        </LayoutWrapper>
      } />
      <Route path="/Setup" element={
        <LayoutWrapper currentPageName="Setup">
          <Setup />
        </LayoutWrapper>
      } />
      <Route path="/Contact" element={
        <LayoutWrapper currentPageName="Contact">
          <Contact />
        </LayoutWrapper>
      } />
      <Route path="/CGS" element={
        <LayoutWrapper currentPageName="CGS">
          <CGS />
        </LayoutWrapper>
      } />
      <Route path="/CGSPro" element={
        <LayoutWrapper currentPageName="CGSPro">
          <CGSPro />
        </LayoutWrapper>
      } />
      <Route path="/Admin" element={window.location.hostname === "admin.swingmarketgolf.com" || window.location.hostname === "localhost" ? <AdminDashboard /> : <PageNotFound />} />
      <Route path="/SellerOnboarding" element={<SellerOnboarding />} />
      <Route path="/Abonnements" element={<Abonnements />} />
      <Route path="/SearchRequest" element={<SearchRequest />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  // Sync dark mode with system preferences
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    // Set initial theme
    handleChange(mediaQuery);
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          {window.location.hostname === "admin.swingmarketgolf.com" && window.location.pathname === "/" && (window.location.replace("/Admin"))}
          <GolfBallScroll />
          <WelcomePopup />
          <Routes>
            <Route path="/Admin" element={window.location.hostname === "admin.swingmarketgolf.com" || window.location.hostname === "localhost" ? <AdminDashboard /> : <PageNotFound />} />
      <Route path="/SellerOnboarding" element={<SellerOnboarding />} />
      <Route path="/Abonnements" element={<Abonnements />} />
            <Route path="/*" element={<AuthenticatedApp />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App