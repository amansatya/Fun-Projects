import { Link } from 'react-router';
import { buttonStyles } from '../components/Button';
import { PageHeading } from '../components/PageHeading';

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-sm space-y-4 text-center">
      <PageHeading title="Page not found" subtitle="That column doesn't exist. Try another one." />
      <Link to="/" className={buttonStyles('primary')}>
        Back to the menu
      </Link>
    </div>
  );
}
