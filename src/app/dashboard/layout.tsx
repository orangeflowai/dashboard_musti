import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import DashboardHeader from '@/components/DashboardHeader';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Handle auth check outside try/catch to avoid JSX in catch block
  let user;
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error('Auth error:', error);
      redirect('/login');
    }

    if (!authUser) {
      redirect('/login');
    }

    user = authUser;
  } catch (error) {
    console.error('Dashboard layout error:', error);
    redirect('/login');
  }

  // JSX is now outside try/catch block
  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: '📊' },
    { href: '/dashboard/restaurants', label: 'Restaurants', icon: '🍽️' },
    { href: '/dashboard/products', label: 'Products', icon: '🍕' },
    { href: '/dashboard/categories', label: 'Categories', icon: '📁' },
    { href: '/dashboard/events', label: 'Events', icon: '🎉' },
    { href: '/dashboard/party-requests', label: 'Party Requests', icon: '🎊' },
    { href: '/dashboard/addons', label: 'Addons', icon: '➕' },
    { href: '/dashboard/offers', label: 'Special Offers', icon: '🎁' },
    { href: '/dashboard/riders', label: 'Riders', icon: '🏍️' },
    { href: '/dashboard/customers', label: 'Customers', icon: '👥' },
    { href: '/dashboard/orders', label: 'Orders', icon: '📦' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFAEC' }}>
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-medium" style={{ color: '#111111' }}>Food Delivery Admin</h1>
            </div>
            <DashboardHeader userEmail={user?.email || ''} />
          </div>
        </div>
      </nav>
      <div className="flex max-w-7xl mx-auto">
        <aside className="w-64 bg-white shadow-sm min-h-screen border-r">
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    style={{ color: '#111111' }}
                  >
                    <span>{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

