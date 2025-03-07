'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import ClientProviders from '@/components/ClientProviders';
import Container from '@/components/Container';
import { SafeListing, SafeUser } from '@/app/types';
import ExploreSkeleton from '@/components/explore/ExploreSkeleton';
import TrendingStores from '@/components/explore/TrendingStores';
import TrendingUsers from '@/components/explore/TrendingUsers';
import EventsSection from '@/components/explore/EventsSection';
import ProductSkus from '@/components/explore/ProductSkus';
import ExploreHeader from '@/components/explore/ExploreHeader';

interface ExploreClientProps {
  initialListings: SafeListing[];
  currentUser: SafeUser | null;
}

const ExploreClient: React.FC<ExploreClientProps> = ({ 
  initialListings = [],
  currentUser
}) => {
  // Important: Use initialListings directly instead of setting state
  // This ensures the listings data is passed as-is without any transformation
  const [trendingUsers, setTrendingUsers] = useState<SafeUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    const fetchTrendingUsers = async () => {
      try {
        // Use your existing search API but add parameters for trending users
        const { data } = await axios.get('/api/search', {
          params: {
            type: 'users',
            sort: 'followers',
            limit: 12
          }
        });
        
        // Filter out any non-user results if your API returns mixed types
        const userResults = data.filter((result: any) => 'email' in result);
        setTrendingUsers(userResults);
      } catch (error) {
        console.error('Error fetching trending users:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrendingUsers();
  }, []);

  // Debug to see what listings data looks like
  console.log('ExploreClient initialListings:', initialListings);
  if (initialListings.length > 0) {
    console.log('First listing:', initialListings[0]);
  }

  // Sample events data (would normally come from API)
  const events = [
    {
      title: "Crush The Curve",
      description: "High-intensity fitness workshop",
      date: "Feb 15",
      time: "2:00 PM PST",
      location: "Anchorage, AK",
      imageSrc: "/assets/wellness.jpg",
      category: "Fitness",
      price: "$45"
    },
    {
      title: "Barber Battle",
      description: "Professional styling competition",
      date: "Feb 25",
      time: "3:00 PM CST",
      location: "Miami, FL",
      imageSrc: "/assets/barber.jpg",
      category: "Competition",
      price: "$85"
    },
    {
      title: "Wellness Retreat",
      description: "Full day of relaxation",
      date: "Mar 1",
      time: "9:00 AM HST",
      location: "Honolulu, HI", 
      imageSrc: "/assets/spa.jpg",
      category: "Wellness",
      price: "$120"
    },
    {
      title: "Haircut Showcase",
      description: "Latest trending styles",
      date: "Mar 10",
      time: "4:00 PM EST",
      location: "New York, NY", 
      imageSrc: "/assets/haircut.jpg",
      category: "Barber",
      price: "$35"
    }
  ];

  const productSkus = [
    {
      id: "sku1",
      title: "Premium Styling Gel",
      brand: "BarberPro",
      price: 24.99,
      imageSrc: "/assets/styling-gel.jpg",
      category: "Hair Products",
      vendorId: "vendor1",
      vendorName: "Smooth Cuts",
      rating: 4.8,
      inStock: true
    },
    {
      id: "sku2",
      title: "Massage Oil Set",
      brand: "Serenity",
      price: 39.99,
      imageSrc: "/assets/massage-oil.jpg",
      category: "Spa Essentials",
      vendorId: "vendor2",
      vendorName: "Koana Spa",
      rating: 4.7,
      inStock: true
    },
    {
      id: "sku3",
      title: "Fitness Resistance Bands",
      brand: "FlexPro",
      price: 29.99,
      imageSrc: "/assets/resistance-bands.jpg",
      category: "Fitness Equipment",
      vendorId: "vendor3",
      vendorName: "Master Trainer",
      rating: 4.9,
      inStock: true
    },
    {
      id: "sku4",
      title: "Barber Scissors",
      brand: "ProCut",
      price: 84.99,
      imageSrc: "/assets/scissors.jpg",
      category: "Barber Tools",
      vendorId: "vendor1",
      vendorName: "Cool Cat Cutz",
      rating: 5.0,
      inStock: false
    },
    {
      id: "sku5",
      title: "Aromatherapy Candles",
      brand: "ZenScents",
      price: 19.99,
      imageSrc: "/assets/candles.jpg",
      category: "Spa Essentials",
      vendorId: "vendor2",
      vendorName: "Koana Spa",
      rating: 4.6,
      inStock: true
    },
    {
      id: "sku6",
      title: "Yoga Mat Premium",
      brand: "OmFlex",
      price: 45.99,
      imageSrc: "/assets/yoga-mat.jpg",
      category: "Fitness Equipment",
      vendorId: "vendor3",
      vendorName: "Yoda Studio",
      rating: 4.8,
      inStock: true
    }
  ];

  if (isLoading) {
    return <ExploreSkeleton />;
  }

  return (
    <ClientProviders>
      <Container>
        <div className="py-6">
          <ExploreHeader activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <div className="mt-6 space-y-5">
                        {/* Product SKUs Section */}
                        <ProductSkus products={productSkus} />
            {/* Trending Stores Section - Pass initialListings directly */}
            <TrendingStores listings={initialListings} />
            

            
            {/* Events Section */}
            <EventsSection events={events} />
            
          </div>
        </div>
      </Container>
    </ClientProviders>
  );
};

export default ExploreClient;