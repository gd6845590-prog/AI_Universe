import { Cloud } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border py-16">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Cloud className="h-4 w-4 text-primary" strokeWidth={1.5} />
          <span className="text-sm font-semibold text-foreground">CloudCompare AI</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <a href="#features" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#gallery" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Gallery</a>
          <a href="#faq" className="text-xs text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 CloudCompare AI. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
