interface AppBarProps {
  title: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onLeftClick?: () => void;
  onRightClick?: () => void;
}

export function AppBar({
  title,
  leftIcon,
  rightIcon,
  onLeftClick,
  onRightClick,
}: AppBarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-6">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center">
          {leftIcon && (
            <button
              onClick={onLeftClick}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {leftIcon}
            </button>
          )}
        </div>

        {/* Center title */}
        <h1 className="text-lg font-semibold text-gray-900 absolute left-1/2 transform -translate-x-1/2">
          {title}
        </h1>

        {/* Right side */}
        <div className="flex items-center">
          {rightIcon && (
            <button
              onClick={onRightClick}
              className="p-2 -mr-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {rightIcon}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
