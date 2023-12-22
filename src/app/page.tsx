import React from 'react';
import Sidebar from '../components/sidebar/Sidebar'
import Rightbar from '../components/rightbar/Rightbar';
import Feed from '../components/feed/Feed';

export default function Home() {
  return (
    <div className="flex w-full">
    <div className="flex-none w-[25%]">
    <Sidebar  /> {/* Adjust width as needed */}
    </div>
    <div className="flex-none w-[45%]"> {/* Will grow more than Rightbar */}
    <Feed />
    </div>
    <div className="flex-grow w-[30%]" >
    <Rightbar />
    </div> {/* Will grow less than Feed */} 
    </div>
  )
};
