import React from 'react';
import { motion } from 'framer-motion';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  colorClass: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtitle, icon: Icon, colorClass }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl p-5 border border-brand-border flex items-start gap-4 card-shadow hover:shadow-md transition-all hover:-translate-y-0.5"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClass} shadow-sm`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-bold text-brand-muted uppercase tracking-wide mb-1">{title}</span>
        <span className="text-3xl font-extrabold text-brand-text leading-none mb-1">{value}</span>
        {subtitle && <span className="text-xs font-medium text-brand-muted">{subtitle}</span>}
      </div>
    </motion.div>
  );
};