import { redirect } from "next/navigation";
import { getUser } from "@/app/actions/profile";
import { Login } from "../_components/Login";

export default async function Page() {
  if (await getUser()) {
    redirect("/");
  }

  return <Login />;
}
