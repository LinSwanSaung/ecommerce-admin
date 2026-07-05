import { redirect } from "next/navigation";

// "/" redirects to the dashboard on the server.
export default function Home() {
  redirect("/dashboard");
}
