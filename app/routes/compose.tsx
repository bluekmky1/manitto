import { useState } from "react";
import {
  useNavigate,
  useActionData,
  useNavigation,
  useLoaderData,
  Form,
} from "@remix-run/react";
import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { requireUserSession, destroySession } from "~/utils/session.server";
import { getManittoCTarget, sendMessage } from "~/utils/supabase.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userSession = await requireUserSession(request);
  const manittoTarget = await getManittoCTarget(userSession.userId);

  if (!manittoTarget) {
    // If no manitto target found, redirect to inbox with error
    // In a real app, this would be handled differently
    return redirect("/inbox");
  }

  return json({ userSession, manittoTarget });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "logout") {
    return destroySession(request);
  }

  const userSession = await requireUserSession(request);
  const message = formData.get("message")?.toString();

  if (!message || message.trim().length === 0) {
    return json({ error: "메시지를 입력해주세요." }, { status: 400 });
  }

  if (message.length > 200) {
    return json(
      { error: "메시지는 200자까지만 쓸 수 있습니다." },
      { status: 400 }
    );
  }

  // Get manitto target
  const manittoTarget = await getManittoCTarget(userSession.userId);
  if (!manittoTarget) {
    return json({ error: "마니또 대상을 찾을 수 없습니다." }, { status: 400 });
  }

  // Send message
  const result = await sendMessage(
    userSession.userId,
    manittoTarget.id,
    userSession.roomCode,
    message.trim()
  );

  if (!result.success) {
    return json(
      { error: result.error || "메시지 전송에 실패했습니다." },
      { status: 500 }
    );
  }

  return redirect("/inbox");
}

export default function Compose() {
  const navigate = useNavigate();
  const { manittoTarget } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [message, setMessage] = useState("");
  const [showTarget, setShowTarget] = useState(false);

  const isSubmitting = navigation.state === "submitting";

  const handleBack = () => {
    navigate("/inbox");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-gray-900 text-lg font-medium ml-4">
              편지 쓰기
            </h1>
          </div>

          <button
            onClick={() => {
              // Form 제출을 위한 함수
              const form = document.createElement("form");
              form.method = "POST";
              form.style.display = "none";

              const input = document.createElement("input");
              input.type = "hidden";
              input.name = "intent";
              input.value = "logout";

              form.appendChild(input);
              document.body.appendChild(form);
              form.submit();
            }}
            className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="text-sm font-medium">로그아웃</span>
          </button>
        </div>

        {/* Target Info Toggle */}
        <div className="bg-indigo-50 border-b border-indigo-200 px-4 py-2">
          <button
            onClick={() => setShowTarget(!showTarget)}
            className="flex items-center justify-between w-full py-1 text-indigo-900 hover:text-indigo-700 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium">
                받는 사람 {showTarget ? "숨기기" : "보기"}
              </span>
            </div>
            <svg
              className={`w-4 h-4 transition-transform ${
                showTarget ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showTarget && (
            <div className="flex items-center space-x-3 mt-2 pt-2 border-t border-indigo-200">
              <div>
                <p className="text-sm font-medium text-indigo-900">
                  {manittoTarget.nickname || manittoTarget.user_code}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col px-4 py-4">
          <Form method="post" className="space-y-4">
            {/* Input field */}
            <div>
              <textarea
                name="message"
                value={message}
                onChange={(e) => {
                  if (e.target.value.length <= 200) {
                    setMessage(e.target.value);
                  }
                }}
                placeholder="메시지를 입력하세요..."
                className="w-full bg-white text-gray-900 placeholder-gray-500 rounded-xl px-4 py-3 
                       resize-none border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                       h-40"
                disabled={isSubmitting}
              />

              {actionData?.error && (
                <p className="mt-2 text-sm text-red-600">{actionData.error}</p>
              )}
            </div>

            {/* Character Counter */}
            <div className="flex justify-end">
              <span
                className={`text-sm ${
                  message.length > 200
                    ? "text-red-500"
                    : message.length > 160
                    ? "text-yellow-600"
                    : "text-gray-500"
                }`}
              >
                {message.length}/200
              </span>
            </div>

            {/* Send button */}
            <button
              type="submit"
              disabled={!message.trim() || isSubmitting || message.length > 200}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-xl font-medium
                     hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                     disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed 
                     transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  전송 중...
                </div>
              ) : (
                "보내기"
              )}
            </button>
          </Form>

          {/* Tip Section */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mt-4">
            <h3 className="text-sm font-medium text-indigo-900 mb-2">
              💡 마니또 편지 작성 팁
            </h3>
            <ul className="text-sm text-indigo-800 space-y-1">
              <li>• 자신의 이름을 밝히지 않도록 주의하세요</li>
              <li>• 메시지는 200자까지만 쓸 수 있습니다</li>
              <li>• AI가 자동으로 재미있고 친근한 말투로 변환해드려요! 😆✨</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
