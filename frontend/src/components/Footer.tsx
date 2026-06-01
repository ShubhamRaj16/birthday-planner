import styled from 'styled-components';

const FooterWrapper = styled.footer`
  background-color: #f3f0ff;
  padding: 1.25rem;
  margin-top: auto;
  border-top: 1px solid #e0d7f7;
  text-align: center;
  color: #6b7280;
  font-size: 0.85rem;
`;

export default function Footer() {
  return (
    <FooterWrapper>
      <p>Birthday Planner &copy; 2026</p>
    </FooterWrapper>
  );
}
