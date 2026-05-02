import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";

const AvailabilityManager = () => {
  const [unavailable, setUnavailable] = useLocalStorage<string[]>("malar_unavailable_dates", []);
  const selected = unavailable.map(d => new Date(d));

  const handleSelect = (dates: Date[] | undefined) => {
    const arr = (dates ?? []).map(d => format(d, "yyyy-MM-dd"));
    setUnavailable(arr);
  };

  const clear = () => { setUnavailable([]); toast.success("All dates marked available"); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-heading font-bold">📅 Availability Calendar</h1>
        <Button variant="outline" size="sm" onClick={clear}>Clear All</Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Click dates to mark them as <strong>unavailable</strong>. Guests cannot select these on the booking form.
      </p>
      <Card>
        <CardHeader><CardTitle className="text-sm">Blocked Dates ({unavailable.length})</CardTitle></CardHeader>
        <CardContent>
          <Calendar
            mode="multiple"
            selected={selected}
            onSelect={handleSelect}
            disabled={d => d < new Date(new Date().setHours(0, 0, 0, 0))}
            className="p-3 pointer-events-auto"
          />
        </CardContent>
      </Card>
      {unavailable.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">List</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {unavailable.sort().map(d => (
              <span key={d} className="text-xs bg-muted px-2 py-1 rounded-md">{d}</span>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AvailabilityManager;
