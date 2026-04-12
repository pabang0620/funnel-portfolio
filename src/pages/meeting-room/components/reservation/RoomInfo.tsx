import { Card, CardContent } from '../../components/ui/card';
import { Users, MapPin } from 'lucide-react';
import type { Room } from '../../types';
import { getImageUrl } from '../../lib/utils';

interface RoomInfoProps {
  room: Room;
}

export function RoomInfo({ room }: RoomInfoProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          {room.image_url ? (
            <img
              src={getImageUrl(room.image_url) || ''}
              alt={room.name}
              className="w-24 h-24 rounded-lg object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          <div className="flex-1">
            <h3 className="font-semibold text-lg">{room.name}</h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{room.floor}</span>
              </div>
              {room.capacity && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>최대 {room.capacity}명</span>
                </div>
              )}
            </div>
            {room.description && (
              <p className="mt-2 text-sm text-muted-foreground">{room.description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
