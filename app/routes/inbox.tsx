import { useState } from "react";
import { useNavigate, useLoaderData, Form } from "@remix-run/react";
import { type LoaderFunctionArgs, type ActionFunctionArgs, json } from "@remix-run/node";
import { AppBar, NotificationCard } from "~/components";
import { requireUserSession, destroySession } from "~/utils/session.server";
import { getMessagesForUser } from "~/utils/supabase.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userSession = await requireUserSession(request);
  const messages = await getMessagesForUser(userSession.userId);

  return json({ messages, userSession });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  
  if (intent === "logout") {
    return destroySession(request);
  }
  
  return null;
}

export default function Inbox() {
  const navigate = useNavigate();
  const { messages, userSession } = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");

  // Helper function to format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return `${Math.floor(diffInMinutes / 1440)}일 전`;
  };

  // Transform database messages to component format
  const receivedMessages = messages.received.map((msg) => ({
    id: msg.id,
    description: msg.content,
    time: formatTime(msg.created_at),
  }));

  const sentMessages = messages.sent.map((msg) => ({
    id: msg.id,
    description: msg.content,
    time: formatTime(msg.created_at),
  }));

  const currentMessages =
    activeTab === "received" ? receivedMessages : sentMessages;

  const handleMessageClick = (messageId: string) => {
    console.log("Message clicked:", messageId);
  };

  const handleCompose = () => {
    navigate("/compose");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white min-h-screen relative">
        <AppBar 
          title="편지함" 
          rightIcon={
            <div className="flex items-center space-x-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm font-medium">로그아웃</span>
            </div>
          }
          onRightClick={() => {
            // Form 제출을 위한 함수
            const form = document.createElement('form');
            form.method = 'POST';
            form.style.display = 'none';
            
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'intent';
            input.value = 'logout';
            
            form.appendChild(input);
            document.body.appendChild(form);
            form.submit();
          }}
        />

        {/* Profile Section */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {userSession.userCode}
              </p>
              <p className="text-xs text-gray-500">
                마니또 참가자
              </p>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab("received")}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === "received"
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              받은 편지
            </button>
            <button
              onClick={() => setActiveTab("sent")}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === "sent"
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              보낸 편지
            </button>
          </div>
        </div>

        {/* Message List */}
        <div className="p-4 space-y-3 pb-20">
          {currentMessages.map((message) => (
            <NotificationCard
              key={message.id}
              {...message}
              isSent={activeTab === "sent"}
              onClick={() => handleMessageClick(message.id)}
            />
          ))}
        </div>

        {/* Floating Action Button */}
        <button
          onClick={handleCompose}
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg 
                   hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 
                   transition-all duration-200 hover:scale-105 active:scale-95
                   flex items-center justify-center"
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
              d="m3 3 3 9-3 9 19-9L3 3Z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
