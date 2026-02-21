"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

export default function MotionReveal({ children, className }: { children: ReactNode; className?: string }) {
  const variant = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={variant} className={className}>
      {children}
    </motion.div>
  );
}
