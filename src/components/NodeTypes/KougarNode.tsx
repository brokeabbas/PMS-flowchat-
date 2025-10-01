import { Handle, Position } from 'reactflow';
import clsx from 'clsx';
import { motion } from 'framer-motion';

type KougarNodeProps = {
  data: {
    label: string;
    category: 'stage' | 'document' | 'action';
  };
};

const categoryStyleMap = {
  stage: 'bg-gradient-to-br from-indigo-100 to-white border-indigo-300 text-indigo-900',
  document: 'bg-gradient-to-br from-emerald-100 to-white border-emerald-300 text-emerald-800',
  action: 'bg-gradient-to-br from-cyan-100 to-white border-cyan-300 text-cyan-800',
};

export default function KougarNode({ data }: KougarNodeProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={clsx(
        'rounded-xl border px-4 py-3 shadow-sm transition-all duration-300 w-[240px] text-sm font-medium backdrop-blur-md',
        'hover:shadow-md hover:scale-[1.02]',
        categoryStyleMap[data.category]
      )}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-gray-500 rounded-full" />
      <div className="text-sm leading-snug">{data.label}</div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-gray-500 rounded-full" />
    </motion.div>
  );
}
