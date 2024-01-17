
import React from 'react';
import Rightbar from '../components/rightbar/Rightbar';
import Share from '@/components/feed/Share';
import ClientProviders from '@/components/ClientProviders';
import EmptyState from '@/components/EmptyState';
import getCurrentUser from './actions/getCurrentUser';
import Post from '@/components/feed/Post';


export default async function Home() {
  const isEmpty = true;
  const currentUser = await getCurrentUser(); // Fetch currentUser

  
  
  return (
    <ClientProviders>
    <div className="flex w-full">
    <div className="flex-none w-[50%] ml-20 mt-8"> {/* Will grow more than Rightbar */}
    <Share currentUser={currentUser} /> {/* Pass currentUser to Share */}
    <Post currentUser={currentUser}/>
    </div>
    <div className="flex-grow w-[45%] ml-4" >
    <Rightbar/> {/*currentUser={currentUser} */}
    </div> {/* Will grow less than Feed */} 
    </div>
    </ClientProviders>
  )
};


