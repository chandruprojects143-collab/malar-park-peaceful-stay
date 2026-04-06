import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Plus, Trash2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export interface GalleryPhoto {
  id: string;
  image: string;
  caption: string;
}

const GalleryPhotos = () => {
  const [photos, setPhotos] = useLocalStorage<GalleryPhoto[]>('malar_gallery_photos', []);
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addPhoto = () => {
    if (!preview) { toast.error('Please select an image'); return; }
    if (!caption.trim()) { toast.error('Please add a caption'); return; }
    setPhotos([...photos, { id: Date.now().toString(), image: preview, caption: caption.trim() }]);
    setCaption('');
    setPreview('');
    toast.success('Photo added to gallery');
  };

  const removePhoto = (id: string) => {
    setPhotos(photos.filter(p => p.id !== id));
    toast.success('Photo removed');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Gallery Photos</h1>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="w-5 h-5" /> Add Photo</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Image (max 2MB)</Label>
            <Input type="file" accept="image/*" onChange={handleImageChange} />
          </div>
          {preview && <img src={preview} alt="Preview" className="w-40 h-28 object-cover rounded-lg" />}
          <div>
            <Label>Caption</Label>
            <Input value={caption} onChange={e => setCaption(e.target.value)} placeholder="e.g. Hotel Lobby" />
          </div>
          <Button onClick={addPhoto} className="gap-2"><Plus className="w-4 h-4" /> Add to Gallery</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon className="w-5 h-5" /> Current Gallery ({photos.length} photos)</CardTitle></CardHeader>
        <CardContent>
          {photos.length === 0 ? (
            <p className="text-muted-foreground text-sm">No custom photos. Default gallery images will be shown on the homepage.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map(p => (
                <div key={p.id} className="relative group rounded-lg overflow-hidden border border-border">
                  <img src={p.image} alt={p.caption} className="w-full h-36 object-cover" />
                  <div className="p-2 bg-muted">
                    <p className="text-sm font-medium text-foreground truncate">{p.caption}</p>
                  </div>
                  <Button
                    size="icon" variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={() => removePhoto(p.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GalleryPhotos;
