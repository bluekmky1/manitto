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
  "다음 문장을 재미있고 과장된 친근한 말투로 변환해주세요: 의미는 유지하되 더 활기차고 유쾌하게, 이모지 2-4개 사용, 감탄사와 의성어 추가, 오버스럽고 귀여운 말투로 표현해주세요!";

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

    // 과장되고 재미있는 말투 변환
    const systemPrompt = `당신은 메시지를 재미있고 과장되게 만드는 전문가입니다! 주어진 메시지의 핵심 의미는 유지하되, 더 활기차고 유쾌한 말투로 변환해주세요. 이모지를 풍부하게 사용하고, "와~~", "헉!", "대박!", "ㅋㅋㅋ" 같은 감탄사와 의성어를 넣어서 오버스럽고 귀여운 톤으로 만들어주세요! 200자 이내로 유지하세요.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
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
        max_tokens: 150,
        temperature: 0.9,
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
