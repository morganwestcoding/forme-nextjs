'use client';

import { useRouter } from 'next/navigation';

interface Event {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageSrc: string;
  category: string;
  price: string;
}

interface EventsSectionProps {
  events: Event[];
}

const EventsSection: React.FC<EventsSectionProps> = ({
  events = []
}) => {
  const router = useRouter();
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Upcoming Events</h2>
        <button 
          className="text-sm text-gray-500 hover:text-[#F08080] transition-colors"
          onClick={() => router.push('/events')}
        >
          View all
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {events.map((event, index) => (
          <div 
            key={index}
            onClick={() => router.push(`/events/${index}`)}
            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100"
          >
            <div 
              className="relative h-32 w-full"
              style={{ 
                backgroundImage: `url(${event.imageSrc})`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-3 left-3 text-white">
                <p className="text-xs opacity-80">{event.date} • {event.time}</p>
                <h3 className="font-semibold">{event.title}</h3>
              </div>
              <div className="absolute top-3 right-3 bg-white/90 text-xs font-medium py-0.5 px-2 rounded-full">
                {event.category}
              </div>
            </div>
            
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">{event.location}</p>
                <p className="text-sm font-semibold">{event.price}</p>
              </div>
              <p className="text-sm text-gray-700 line-clamp-2">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsSection;