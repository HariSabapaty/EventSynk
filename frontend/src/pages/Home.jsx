import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import HeroSection from '../components/HeroSection';
import FeaturedEvents from '../components/FeaturedEvents';
import PlatformFeatures from '../components/PlatformFeatures';
import CallToAction from '../components/CallToAction';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axiosInstance.get('/events')
      .then(res => {
        setEvents(res.data.events);
        setLoading(false);
      })
      .catch(() => {
        setEvents([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="home-page">
      <HeroSection />
      
      {/* Featured Events Section */}
      {!loading && events.length > 0 && (
        <FeaturedEvents events={events} />
      )}
      
      {/* Platform Features Section */}
      <PlatformFeatures />

      {/* Call to Action Section */}
      <CallToAction />
    </div>
  );
};

export default Home;
