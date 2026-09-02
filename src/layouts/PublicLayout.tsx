import { Outlet } from 'react-router-dom';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';

const PublicLayout = () => (
  <div className="flex min-h-screen flex-col">
    <a className="skip-link" href="#main-content">
      Skip to main content
    </a>
    <Header />
    <main className="flex-1" id="main-content">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default PublicLayout;
