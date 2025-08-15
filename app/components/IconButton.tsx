interface IconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function IconButton({
  icon,
  onClick,
  disabled = false,
  variant = 'default',
  size = 'md',
  className = ""
}: IconButtonProps) {
  const baseClasses = "inline-flex items-center justify-center rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    default: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500",
    primary: "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 focus:ring-indigo-500",
    secondary: "text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    danger: "text-red-600 hover:text-red-700 hover:bg-red-50 focus:ring-red-500"
  };
  
  const sizeClasses = {
    sm: "p-1.5 text-sm",
    md: "p-2 text-base", 
    lg: "p-3 text-lg"
  };
  
  const disabledClasses = "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {icon}
    </button>
  );
}