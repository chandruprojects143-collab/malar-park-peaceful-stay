import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useRooms, usePerRoomUnavailable } from "@/hooks/useRooms";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { auditRoomImages } from "@/lib/imageValidation";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

const HORIZON_DAYS = 30;

const AvailabilitySummary = () => {
  const rooms = useRooms();
  const perRoom = usePerRoomUnavailable();
  const [globalBlocked] = useLocalStorage<string[]>("malar_unavailable_dates", []);
  const [inventory, setInventory] = useLocalStorage<Record<string, number>>(
    "malar_room_inventory",
    {}
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Count blocked dates within horizon
  const blockedInHorizon = (dates: string[]) =>
    dates.filter((d) => {
      const dt = new Date(d);
      const diff = (dt.getTime() - today.getTime()) / 86400000;
      return diff >= 0 && diff < HORIZON_DAYS;
    }).length;

  const globalBlockedCount = blockedInHorizon(globalBlocked);

  const imgAudit = useMemo(() => auditRoomImages(rooms), [rooms]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">📊 Room Availability Summary</h1>
      <p className="text-sm text-muted-foreground">
        Inventory × (next {HORIZON_DAYS} days − blocked dates) = remaining room-nights you can sell.
        Hotel-wide blocks ({globalBlockedCount} day{globalBlockedCount === 1 ? "" : "s"} in horizon)
        apply to every room. Manage blocks on the{" "}
        <Link to="/admin/availability" className="text-primary underline">Availability page</Link>.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((r) => {
          const inv = Math.max(0, Number(inventory[r.name] ?? 1));
          const roomBlocked = perRoom[r.name] ?? [];
          const roomBlockedCount = blockedInHorizon(roomBlocked);
          const totalBlockedDays = Math.min(
            HORIZON_DAYS,
            roomBlockedCount + globalBlockedCount
          );
          const sellableDays = Math.max(0, HORIZON_DAYS - totalBlockedDays);
          const remainingNights = inv * sellableDays;
          const utilization = inv > 0 ? Math.round((totalBlockedDays / HORIZON_DAYS) * 100) : 0;

          const status =
            inv === 0
              ? { label: "No inventory", variant: "destructive" as const }
              : utilization >= 80
              ? { label: "Heavily blocked", variant: "destructive" as const }
              : utilization >= 30
              ? { label: "Partially blocked", variant: "secondary" as const }
              : { label: "Healthy", variant: "default" as const };

          return (
            <Card key={r.name}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="truncate">{r.name}</span>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor={`inv-${r.name}`} className="text-xs">
                    Total inventory (units)
                  </Label>
                  <Input
                    id={`inv-${r.name}`}
                    type="number"
                    min={0}
                    value={inv}
                    onChange={(e) =>
                      setInventory((prev) => ({
                        ...prev,
                        [r.name]: Math.max(0, Number(e.target.value) || 0),
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <Stat label="Per-room blocked dates (next 30d)" value={roomBlockedCount} />
                <Stat label="Hotel-wide blocked dates (next 30d)" value={globalBlockedCount} />
                <Stat label="Sellable days in horizon" value={sellableDays} />
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Remaining room-nights (next 30d)</p>
                  <p className="text-2xl font-bold text-primary">{remainingNights}</p>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  ₹{r.price.toLocaleString()}/night · max revenue if fully sold:{" "}
                  <span className="font-semibold text-foreground">
                    ₹{(remainingNights * r.price).toLocaleString()}
                  </span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            {imgAudit.badImages === 0 ? (
              <CheckCircle2 className="w-4 h-4 text-primary" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-destructive" />
            )}
            Image URL Validator ({imgAudit.totalImages} total, {imgAudit.badImages} flagged)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {imgAudit.badImages === 0 ? (
            <p className="text-sm text-muted-foreground">
              All room photos use publicly reachable URLs (good for OG / Twitter previews).
            </p>
          ) : (
            <ul className="text-xs space-y-2">
              {imgAudit.issues.map((it, i) => (
                <li
                  key={i}
                  className="border-l-2 border-destructive bg-destructive/5 px-3 py-2 rounded-r"
                >
                  <p className="font-medium text-foreground">
                    {it.room} — image #{it.index + 1}{" "}
                    <Badge variant="destructive" className="ml-1">{it.issue.kind}</Badge>
                  </p>
                  <p className="text-muted-foreground">{it.issue.message}</p>
                  <p className="font-mono text-[10px] mt-1 break-all">{it.issue.url}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-semibold tabular-nums">{value}</span>
  </div>
);

export default AvailabilitySummary;
