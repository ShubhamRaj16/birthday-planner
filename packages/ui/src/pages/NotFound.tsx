import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Container = styled.div`
  max-width: 720px;
  margin: 0 auto;
  padding: 4rem 2rem;
  text-align: center;
`;

const Title = styled.h1`
  color: #333;
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const Description = styled.p`
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const HomeLink = styled(Link)`
  color: #fff;
  background: #7c3aed;
  border-radius: 6px;
  display: inline-block;
  font-weight: 600;
  padding: 0.75rem 1.25rem;
  text-decoration: none;

  &:hover {
    background: #6d28d9;
  }
`;

export default function NotFound() {
  return (
    <Container>
      <Title>404 — Page Not Found</Title>
      <Description>The page you are looking for does not exist.</Description>
      <HomeLink to="/">Go to Dashboard</HomeLink>
    </Container>
  );
}
