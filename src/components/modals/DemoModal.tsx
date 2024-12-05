'use client';

import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import Modal from "./Modal";
import Heading from "../Heading";
import useDemoModal from "@/app/hooks/useDemoModal";
import useRentModal from "@/app/hooks/useRentModal";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const DemoModal = () => {
  const demoModal = useDemoModal();
  const rentModal = useRentModal();
  const [isLoading, setIsLoading] = useState(false);

  const handleListingDemo = useCallback(() => {
    demoModal.onClose();

    const driverObj = driver({
      showProgress: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.75)',
      allowClose: false,
      stagePadding: 10,
      popoverClass: 'backdrop-blur-md bg-black text-white border border-white',
      onDeselected: (element, step) => {
        if (element?.id === 'add-listing-button') {
          rentModal.onOpen();
          setTimeout(() => {
            const modalContent = document.querySelector('#rent-modal');
            if (modalContent) {
              driverObj.moveNext();
            }
          }, 500);
        }
      },
      steps: [
        {
          element: '#add-listing-button',
          popover: {
            title: 'Create A Listing',
            description: 'Start here to create your business listing. Click Next to continue.',
            side: "left",
            align: 'start'
          }
        },
        {
          element: '#rent-modal',
          popover: {
            title: 'Choose Category',
            description: 'Select the category that best fits your business type',
            side: "left"
          }
        },
        {
          element: '#rent-modal',
          popover: {
            title: 'Location',
            description: 'Enter your business location details to help customers find you',
            side: "left"
          }
        },
        {
          element: '#rent-modal',
          popover: {
            title: 'Services',
            description: 'Add all the services you offer along with their prices',
            side: "left"
          }
        },
        {
          element: '#rent-modal',
          popover: {
            title: 'Images',
            description: 'Upload your storefront photo and gallery images',
            side: "left"
          }
        },
        {
          element: '#rent-modal',
          popover: {
            title: 'Business Details',
            description: 'Add your business name, description and contact information',
            side: "left"
          }
        },
        {
          element: '#rent-modal',
          popover: {
            title: 'Business Hours',
            description: 'Set your operating hours for each day of the week',
            side: "left"
          }
        },
        {
          element: '#rent-modal',
          popover: {
            title: 'Employees',
            description: 'Add your team members who will be providing services',
            side: "left"
          }
        }
      ],
      onDestroyed: () => {
        rentModal.onClose();
      }
    });

    driverObj.drive();
    
  }, [demoModal, rentModal]);

  const hideDemo = useCallback(() => {
    localStorage.setItem('hideDemoButton', 'true');
    toast.success('Demo button hidden. You can restore it in settings.');
    demoModal.onClose();
  }, [demoModal]);

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Heading
        title="Available Demos"
        subtitle="Click on any demo to start the tutorial"
      />
      
      <div 
        onClick={handleListingDemo}
        className="
          p-4
          border
          rounded-lg
          hover:shadow-md
          transition
          cursor-pointer
          hover:border-[#78C3FB]
          bg-black
          bg-opacity-55
          backdrop-blur-md
        "
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-[#78C3FB] text-white">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor" 
              className="w-6 h-6"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M12 4.5v15m7.5-7.5h-15" 
              />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-white">Creating A Listing</h3>
            <p className="text-sm text-gray-300">
              Learn how to create and customize your business listing
            </p>
          </div>
        </div>
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
  );
}

export default DemoModal;