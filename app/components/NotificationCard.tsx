interface NotificationCardProps {
  id: String;
  description: string;
  time: string;
  onClick?: () => void;
  isSent?: boolean;
}

export function NotificationCard({
  description,
  time,
  onClick,
  isSent = false,
}: NotificationCardProps) {
  return (
    <div
      className="bg-white rounded-lg p-4 border border-gray-200 shadow transition-all hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900">
              {isSent ? "To. 내 담당 마니또" : "From. 익명의 마니또"}
            </h3>
            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
              {time}
            </span>
          </div>

          <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">{description}</p>
        </div>
      </div>
    </div>
  );
}
