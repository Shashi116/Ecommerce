import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

const Shop = () => {
  return (
    <div className="page">
      <EmptyState
        title="Shop is now on Home"
        description="All products have moved to the home page for faster browsing."
        action={<Button to="/">Go to Home</Button>}
      />
    </div>
  );
};

export default Shop;
