// components/modals/MobileUserModal.tsx
'use client';

import { SafeUser } from "@/app/types";
import Modal from "./Modal";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import useLoginModal from "@/app/hooks/useLoginModal";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import useRentModal from "@/app/hooks/useListingModal";
import useSubscribeModal from "@/app/hooks/useSubscribeModal";

interface MobileUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: SafeUser | null;
}

const MobileUserModal: React.FC<MobileUserModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const router = useRouter();
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();
  const rentModal = useRentModal();
  const subscribeModal = useSubscribeModal();

  const bodyContent = (
    <div className="flex flex-col gap-4">
      {currentUser ? (
        <>
          <div
            onClick={() => {
              router.push(`/profile/${currentUser.id}`);
              onClose();
            }}
            className="
              p-4
              text-black 
              hover:bg-gray-500 
              hover:bg-opacity-25 
              rounded-md 
              cursor-pointer 
              transition 
              duration-200
            "
          >
            Profile
          </div>

          <div
            onClick={() => {
              router.push('/properties');
              onClose();
            }}
            className="
              p-4
              text-black 
              hover:bg-gray-500 
              hover:bg-opacity-25 
              rounded-md 
              cursor-pointer 
              transition 
              duration-200
            "
          >
            My Listings
          </div>

          <div
            onClick={() => {
              router.push('/trips');
              onClose();
            }}
            className="
              p-4
              text-black 
              hover:bg-gray-500 
              hover:bg-opacity-25 
              rounded-md 
              cursor-pointer 
              transition 
              duration-200
            "
          >
            My Appointments
          </div>

          <div
            onClick={() => {
              rentModal.onOpen();
              onClose();
            }}
            className="
              p-4
              text-black 
              hover:bg-gray-500 
              hover:bg-opacity-25 
              rounded-md 
              cursor-pointer 
              transition 
              duration-200
            "
          >
            Add Listing
          </div>

          <div
            onClick={() => {
              subscribeModal.onOpen();
              onClose();
            }}
            className="
              p-4
              text-black 
              hover:bg-gray-500 
              hover:bg-opacity-25 
              rounded-md 
              cursor-pointer 
              transition 
              duration-200
            "
          >
            Subscription
          </div>

          <hr className="my-4 border-gray-500 border-opacity-25" />

          <div
            onClick={() => {
              signOut();
              onClose();
            }}
            className="
              p-4
              text-black 
              hover:bg-gray-500 
              hover:bg-opacity-25 
              rounded-md 
              cursor-pointer 
              transition 
              duration-200
            "
          >
            Sign Out
          </div>
        </>
      ) : (
        <>
          <div
            onClick={() => {
              loginModal.onOpen();
              onClose();
            }}
            className="
              p-4
              text-black 
              hover:bg-gray-500 
              hover:bg-opacity-25 
              rounded-md 
              cursor-pointer 
              transition 
              duration-200
            "
          >
            Login
          </div>

          <div
            onClick={() => {
              registerModal.onOpen();
              onClose();
            }}
            className="
              p-4
              text-black 
              hover:bg-gray-500 
              hover:bg-opacity-25 
              rounded-md 
              cursor-pointer 
              transition 
              duration-200
            "
          >
            Signup
          </div>
        </>
      )}
    </div>
  );
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => {}}  // Add this line
      title="Menu"
      body={bodyContent}
      actionLabel=""
      disabled={false}
    />
  );
}

export default MobileUserModal;