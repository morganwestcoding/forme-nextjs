'use client';

import Modal from "./Modal";
import ListingHead from "../listings/ListingHead";
import { SafeListing, SafeUser } from "@/app/types";
import useListingDetailsModal from "@/app/hooks/useListingDetailsModal";
import { useCallback } from "react";

const ListingDetailsModal = () => {
  const listingDetailsModal = useListingDetailsModal();
  
  const onSubmit = useCallback(() => {
    listingDetailsModal.onClose();
  }, [listingDetailsModal]);

  const bodyContent = (
    <div className="flex flex-col">
      {listingDetailsModal.listing && (
        <ListingHead
          listing={listingDetailsModal.listing}
          currentUser={null} // You'll need to pass currentUser here
        />
      )}
    </div>
  );

  return (
    <Modal
      id="listing-details-modal"
      modalContentId="listing-details-content"
      isOpen={listingDetailsModal.isOpen}
      onClose={listingDetailsModal.onClose}
      onSubmit={onSubmit}
      title={listingDetailsModal.listing?.title || "Listing Details"}
      body={bodyContent}
      actionLabel="Book Appointment"
      className="w-full md:w-[950px]"
    />
  );
};

export default ListingDetailsModal;