import { useNavigation } from "@remix-run/react";

export function LoadingOverlay() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading" || navigation.state === "submitting";

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        {/* 스피너 */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-white border-opacity-20 rounded-full animate-spin">
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
          </div>
        </div>
        
        {/* 로딩 텍스트 */}
        <div className="text-white text-sm font-medium">
          {navigation.state === "loading" ? "페이지를 불러오는 중..." : "처리 중..."}
        </div>
      </div>
    </div>
  );
}