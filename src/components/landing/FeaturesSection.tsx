import { motion } from "framer-motion";
import featureCost from "@/assets/feature-cost.jpg";
import featurePerformance from "@/assets/feature-performance.jpg";
import featureAi from "@/assets/feature-ai.jpg";
import featureMulticloud from "@/assets/feature-multicloud.jpg";

const features = [
  {
    title: "Cost Comparison",
    description: "Compare pricing across AWS, Azure, GCP, and Oracle Cloud in real time.",
    image: featureCost,
  },
  {
    title: "Performance Insights",
    description: "Benchmark compute, storage, and network performance across providers.",
    image: featurePerformance,
  },
  {
    title: "AI Recommendations",
    description: "Get intelligent suggestions for the optimal cloud configuration.",
    image: featureAi,
  },
  {
    title: "Multi-Cloud Support",
    description: "Unified view of all major cloud providers in a single dashboard.",
    image: featureMulticloud,
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-32">
      <div className="container">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-mono-tabular text-primary uppercase tracking-widest mb-4">Features</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Discover your AI-powered universe
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="surface-card card-glow p-6 group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="rounded-lg overflow-hidden mb-5 aspect-video">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 saturate-[0.7] group-hover:saturate-100"
                />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
