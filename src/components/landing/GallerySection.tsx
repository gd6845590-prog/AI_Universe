import { motion } from "framer-motion";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import gallery5 from "@/assets/gallery-5.jpg";
import gallery6 from "@/assets/gallery-6.jpg";

const images = [
  { src: gallery1, alt: "Digital Cosmos", span: "md:col-span-2 md:row-span-1" },
  { src: gallery2, alt: "Holographic Sphere", span: "md:col-span-1 md:row-span-2" },
  { src: gallery3, alt: "Server Corridor", span: "md:col-span-1 md:row-span-1" },
  { src: gallery4, alt: "Data Streams", span: "md:col-span-1 md:row-span-1" },
  { src: gallery5, alt: "Circuit Board", span: "md:col-span-1 md:row-span-2" },
  { src: gallery6, alt: "AI Interface", span: "md:col-span-2 md:row-span-1" },
];

const GallerySection = () => {
  return (
    <section id="gallery" className="py-32">
      <div className="container">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-mono-tabular text-primary uppercase tracking-widest mb-4">Gallery</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Step into the AI gallery
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[240px]">
          {images.map((img, i) => (
            <motion.div
              key={img.alt}
              className={`${img.span} rounded-xl overflow-hidden border border-border group cursor-pointer`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
