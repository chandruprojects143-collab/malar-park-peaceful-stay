const Footer = () => (
  <footer className="bg-foreground py-8">
    <div className="container mx-auto px-4 text-center">
      <p className="font-heading text-xl font-bold text-primary-foreground mb-2">Malar Park</p>
      <p className="text-primary-foreground/60 text-sm mb-4">
        Budget Friendly Premium Hotel | Tiruvannamalai, Tamil Nadu
      </p>
      <p className="text-primary-foreground/40 text-xs">
        © {new Date().getFullYear()} Malar Park. All rights reserved. |{" "}
        <a href="https://www.malarpark.com" className="hover:text-secondary transition-colors">www.malarpark.com</a>
      </p>
    </div>
  </footer>
);

export default Footer;
