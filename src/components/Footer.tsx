import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Footer = () => (
  <footer className="bg-foreground py-8">
    <div className="container mx-auto px-4 text-center">
      <p className="font-heading text-xl font-bold text-primary-foreground mb-2">Malar Park</p>
      <p className="text-primary-foreground/60 text-sm mb-4">
        Budget Friendly Premium Hotel | Tiruvannamalai, Tamil Nadu
      </p>
      <div className="mb-4">
        <Link
          to="/admin/login"
          className="inline-flex items-center gap-1 text-primary-foreground/40 text-xs hover:text-secondary transition-colors"
        >
          <Shield className="w-3 h-3" /> Staff Login
        </Link>
      </div>
      <p className="text-primary-foreground/40 text-xs">
        © {new Date().getFullYear()} Malar Park. All rights reserved. |{" "}
        <a href="https://www.malarpark.com" className="hover:text-secondary transition-colors">www.malarpark.com</a>
      </p>
    </div>
  </footer>
);

export default Footer;
