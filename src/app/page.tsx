import React from 'react';

import Sidebar from '../components/sidebar/Sidebar'
import Rightbar from '../components/rightbar/Rightbar';
import Feed from '../components/feed/Feed';
import Tabs from '../components/tabs/Tabs';

export default function Home() {
  return (
    <>
    <Tabs/>
    <Sidebar/>
    <Feed/>
    <Rightbar/>
    </>
  )
};
