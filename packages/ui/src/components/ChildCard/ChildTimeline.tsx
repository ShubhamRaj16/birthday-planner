import styled from 'styled-components';
import dayjs from 'dayjs';
import { mediaUrl } from '../../lib/media';
import { colors, spacing, radius } from '../../design/tokens';
import type { Child } from '../../types';

interface Props {
  childList: Child[];
}

const Section = styled.div`
  margin-top: 2rem;
`;
const Title = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${colors.text};
  margin-bottom: ${spacing.lg};
`;
const ChildGroup = styled.div`
  margin-bottom: 1.5rem;
`;
const ChildName = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${colors.primary};
  margin-bottom: ${spacing.sm};
`;
const Row = styled.div`
  display: flex;
  gap: ${spacing.md};
  flex-wrap: wrap;
`;

const TimelineCard = styled.div`
  border: 1px solid ${colors.borderLight};
  border-radius: ${radius.md};
  overflow: hidden;
  width: 140px;
  background: ${colors.white};
  flex-shrink: 0;
`;

const Thumb = styled.img`
  width: 140px;
  height: 100px;
  object-fit: cover;
  display: block;
  background: ${colors.bgLight};
`;
const ThumbPlaceholder = styled.div`
  width: 140px;
  height: 100px;
  background: ${colors.primaryLight};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const CardBody = styled.div`
  padding: 0.4rem 0.6rem;
`;
const Year = styled.p`
  font-size: 0.78rem;
  font-weight: 700;
  color: ${colors.textMuted};
  margin: 0;
`;
const Theme = styled.p`
  font-size: 0.72rem;
  color: ${colors.textSubtle};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const PhotoLink = styled.a`
  font-size: 0.72rem;
  color: ${colors.primary};
  font-weight: 600;
  text-decoration: none;
  display: block;
  margin-top: 2px;
  &:hover {
    text-decoration: underline;
  }
`;

export default function ChildTimeline({ childList }: Props) {
  const hasAnyEvents = childList.some((c) => (c.events || []).length > 0);
  if (!hasAnyEvents) return null;

  return (
    <Section>
      <Title>Memories — Year by Year</Title>
      {childList.map((child) => {
        const events = (child.events || []).filter((e) => e.status !== 'Draft');
        if (events.length === 0) return null;
        return (
          <ChildGroup key={child.id}>
            <ChildName>{child.name}</ChildName>
            <Row>
              {events.map((event) => {
                const coverPhoto = event.photos?.[0];
                const year = dayjs(event.date).format('YYYY');
                return (
                  <TimelineCard key={event.id}>
                    {coverPhoto ? (
                      <Thumb src={mediaUrl(coverPhoto.storagePath)} alt={event.theme || year} />
                    ) : (
                      <ThumbPlaceholder>🎂</ThumbPlaceholder>
                    )}
                    <CardBody>
                      <Year>{year}</Year>
                      <Theme>{event.theme || 'Birthday Party'}</Theme>
                      {event.googlePhotosUrl && (
                        <PhotoLink
                          href={event.googlePhotosUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Photos ↗
                        </PhotoLink>
                      )}
                    </CardBody>
                  </TimelineCard>
                );
              })}
            </Row>
          </ChildGroup>
        );
      })}
    </Section>
  );
}
