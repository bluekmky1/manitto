import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";

import "normalize.css";
import "./tailwind.css";
import { LoadingOverlay } from "~/components";

export const meta: MetaFunction = () => {
  return [
    { title: "경기대 SGB 마니또" },
    {
      name: "description",
      content:
        "경기대 SGB 마니또 이벤트 - AI 메시지 변환 기능이 있는 익명 채팅 플랫폼",
    },
    { name: "keywords", content: "마니또, 경기대, SGB, 익명메시지" },
    { name: "theme-color", content: "#4F46E5" },
    { property: "og:title", content: "경기대 SGB 마니또" },
    {
      property: "og:description",
      content: "AI 메시지 변환 기능이 있는 마니또 이벤트",
    },
    { property: "og:type", content: "website" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  return json({
    ENV: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    },
  });
}

export const links: LinksFunction = () => [
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
  { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
  { rel: "apple-touch-icon", sizes: "180x180", href: "/favicon.svg" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();

  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <LoadingOverlay />
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
