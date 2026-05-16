import Home from '../views/Home';

export default function Page({ searchParams }) {
  return <Home searchQuery={searchParams?.q || ''} />;
}
