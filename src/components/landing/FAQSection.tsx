import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Which cloud providers does CloudCompare AI support?",
    a: "We currently support AWS, Google Cloud Platform, Microsoft Azure, and Oracle Cloud. Additional providers are on our roadmap.",
  },
  {
    q: "How does the AI recommendation engine work?",
    a: "Our engine analyzes your workload requirements including compute, storage, and network needs, then cross-references real-time pricing data to find the optimal configuration.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. We do not store any cloud credentials. All comparisons use publicly available pricing APIs and your input parameters are processed in memory only.",
  },
  {
    q: "Can I save and share comparisons?",
    a: "Absolutely. Create an account to save comparisons, export them as PDFs, or share them with your team via a unique link.",
  },
  {
    q: "What does the free tier include?",
    a: "The free tier includes up to 50 comparisons per month, basic AI recommendations, and support for all four cloud providers.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-32">
      <div className="container max-w-3xl">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-mono-tabular text-primary uppercase tracking-widest mb-4">FAQ</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Your AI FAQ, simplified
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="surface-card px-6 border border-border rounded-xl"
              >
                <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-5 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
