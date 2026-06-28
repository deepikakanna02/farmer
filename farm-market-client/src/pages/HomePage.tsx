import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function HomePage() {
  const { user } = useAuth();

  const cards = [
    {
      label: 'Navigation',
      title: 'Dashboard',
      desc: 'View your ads, offers, and role-specific actions.',
      to: '/dashboard',
      roles: ['farmer', 'buyer', 'representative'],
    },
    {
      label: 'Farmers',
      title: 'Post New Ad',
      desc: 'List your latest crop with price, quantity, and location.',
      to: '/create-ad',
      roles: ['farmer'],
    },
    {
      label: 'Farmers',
      title: 'My Offers',
      desc: 'Review and respond to buyer offers on your listings.',
      to: '/my-offers',
      roles: ['farmer'],
    },
    {
      label: 'Recruitment',
      title: 'Job Board',
      desc: 'Browse available agricultural jobs and apply directly.',
      to: '/jobs',
      roles: ['farmer', 'buyer', 'representative'],
    },
    {
      label: 'Communication',
      title: 'Messages',
      desc: 'View your conversations with other platform users.',
      to: '/dashboard',
      roles: ['farmer', 'buyer', 'representative'],
    },
  ].filter((c) => user && c.roles.includes(user.role));

  return (
    <div className="home-page">
      <div className="home-welcome">
        <h1>
          Welcome back, {user?.name || 'there'}
          <span className="role-badge">{user?.role}</span>
        </h1>
        <p>Here is a quick overview of what you can do today.</p>
      </div>

      <div className="dashboard-grid">
        {cards.map((card) => (
          <Link to={card.to} className="dashboard-card" key={card.title}>
            <div className="dashboard-card-label">{card.label}</div>
            <h2>{card.title}</h2>
            <p>{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
