import { useState } from "react";
import { getAdminWritePassword, setAdminWritePassword } from "@/lib/adminWrite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

export function AdminPasswordGate({ children }: { children: React.ReactNode }) {
  const [pw, setPw] = useState(getAdminWritePassword() ?? "");
  const [unlocked, setUnlocked] = useState(!!getAdminWritePassword());

  if (unlocked) return <>{children}</>;
  return (
    <Card className="max-w-md mx-auto mt-12">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Lock className="w-5 h-5" /> <h2 className="font-semibold">Admin write unlock</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Enter the admin write password (set on the server) to enable creating, editing and deleting CMS content.
        </p>
        <div>
          <Label>Admin write password</Label>
          <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
        </div>
        <Button
          className="w-full"
          onClick={() => { setAdminWritePassword(pw); setUnlocked(true); }}
          disabled={!pw}
        >
          Unlock
        </Button>
      </CardContent>
    </Card>
  );
}
