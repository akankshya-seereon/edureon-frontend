export const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-100 ${className}`} {...props}>
      {children}
    </div>
  );
};