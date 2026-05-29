import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #fafafa;
`;

const Main = styled.main`
  flex: 1;
  padding: 1.5rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
`;

export default function App({ routes }) {
  return (
    <AppWrapper>
      <Header />
      <Main>
        <ErrorBoundary>
          <Routes>
            {routes.map(({ path, element: Page }) => (
              <Route key={path} path={path} element={<Page />} />
            ))}
          </Routes>
        </ErrorBoundary>
      </Main>
      <Footer />
    </AppWrapper>
  );
}
