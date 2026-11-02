import { Signup } from "../_components/Signup";
import { getUser } from "../actions/profile";

import { redirect } from "next/navigation";
export default async function Page() {
  const user = await getUser();
  
    if (user) {
      redirect("/profile");
    }
  
    return <Signup />;
}