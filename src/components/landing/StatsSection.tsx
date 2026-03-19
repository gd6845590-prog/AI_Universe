import { motion } from "framer-motion";

const stats = [
  { value: "99.99%", label: "Optimization Accuracy" },
  { value: "120ms", label: "Recommendation Latency" },
  { value: "$2.4M", label: "Avg. Annual Cloud Savings" },
  { value: "52K+", label: "Active Users" },
];

const StatsSection = () => {
  return (
    <section className="py-32 border-y border-border">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="text-4xl md:text-5xl font-bold font-mono-tabular text-foreground mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
