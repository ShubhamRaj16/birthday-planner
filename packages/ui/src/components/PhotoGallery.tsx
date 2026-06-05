import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import styled from 'styled-components';
import { fetchPhotos, uploadPhoto, updatePhoto, deletePhoto } from '../redux/slices/photosSlice';
import { mediaUrl } from '../lib/media';
import { colors, radius } from '../design/tokens';
import PhotoCard from './PhotoGallery/PhotoCard';

interface PhotoGalleryProps {
  eventId: number;
}

const UploadArea = styled.div`
  border: 2px dashed ${colors.border};
  border-radius: ${radius.lg};
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s;
  margin-bottom: 1.25rem;

  &:hover {
    border-color: ${colors.primary};
  }
`;

const UploadLabel = styled.label`
  cursor: pointer;
  color: ${colors.primary};
  font-weight: 600;
  font-size: 0.9rem;
`;

const HiddenInput = styled.input`
  display: none;
`;

const CaptionInput = styled.input`
  width: 100%;
  border: 1px solid ${colors.borderLight};
  border-radius: 6px;
  padding: 0.4rem 0.7rem;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

const UploadBtn = styled.button`
  margin-top: 0.75rem;
  background: ${colors.primary};
  color: ${colors.white};
  border: none;
  border-radius: ${radius.md};
  padding: 0.45rem 1.1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: ${colors.primaryHover};
  }

  &:disabled {
    background: #c4b5fd;
    cursor: not-allowed;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.75rem;
`;

const EmptyMsg = styled.p`
  color: ${colors.textDisabled};
  font-size: 0.875rem;
  text-align: center;
  padding: 1.5rem 0;
`;

const ErrMsg = styled.p`
  color: ${colors.error};
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
`;

export default function PhotoGallery({ eventId }: PhotoGalleryProps) {
  const dispatch = useAppDispatch();
  const photos = useAppSelector((s) => s.photos.byEventId[eventId] || []);
  const loading = useAppSelector((s) => s.photos.loading);
  const photosError = useAppSelector((s) => s.photos.error);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    dispatch(fetchPhotos(eventId));
  }, [dispatch, eventId]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErr(null);
    }
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

  async function handleSaveCaption(photoId: number, newCaption: string) {
    await dispatch(updatePhoto({ eventId, photoId, data: { caption: newCaption } }));
  }

  async function handleSetCover(photoId: number) {
    await dispatch(updatePhoto({ eventId, photoId, data: { isCover: true } }));
  }

  async function handleDelete(photoId: number) {
    if (!window.confirm('Delete this photo?')) return;
    await dispatch(deletePhoto({ eventId, photoId }));
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
            <UploadBtn
              disabled={uploading}
              onClick={(e) => {
                e.stopPropagation();
                handleUpload();
              }}
            >
              {uploading ? 'Uploading…' : 'Upload'}
            </UploadBtn>
          </>
        )}
      </UploadArea>

      {err && <ErrMsg>{err}</ErrMsg>}
      {photosError && <ErrMsg role="alert">{photosError}</ErrMsg>}
      {loading && photos.length === 0 && <EmptyMsg>Loading photos…</EmptyMsg>}
      {!loading && photos.length === 0 && <EmptyMsg>No photos yet. Upload the first memory!</EmptyMsg>}

      {photos.length > 0 && (
        <Grid>
          {photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              getUrl={mediaUrl}
              onSetCover={handleSetCover}
              onDelete={handleDelete}
              onSaveCaption={handleSaveCaption}
            />
          ))}
        </Grid>
      )}
    </div>
  );
}
