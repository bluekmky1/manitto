import type { MetaFunction } from "@remix-run/node";
import { CommunityView } from "../ui/community/CommunityView";

export const meta: MetaFunction = () => {
  return [
    { title: "Remix App" },
    { name: "description", content: "Remix App" },
  ];
};

export default function Index() {
  return <CommunityView />;
}
