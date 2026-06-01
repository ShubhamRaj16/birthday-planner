import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import styled from 'styled-components';
import { fetchPhotos, uploadPhoto, updatePhoto, deletePhoto } from '../redux/slices/photosSlice';
import { mediaUrl } from '../lib/apiClient';

interface PhotoGalleryProps {
  eventId: number;
}

// ─── Styled components ────────────────────────────────────────────────────────

const UploadArea = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 10px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s;
  margin-bottom: 1.25rem;

  &:hover { border-color: #7c3aed; }
`;

const UploadLabel = styled.label`
  cursor: pointer;
  color: #7c3aed;
  font-weight: 600;
  font-size: 0.9rem;
`;

const HiddenInput = styled.input`
  display: none;
`;

const CaptionInput = styled.input`
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.4rem 0.7rem;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  box-sizing: border-box;

  &:focus { outline: none; border-color: #7c3aed; }
`;

const UploadBtn = styled.button`
  margin-top: 0.75rem;
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.45rem 1.1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #6d28d9; }
  &:disabled { background: #c4b5fd; cursor: not-allowed; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.75rem;
`;

const PhotoCard = styled.div<{ $isCover: boolean }>`
  border: 2px solid ${({ $isCover }) => ($isCover ? '#7c3aed' : '#e5e7eb')};
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  background: #f9fafb;
`;

const PhotoImg = styled.img`
  width: 100%;
  height: 130px;
  object-fit: cover;
  display: block;
`;

const PhotoFooter = styled.div`
  padding: 0.5rem;
`;

const PhotoCaption = styled.p`
  font-size: 0.78rem;
  color: #6b7280;
  margin: 0 0 0.4rem;
  word-break: break-word;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
`;

const SmallBtn = styled.button<{ $variant?: 'danger' }>`
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: 5px;
  border: 1px solid ${({ $variant }) => ($variant === 'danger' ? '#fca5a5' : '#d1d5db')};
  background: ${({ $variant }) => ($variant === 'danger' ? '#fef2f2' : '#f9fafb')};
  color: ${({ $variant }) => ($variant === 'danger' ? '#dc2626' : '#374151')};
  cursor: pointer;
  font-weight: 600;
  &:hover {
    background: ${({ $variant }) => ($variant === 'danger' ? '#fee2e2' : '#f3f4f6')};
  }
`;

const CoverBadge = styled.span`
  position: absolute;
  top: 6px;
  left: 6px;
  background: #7c3aed;
  color: #fff;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
`;

const EmptyMsg = styled.p`
  color: #9ca3af;
  font-size: 0.875rem;
  text-align: center;
  padding: 1.5rem 0;
`;

const ErrMsg = styled.p`
  color: #b91c1c;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function PhotoGallery({ eventId }: PhotoGalleryProps) {
  const dispatch = useAppDispatch();
  const photos = useAppSelector((s) => s.photos.byEventId[eventId] || []);
  const loading = useAppSelector((s) => s.photos.loading);
  const photosError = useAppSelector((s) => s.photos.error); // SCRUM-57

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  // SCRUM-58: inline caption edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    dispatch(fetchPhotos(eventId));
  }, [dispatch, eventId]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) { setSelectedFile(file); setErr(null); }
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setUploading(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append('photo', selectedFile);
      if (caption.trim()) fd.append('caption', caption.trim());
      await dispatch(uploadPhoto({ eventId, formData: fd })).unwrap();
      setSelectedFile(null);
      setCaption('');
      if (fileRef.current) fileRef.current.value = '';
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleSetCover(photoId: number) {
    await dispatch(updatePhoto({ eventId, photoId, data: { isCover: true } }));
  }

  async function handleDelete(photoId: number) {
    if (!window.confirm('Delete this photo?')) return;
    await dispatch(deletePhoto({ eventId, photoId }));
  }

  // SCRUM-58: open / save caption edit
  function startEdit(photoId: number, current: string | null) {
    setEditingId(photoId);
    setEditCaption(current || '');
  }

  async function saveCaption(photoId: number) {
    await dispatch(updatePhoto({ eventId, photoId, data: { caption: editCaption.trim() } }));
    setEditingId(null);
    setEditCaption('');
  }

  function getPhotoUrl(storagePath: string) {
    return mediaUrl(storagePath);
  }

  return (
    <div>
      <UploadArea onClick={() => fileRef.current?.click()}>
        <UploadLabel>
          {selectedFile ? `Selected: ${selectedFile.name}` : '+ Click to select a photo'}
        </UploadLabel>
        <HiddenInput ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} />
        {selectedFile && (
          <>
            <CaptionInput
              placeholder="Add a caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <UploadBtn disabled={uploading} onClick={(e) => { e.stopPropagation(); handleUpload(); }}>
              {uploading ? 'Uploading…' : 'Upload'}
            </UploadBtn>
          </>
        )}
      </UploadArea>

      {err && <ErrMsg>{err}</ErrMsg>}
      {photosError && <ErrMsg role="alert">{photosError}</ErrMsg>}

      {loading && photos.length === 0 && <EmptyMsg>Loading photos…</EmptyMsg>}

      {!loading && photos.length === 0 && (
        <EmptyMsg>No photos yet. Upload the first memory!</EmptyMsg>
      )}

      {photos.length > 0 && (
        <Grid>
          {photos.map((photo) => (
            <PhotoCard key={photo.id} $isCover={photo.isCover}>
              {photo.isCover && <CoverBadge>Cover</CoverBadge>}
              <PhotoImg src={getPhotoUrl(photo.storagePath)} alt={photo.caption || 'Party photo'} />
              <PhotoFooter>
                {editingId === photo.id ? (
                  <>
                    <CaptionInput
                      autoFocus
                      placeholder="Caption"
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                    />
                    <ActionRow>
                      <SmallBtn onClick={() => saveCaption(photo.id)}>Save</SmallBtn>
                      <SmallBtn onClick={() => setEditingId(null)}>Cancel</SmallBtn>
                    </ActionRow>
                  </>
                ) : (
                  <>
                    {photo.caption && <PhotoCaption>{photo.caption}</PhotoCaption>}
                    <ActionRow>
                      {!photo.isCover && (
                        <SmallBtn onClick={() => handleSetCover(photo.id)}>Set Cover</SmallBtn>
                      )}
                      <SmallBtn onClick={() => startEdit(photo.id, photo.caption)}>
                        {photo.caption ? 'Edit' : '+ Caption'}
                      </SmallBtn>
                      <SmallBtn $variant="danger" onClick={() => handleDelete(photo.id)}>
                        Delete
                      </SmallBtn>
                    </ActionRow>
                  </>
                )}
              </PhotoFooter>
            </PhotoCard>
          ))}
        </Grid>
      )}
    </div>
  );
}
