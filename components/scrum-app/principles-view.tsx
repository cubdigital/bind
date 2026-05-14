"use client";

import { motion } from "framer-motion";
import { BookOpen, Zap } from "lucide-react";

type Principle = { title: string; description: string };

type Props = {
  principles: Principle[];
  advancedMethods: string[];
};

export function PrinciplesView({
  principles,
  advancedMethods,
}: Props) {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/80 px-4 pt-12 pb-6 backdrop-blur-lg">
        <h1 className="font-bold text-3xl text-foreground">Principles</h1>
        <p className="mt-1 text-muted-foreground">Coaching methodology</p>
      </div>

      <div className="space-y-8 px-4">
        <div className="space-y-4">
          <div className="mb-2 flex items-center gap-2">
            <BookOpen className="size-5 text-primary" />
            <h2 className="font-bold text-lg">Core framework</h2>
          </div>

          {principles.map((principle, i) => (
            <motion.div
              key={principle.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-r-xl border-border border-y border-r border-l-4 border-l-primary bg-card p-4 shadow-sm"
            >
              <h3 className="mb-1 font-bold text-foreground">{principle.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {principle.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="space-y-4 border-border border-t pt-6">
          <div className="mb-2 flex items-center gap-2">
            <Zap className="size-5 text-accent" />
            <h2 className="font-bold text-lg">Advanced methods</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {advancedMethods.map((method, i) => (
              <motion.span
                key={method}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="rounded-full border border-border bg-secondary px-3 py-1.5 font-medium text-foreground text-sm"
              >
                {method}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
