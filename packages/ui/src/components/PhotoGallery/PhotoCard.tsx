import { useState } from 'react';
import styled from 'styled-components';
import { colors, radius } from '../../design/tokens';

interface Photo {
  id: number;
  storagePath: string;
  caption?: string | null;
  isCover: boolean;
}

interface Props {
  photo: Photo;
  getUrl: (path: string) => string;
  onSetCover: (id: number) => void;
  onDelete: (id: number) => void;
  onSaveCaption: (id: number, caption: string) => void;
}

const Card = styled.div<{ $isCover: boolean }>`
  border: 2px solid ${({ $isCover }) => ($isCover ? colors.primary : colors.borderLight)};
  border-radius: ${radius.md};
  overflow: hidden;
  position: relative;
  background: ${colors.bgLightest};
`;

const Img = styled.img`
  width: 100%;
  height: 130px;
  object-fit: cover;
  display: block;
`;

const Footer = styled.div`
  padding: 0.5rem;
`;

const Caption = styled.p`
  font-size: 0.78rem;
  color: ${colors.textSubtle};
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
  border: 1px solid ${({ $variant }) => ($variant === 'danger' ? '#fca5a5' : colors.border)};
  background: ${({ $variant }) => ($variant === 'danger' ? '#fef2f2' : colors.bgLightest)};
  color: ${({ $variant }) => ($variant === 'danger' ? '#dc2626' : colors.textMuted)};
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background: ${({ $variant }) => ($variant === 'danger' ? colors.errorBg : colors.bgLight)};
  }
`;

const CoverBadge = styled.span`
  position: absolute;
  top: 6px;
  left: 6px;
  background: ${colors.primary};
  color: ${colors.white};
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: ${radius.full};
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

export default function PhotoCard({ photo, getUrl, onSetCover, onDelete, onSaveCaption }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(photo.caption || '');

  function handleSave() {
    onSaveCaption(photo.id, draft);
    setEditing(false);
  }

  return (
    <Card $isCover={photo.isCover}>
      {photo.isCover && <CoverBadge>Cover</CoverBadge>}
      <Img src={getUrl(photo.storagePath)} alt={photo.caption || 'Party photo'} />
      <Footer>
        {editing ? (
          <>
            <CaptionInput
              autoFocus
              placeholder="Caption"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <ActionRow>
              <SmallBtn onClick={handleSave}>Save</SmallBtn>
              <SmallBtn onClick={() => setEditing(false)}>Cancel</SmallBtn>
            </ActionRow>
          </>
        ) : (
          <>
            {photo.caption && <Caption>{photo.caption}</Caption>}
            <ActionRow>
              {!photo.isCover && (
                <SmallBtn onClick={() => onSetCover(photo.id)}>Set Cover</SmallBtn>
              )}
              <SmallBtn
                onClick={() => {
                  setDraft(photo.caption || '');
                  setEditing(true);
                }}
              >
                {photo.caption ? 'Edit' : '+ Caption'}
              </SmallBtn>
              <SmallBtn $variant="danger" onClick={() => onDelete(photo.id)}>
                Delete
              </SmallBtn>
            </ActionRow>
          </>
        )}
      </Footer>
    </Card>
  );
}
