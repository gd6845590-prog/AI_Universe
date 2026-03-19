import { motion } from "framer-motion";
import heroCard1 from "@/assets/hero-card-1.jpg";
import heroCard2 from "@/assets/hero-card-2.jpg";
import heroCard3 from "@/assets/hero-card-3.jpg";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      <div className="container grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-24">
        {/* Left Content */}
        <motion.div
          className="lg:col-span-7 space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tighter text-foreground">
            Explore your
            <br />
            intelligent AI
            <br />
            universe
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
            Compare cloud costs across AWS, Azure, Google Cloud, and Oracle Cloud.
            Get AI-powered recommendations to optimize your infrastructure spending.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="bg-foreground text-background px-6 py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Start Comparing
            </Link>
            <a
              href="#features"
              className="border border-border px-6 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
            >
              Learn More
            </a>
          </div>
        </motion.div>

        {/* Right - Floating Cards */}
        <div className="lg:col-span-5 relative h-[400px] md:h-[500px]">
          <motion.div
            className="absolute top-8 left-0 w-56 md:w-64 rounded-xl overflow-hidden border border-border shadow-2xl"
            initial={{ opacity: 0, y: 40, rotate: -6 }}
            animate={{ opacity: 1, y: 0, rotate: -6 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ transform: "rotate(-6deg) translateX(-10%)" }}
          >
            <img src={heroCard1} alt="AI Neural Network" className="w-full h-auto" />
          </motion.div>

          <motion.div
            className="absolute top-4 left-1/2 -translate-x-1/2 w-60 md:w-72 rounded-xl overflow-hidden border border-border shadow-2xl z-10"
            initial={{ opacity: 0, y: 40, rotate: 2 }}
            animate={{ opacity: 1, y: 0, rotate: 2 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <img src={heroCard2} alt="Cloud Data Center" className="w-full h-auto" />
          </motion.div>

          <motion.div
            className="absolute top-16 right-0 w-52 md:w-60 rounded-xl overflow-hidden border border-border shadow-2xl"
            initial={{ opacity: 0, y: 40, rotate: 8 }}
            animate={{ opacity: 1, y: 0, rotate: 8 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ transform: "rotate(8deg) translateX(15%)" }}
          >
            <img src={heroCard3} alt="AI Brain" className="w-full h-auto" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
