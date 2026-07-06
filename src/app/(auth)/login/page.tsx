import type { Metadata } from "next";
import { Package2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <div className="mb-2 flex items-center gap-2 font-semibold">
          <Package2 className="h-6 w-6" />
          Acme Admin
        </div>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Use the demo account: admin@acme.com / admin123
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
