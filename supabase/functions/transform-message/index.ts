import { serve } from "https://deno.land/std@0.220.1/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TransformRequest {
  message: string;
}

const FRIENDLY_TONE_PROMPT =
  "다음 문장의 핵심 의미와 내용을 절대 바꾸지 말고, 말투만 살짝 부드럽게 만들어주세요: 기존 문장 구조 유지, 1-2개 이모지만 추가, 내용 추가하거나 해석하지 말 것, 원본과 같은 길이로 유지.";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const requestBody = await req.text();
    let parsedBody;
    
    try {
      parsedBody = JSON.parse(requestBody);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Body:', requestBody);
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const { message }: TransformRequest = parsedBody;

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (message.length > 200) {
      return new Response(JSON.stringify({ error: "Message too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 의미 보존하며 최소한의 말투 변환
    const systemPrompt = `당신은 메시지 말투 조정 전문가입니다. 주어진 메시지의 의미, 내용, 길이를 절대 바꾸지 마세요. 오직 말투만 살짝 부드럽게 조정하고 1-2개의 이모지만 추가하세요. 내용을 해석하거나 추가 설명하지 말고, 원본 문장을 거의 그대로 유지하면서 톤만 조금 더 친근하게 만드세요.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `${FRIENDLY_TONE_PROMPT}\n\n원본 메시지: "${message}"`,
          },
        ],
        max_tokens: 100,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to transform message" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const transformedMessage = data.choices[0]?.message?.content?.trim();

    if (!transformedMessage) {
      return new Response(
        JSON.stringify({ error: "No transformed message received" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // If transformed message is too long, use original message
    const finalMessage =
      transformedMessage.length > 200 ? message : transformedMessage;

    return new Response(
      JSON.stringify({
        originalMessage: message,
        transformedMessage: finalMessage,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in transform-message function:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
