import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ImagePlus, Trash2 } from 'lucide-react';

export interface RoomPhoto {
  id: string;
  name: string;
  description: string;
  image: string; // base64 data URL
}

const DEFAULT_ROOM_TYPES = ['Deluxe Room', 'Family Room', 'Suite Room'];

const RoomPhotos = () => {
  const [photos, setPhotos] = useLocalStorage<RoomPhoto[]>('malar_room_photos', []);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (!name.trim()) {
        toast.error('Please enter a room name first');
        return;
      }
      const newPhoto: RoomPhoto = {
        id: Date.now().toString(),
        name: name.trim(),
        description: description.trim(),
        image: base64,
      };
      setPhotos([...photos, newPhoto]);
      setName('');
      setDescription('');
      e.target.value = '';
      toast.success('Room photo added!');
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (id: string) => {
    setPhotos(photos.filter(p => p.id !== id));
    toast.success('Photo removed');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">📸 Room Photos</h1>
      <p className="text-sm text-muted-foreground">
        Add or remove room photos that appear on the hotel homepage. Max 2MB per image.
      </p>

      {/* Add Photo Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Add Room Photo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Room Name</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Deluxe Room"
              list="room-types"
            />
            <datalist id="room-types">
              {DEFAULT_ROOM_TYPES.map(t => <option key={t} value={t} />)}
            </datalist>
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Short description of the room"
            />
          </div>
          <div>
            <Label>Upload Image</Label>
            <div className="mt-1">
              <label className="flex items-center gap-2 cursor-pointer border border-dashed rounded-md p-4 hover:bg-muted/50 transition-colors">
                <ImagePlus className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to select image (JPG, PNG)</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Photos */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Current Room Photos ({photos.length})</h2>
        {photos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No custom photos added. Default images will be shown on the homepage.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map(photo => (
              <Card key={photo.id} className="overflow-hidden">
                <img src={photo.image} alt={photo.name} className="w-full h-40 object-cover" />
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{photo.name}</p>
                      <p className="text-xs text-muted-foreground">{photo.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removePhoto(photo.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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