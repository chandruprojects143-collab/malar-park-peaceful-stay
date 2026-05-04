import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRooms, type PerRoomUnavailable } from "@/hooks/useRooms";

const AvailabilityManager = () => {
  const [unavailable, setUnavailable] = useLocalStorage<string[]>("malar_unavailable_dates", []);
  const [perRoom, setPerRoom] = useLocalStorage<PerRoomUnavailable>("malar_room_unavailable", {});
  const rooms = useRooms();

  const globalSelected = unavailable.map(d => new Date(d));
  const handleGlobal = (dates: Date[] | undefined) => {
    setUnavailable((dates ?? []).map(d => format(d, "yyyy-MM-dd")));
  };
  const clearGlobal = () => { setUnavailable([]); toast.success("All hotel-wide blocks cleared"); };

  const setRoomDates = (roomName: string, dates: Date[] | undefined) => {
    const arr = (dates ?? []).map(d => format(d, "yyyy-MM-dd"));
    setPerRoom(prev => ({ ...prev, [roomName]: arr }));
  };
  const clearRoom = (roomName: string) => {
    setPerRoom(prev => ({ ...prev, [roomName]: [] }));
    toast.success(`${roomName} blocks cleared`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">📅 Availability Calendar</h1>
      <p className="text-sm text-muted-foreground">
        Block dates either <strong>hotel-wide</strong> (closes all rooms) or <strong>per room</strong>
        (a specific room type is sold out). Per-room blocks prevent that room from being added to a multi-room booking on those dates.
      </p>

      <Tabs defaultValue="global">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="global">Hotel-wide</TabsTrigger>
          {rooms.map(r => (
            <TabsTrigger key={r.name} value={r.name}>{r.name}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="global" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Hotel-wide blocked dates ({unavailable.length})</CardTitle>
              <Button variant="outline" size="sm" onClick={clearGlobal}>Clear All</Button>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="multiple"
                selected={globalSelected}
                onSelect={handleGlobal}
                disabled={d => d < new Date(new Date().setHours(0, 0, 0, 0))}
                className="p-3 pointer-events-auto"
              />
              {unavailable.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {[...unavailable].sort().map(d => (
                    <span key={d} className="text-xs bg-muted px-2 py-1 rounded-md">{d}</span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {rooms.map(r => {
          const list = perRoom[r.name] ?? [];
          return (
            <TabsContent key={r.name} value={r.name} className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm">{r.name} — sold-out dates ({list.length})</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => clearRoom(r.name)}>Clear All</Button>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="multiple"
                    selected={list.map(d => new Date(d))}
                    onSelect={dates => setRoomDates(r.name, dates)}
                    disabled={d => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="p-3 pointer-events-auto"
                  />
                  {list.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {[...list].sort().map(d => (
                        <span key={d} className="text-xs bg-muted px-2 py-1 rounded-md">{d}</span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default AvailabilityManager;
