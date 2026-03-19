import { motion } from "framer-motion";
import { Cloud } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <Cloud className="h-5 w-5 text-primary" strokeWidth={1.5} />
            <span className="text-lg font-bold text-foreground">CloudCompare AI</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Enter the AI Universe
          </h1>
          <p className="text-sm text-muted-foreground">
            {isSignUp ? "Create your account to get started" : "Sign in to your account"}
          </p>
        </div>

        <div className="surface-card p-8">
          <div className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
              </div>
            )}
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
              <input
                type="email"
                placeholder="you@company.com"
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
            </div>
            <Link
              to="/dashboard"
              className="w-full bg-foreground text-background py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity block text-center mt-2"
            >
              {isSignUp ? "Create Account" : "Sign In"}
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-foreground hover:underline"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
