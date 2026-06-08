import { useState } from "react";
import { getAdminWritePassword, setAdminWritePassword } from "@/lib/adminWrite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export function AdminPasswordGate({ children }: { children: React.ReactNode }) {
  const { user } = useAdminAuth();
  const [pw, setPw] = useState(getAdminWritePassword() ?? "");
  const [unlocked, setUnlocked] = useState(!!getAdminWritePassword());

  // Owner login automatically unlocks the Owner Control Center.
  if (user?.role === "admin" || unlocked) return <>{children}</>;

  return (
    <Card className="max-w-md mx-auto mt-12">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Lock className="w-5 h-5" /> <h2 className="font-semibold">Owner access required</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Sign in as the Owner from the staff login to manage CMS content. You can also enter the
          admin write password manually below.
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
