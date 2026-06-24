import MenuPage from './pages/MenuPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

function App() {
  const path = window.location.pathname || '/';

  if (path.startsWith('/menu/')) {
    return <MenuPage />;
  }

  return <NotFoundPage message="Please open a shop menu URL like /menu/cafe-99" />;
}

export default App;
