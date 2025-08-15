import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { getUserCode } from "~/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userCode = await getUserCode(request);
  
  if (userCode) {
    return redirect("/inbox");
  }
  
  return redirect("/join");
}