import React from 'react';

const PlatformFeatures = () => {
  const features = [
    {
      id: 1,
      icon: (
        <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          <circle cx="12" cy="12" r="10" strokeWidth={2} />
        </svg>
      ),
      title: 'Create Events Easily',
      description: 'Organize college events in minutes with customizable forms and registration fields.'
    },
    {
      id: 2,
      icon: (
        <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: 'Discover Opportunities',
      description: 'Explore hackathons, workshops, competitions, and cultural events happening on campus.'
    },
    {
      id: 3,
      icon: (
        <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      title: 'Track and Win',
      description: 'View your participation history, achievements, and keep track of all your event registrations.'
    },
    {
      id: 4,
      icon: (
        <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      title: 'Stay Notified',
      description: 'Get instant updates on registrations, deadlines, and important event announcements.'
    }
  ];

  return (
    <section className="platform-features-section">
      <div className="platform-features-container">
        <div className="platform-features-header">
          <h2 className="platform-features-title">
            Why Use EventSynk?
          </h2>
          <p className="platform-features-subtitle">
            Everything you need to manage and participate in college events
          </p>
        </div>

        <div className="platform-features-grid">
          {features.map((feature, index) => (
            <div 
              key={feature.id} 
              className="platform-feature-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="platform-feature-icon">
                {feature.icon}
              </div>
              <h3 className="platform-feature-title">
                {feature.title}
              </h3>
              <p className="platform-feature-description">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformFeatures;
