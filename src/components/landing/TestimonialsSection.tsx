import { motion } from "framer-motion";
import { User } from "lucide-react";

const testimonials = [
  {
    quote: "CloudCompare AI cut our cloud spend by 34% in the first quarter. The AI recommendations are remarkably accurate.",
    name: "Sarah Chen",
    role: "CTO, Quantum Solutions",
  },
  {
    quote: "The multi-cloud comparison view saved us weeks of manual research. Indispensable tool for any infrastructure team.",
    name: "Marcus Rivera",
    role: "VP Engineering, Nebula Dynamics",
  },
  {
    quote: "We migrated 12 workloads based on CloudCompare's suggestions. Every single recommendation was spot on.",
    name: "Aiko Tanaka",
    role: "Cloud Architect, Orbit Technologies",
  },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-32">
      <div className="container">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-mono-tabular text-primary uppercase tracking-widest mb-4">Testimonials</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Real results from real users
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="surface-card p-8 flex flex-col justify-between"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <p className="text-sm text-muted-foreground leading-relaxed mb-8">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
