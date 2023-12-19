import React from 'react';

import Sidebar from '../components/ui/sidebar/Sidebar'
import Rightbar from '../components/ui/rightbar/Rightbar';
import Feed from '../components/ui/feed/Feed';
import Tabs from '../components/ui/tabs/Tabs';

export default function Home() {
  return (
    <>
    <Tabs/>
    <div className="homeContainer">
    <Sidebar/>
    <Feed/>
    <Rightbar/>
    </div>
    </>
  )
};
