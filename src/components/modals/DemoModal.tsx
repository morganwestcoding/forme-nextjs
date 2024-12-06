// DemoModal.tsx

'use client';

import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import Modal from "./Modal";
import Heading from "../Heading";
import useDemoModal from "@/app/hooks/useDemoModal";
import useRentModal from "@/app/hooks/useRentModal";
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

const DemoModal = () => {
  const demoModal = useDemoModal();
  const rentModal = useRentModal();
  const [isLoading, setIsLoading] = useState(false);
  const [runTour, setRunTour] = useState(false);

  const steps: Step[] = [
    {
      target: '#add-listing-button',
      content: 'Start here to create your business listing',
      placement: 'left',
      disableBeacon: true
    },
    {
      target: '#modal-content-with-actions-wrapper',
      content: 'Select a category that best describes your business',
      placement: 'left'
    },
    {
      target: '#modal-content-with-actions-wrapper',
      content: 'Enter your business location details',
      placement: 'left'
    },
    {
      target: '#modal-content-with-actions-wrapper',
      content: 'Add services you offer and their prices',
      placement: 'left'
    },
    {
      target: '#modal-content-with-actions-wrapper',
      content: 'Set your operating hours for each day',
      placement: 'left'
    },
    {
      target: '#modal-content-with-actions-wrapper',
      content: 'Add your business details and description',
      placement: 'left'
    },
    {
      target: '#modal-content-with-actions-wrapper',
      content: 'Add your team members',
      placement: 'left'
    }
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, type } = data;
  
    if (index === 0 && type === 'step:after') {
      rentModal.onOpen();
    }
  
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false);
    }
  };

  const handleListingDemo = useCallback(() => {
    demoModal.onClose();
    setRunTour(true);
  }, [demoModal]);

  const hideDemo = useCallback(() => {
    localStorage.setItem('hideDemoButton', 'true');
    toast.success('Demo button hidden. You can restore it in settings.');
    demoModal.onClose();
  }, [demoModal]);

  const demoOptions = [
    {
      title: "Creating A Listing",
      description: "Learn how to create and customize your business listing step by step",
      icon: (
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M12 4.5v15m7.5-7.5h-15" 
        />
      ),
      onClick: handleListingDemo
    },
    {
      title: "Using Posts",
      description: "Discover how to create engaging posts and interact with your community",
      icon: (
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" 
        />
      ),
      onClick: () => console.log("Posts demo")
    },
    {
      title: "Profile Management",
      description: "Learn to customize your profile and manage your personal settings",
      icon: (
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" 
        />
      ),
      onClick: () => console.log("Profile demo")
    },
    {
      title: "Finding Services",
      description: "Explore how to search, filter, and find the perfect services for you",
      icon: (
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" 
        />
      ),
      onClick: () => console.log("Listings demo")
    },
    {
      title: "Managing Reservations",
      description: "Master the booking system - from making reservations to managing your schedule",
      icon: (
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" 
        />
      ),
      onClick: () => console.log("Reservations demo")
    },
    {
      title: "Premium Features",
      description: "Explore the benefits of subscribing and unlock premium features",
      icon: (
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" 
        />
      ),
      onClick: () => console.log("Subscription demo")
    }
  ];

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Heading
        title="Available Demos"
        subtitle="Click on any demo to start the tutorial"
      />
      
      <div className="grid grid-cols-1 gap-4 max-h-[360px] overflow-y-auto pr-2">
        {demoOptions.map((demo, index) => (
          <div 
            key={index}
            onClick={demo.onClick}
            className="
              p-3.5
              border
              rounded-lg
              hover:shadow-md
              transition
              cursor-pointer
              hover:border-[#78C3FB]
              bg-black
              bg-opacity-55
              backdrop-blur-md
              min-h-[90px]
            "
          >
            <div className="flex items-center gap-3">
              <div className="
                p-2 
                rounded-full 
                bg-[#78C3FB] 
                text-white
                flex 
                items-center 
                justify-center
                w-10 
                h-10
              ">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={1.5} 
                  stroke="currentColor" 
                  className="w-5 h-5"
                >
                  {demo.icon}
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">{demo.title}</h3>
                <p className="text-sm text-gray-300">
                  {demo.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const footerContent = (
    <div className="flex flex-col gap-4 mt-3">
      <hr className="border-white/20"/>
      <div className="
        text-gray-300
        text-center 
        mt-4 
        font-light
        text-sm
      ">
        You can restore hidden demos in your account settings
      </div>
    </div>
  );

  return (
    <>
      <Joyride
        steps={steps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        hideCloseButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            arrowColor: '#1a1a1a',
            backgroundColor: '#1a1a1a',
            overlayColor: 'rgba(0, 0, 0, 0.85)',
            primaryColor: '#78C3FB',
            textColor: '#fff',
            width: 300,
            zIndex: 1000,
          }
        }}
      />
      <Modal
        disabled={isLoading}
        isOpen={demoModal.isOpen}
        title="Demo Directory"
        actionLabel="Exit"
        secondaryActionLabel="Hide Demos"
        onClose={demoModal.onClose}
        onSubmit={demoModal.onClose}
        secondaryAction={hideDemo}
        body={bodyContent}
        footer={footerContent}
      />
    </>
  );
}

export default DemoModal;