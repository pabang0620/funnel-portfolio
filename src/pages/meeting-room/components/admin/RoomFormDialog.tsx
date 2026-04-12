import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Upload } from 'lucide-react';
import { uploadRoomImage, type CreateRoomRequest, type UpdateRoomRequest } from '../../lib/api_stub';
import type { Room } from '../../types';
import { getImageUrl } from '../../lib/utils';

interface RoomFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  room?: Room;
  onCreateRoom: (data: CreateRoomRequest) => Promise<Room>;
  onUpdateRoom: (id: string, data: UpdateRoomRequest) => Promise<Room>;
}

export function RoomFormDialog({ open, onOpenChange, mode, room, onCreateRoom, onUpdateRoom }: RoomFormDialogProps) {
  const [name, setName] = useState('');
  const [floor, setFloor] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [capacity, setCapacity] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && room) {
        setName(room.name);
        setFloor(room.floor);
        setDescription(room.description || '');
        setImageUrl(room.image_url || '');
        setSelectedFile(null);
        setPreviewUrl(null);
        setCapacity(room.capacity || '');
      } else {
        setName('');
        setFloor('');
        setDescription('');
        setImageUrl('');
        setSelectedFile(null);
        setPreviewUrl(null);
        setCapacity('');
      }
      setError(null);
    }
  }, [open, mode, room]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB 이하여야 합니다');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('JPG, PNG, WEBP 형식만 업로드 가능합니다');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setError(null);
    setSelectedFile(file);

    // 로컬 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !floor.trim()) {
      setError('회의실 이름과 층을 입력해주세요');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = imageUrl;

      // 새 이미지가 선택되었으면 먼저 업로드
      if (selectedFile) {
        console.log('이미지 업로드 시작:', selectedFile.name);
        const uploadResult = await uploadRoomImage(selectedFile);
        finalImageUrl = uploadResult.filename;
        console.log('이미지 업로드 성공:', uploadResult);
      }

      if (mode === 'create') {
        console.log('회의실 생성 시작:', { name, floor, image_url: finalImageUrl });
        const result = await onCreateRoom({
          name: name.trim(),
          floor: floor.trim(),
          description: description.trim() || undefined,
          image_url: finalImageUrl.trim() || undefined,
          capacity: typeof capacity === 'number' ? capacity : undefined,
        });
        console.log('회의실 생성 완료:', result);
      } else if (mode === 'edit' && room) {
        console.log('회의실 수정 시작:', room.id);
        const result = await onUpdateRoom(room.id, {
          name: name.trim(),
          floor: floor.trim(),
          description: description.trim() || undefined,
          image_url: finalImageUrl.trim() || undefined,
          capacity: typeof capacity === 'number' ? capacity : undefined,
        });
        console.log('회의실 수정 완료:', result);
      }
      console.log('다이얼로그 닫기');
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '작업에 실패했습니다');
      console.error('작업 실패:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? '새 회의실 추가' : '회의실 수정'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? '새로운 회의실을 추가합니다.' : '회의실 정보를 수정합니다.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs">회의실 이름 *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 314호"
                  className="h-9"
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="floor" className="text-xs">층 *</Label>
                <Input
                  id="floor"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="예: 3F"
                  className="h-9"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="capacity" className="text-xs">수용 인원</Label>
              <Input
                id="capacity"
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="예: 8"
                className="h-9"
                min="1"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="description" className="text-xs">설명</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="회의실 설명"
                className="h-9"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="imageUrl" className="text-xs">이미지</Label>
              <div className="flex gap-2">
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="파일명 (예: 314-1.jpg)"
                  className="h-9 flex-1"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-9"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  파일 선택
                </Button>
              </div>

              {/* 이미지 미리보기 영역 */}
              {(previewUrl || imageUrl) && (
                <div className="mt-2 border rounded p-2">
                  <img
                    src={previewUrl || getImageUrl(imageUrl) || ''}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded"
                    onError={(e) => {
                      console.error('이미지 로드 실패:', e.currentTarget.src);
                    }}
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                파일명 직접 입력 또는 "파일 선택" 버튼 사용 • JPG, PNG, WEBP (최대 5MB)
              </p>
            </div>

            {error && (
              <div className="text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              size="sm"
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting} size="sm">
              {isSubmitting ? '처리 중...' : mode === 'create' ? '추가' : '수정'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
