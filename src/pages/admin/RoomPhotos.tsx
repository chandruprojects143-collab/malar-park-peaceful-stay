import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ImagePlus, Trash2, Plus, X } from 'lucide-react';

export interface RoomPhoto {
  id: string;
  name: string;
  description: string;
  images: string[]; // multiple base64 data URLs
}

const DEFAULT_ROOM_TYPES = ['Deluxe Room', 'Family Room', 'Suite Room'];

const RoomPhotos = () => {
  const [rooms, setRooms] = useLocalStorage<RoomPhoto[]>('malar_room_photos', []);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pendingImages, setPendingImages] = useState<string[]>([]);

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 2MB limit`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => setPendingImages(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removePending = (idx: number) => {
    setPendingImages(prev => prev.filter((_, i) => i !== idx));
  };

  const addRoom = () => {
    if (!name.trim()) { toast.error('Enter a room name'); return; }
    if (pendingImages.length === 0) { toast.error('Add at least one image'); return; }
    setRooms([...rooms, {
      id: Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      images: pendingImages,
    }]);
    setName('');
    setDescription('');
    setPendingImages([]);
    toast.success('Room added!');
  };

  const removeRoom = (id: string) => {
    setRooms(rooms.filter(r => r.id !== id));
    toast.success('Room removed');
  };

  const removeImageFromRoom = (roomId: string, imgIdx: number) => {
    setRooms(rooms.map(r => {
      if (r.id !== roomId) return r;
      const newImages = r.images.filter((_, i) => i !== imgIdx);
      return { ...r, images: newImages };
    }).filter(r => r.images.length > 0));
    toast.success('Image removed');
  };

  const addImageToRoom = (roomId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setRooms(rooms.map(r =>
        r.id === roomId ? { ...r, images: [...r.images, reader.result as string] } : r
      ));
      toast.success('Image added to room');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">📸 Room Photos</h1>
      <p className="text-sm text-muted-foreground">
        Add rooms with single or multiple photos. These appear on the homepage. Max 2MB per image.
      </p>

      <Card>
        <CardHeader><CardTitle className="text-sm">Add New Room</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Room Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Deluxe Room" list="room-types" />
            <datalist id="room-types">{DEFAULT_ROOM_TYPES.map(t => <option key={t} value={t} />)}</datalist>
          </div>
          <div>
            <Label>Description</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description" />
          </div>
          <div>
            <Label>Upload Images (select multiple)</Label>
            <label className="flex items-center gap-2 cursor-pointer border border-dashed rounded-md p-4 hover:bg-muted/50 transition-colors mt-1">
              <ImagePlus className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to select images</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageAdd} />
            </label>
          </div>
          {pendingImages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {pendingImages.map((img, i) => (
                <div key={i} className="relative w-20 h-20">
                  <img src={img} alt="" className="w-full h-full object-cover rounded-md" />
                  <button onClick={() => removePending(i)} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <Button onClick={addRoom} className="gap-2"><Plus className="w-4 h-4" /> Add Room</Button>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-3">Current Rooms ({rooms.length})</h2>
        {rooms.length === 0 ? (
          <p className="text-sm text-muted-foreground">No custom rooms. Default images shown on homepage.</p>
        ) : (
          <div className="space-y-4">
            {rooms.map(room => (
              <Card key={room.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-foreground">{room.name}</p>
                      <p className="text-xs text-muted-foreground">{room.description}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeRoom(room.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {room.images.map((img, i) => (
                      <div key={i} className="relative w-24 h-20 group">
                        <img src={img} alt={`${room.name} ${i + 1}`} className="w-full h-full object-cover rounded-md" />
                        <button
                          onClick={() => removeImageFromRoom(room.id, i)}
                          className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <label className="w-24 h-20 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                      <Plus className="w-5 h-5 text-muted-foreground" />
                      <input type="file" accept="image/*" className="hidden" onChange={e => addImageToRoom(room.id, e)} />
                    </label>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomPhotos;
