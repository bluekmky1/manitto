import { useState } from "react";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { type ActionFunctionArgs, json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { Input } from "~/components";
import { createUserSession, getUserCode } from "~/utils/session.server";
import { authenticateUser } from "~/utils/supabase.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userCode = await getUserCode(request);
  if (userCode) {
    return redirect("/inbox");
  }
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const code = formData.get("code")?.toString().toUpperCase();

  if (!code || code.length !== 6) {
    return json(
      { error: "6자리 코드를 입력해주세요." },
      { status: 400 }
    );
  }

  // Validate user code with Supabase
  const validation = await authenticateUser(code);
  
  if (!validation.isValid || !validation.userInfo) {
    return json(
      { error: "잘못된 개인 코드입니다. 다시 확인해주세요." },
      { status: 400 }
    );
  }

  // Create user session and redirect to inbox
  const { userId, roomId, roomCode, nickname } = validation.userInfo;
  return createUserSession(code, roomCode, userId, nickname, "/inbox");
}

export default function Join() {
  const [code, setCode] = useState("");
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            경기대 SGB 마니또
          </h1>

          <p className="text-gray-600 text-sm mt-4 text-center">
            메시지를 확인하거나 보내기 위해 받으신
            <br /> 6자리 개인 코드를 입력해주세요.
          </p>
        </div>

        <Form method="post" className="space-y-6">
          <div>
            <Input
              name="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              className="text-center text-lg font-mono"
              disabled={isSubmitting}
              maxLength={6}
            />
            {actionData?.error && (
              <p className="mt-2 text-sm text-red-600">{actionData.error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!code.trim() || isSubmitting}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-xl font-medium text-lg
                     hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                     disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "입장 중..." : "입장하기"}
          </button>
        </Form>
      </div>
    </div>
  );
}
