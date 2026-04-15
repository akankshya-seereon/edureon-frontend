export const ChartCard = ({ title, children, footer = null }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <div className="mb-4">
        {children}
      </div>
      {footer && <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">{footer}</div>}
    </div>
  );
};