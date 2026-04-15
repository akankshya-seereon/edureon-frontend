import { ChevronRight } from 'lucide-react';

export const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex items-center gap-2 mb-4">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <a
            href={item.href || '#'}
            className={`text-sm ${
              idx === items.length - 1
                ? 'text-gray-900 font-semibold'
                : 'text-blue-600 hover:text-blue-700'
            }`}
          >
            {item.label}
          </a>
          {idx < items.length - 1 && <ChevronRight size={16} className="text-gray-400" />}
        </div>
      ))}
    </nav>
  );
};