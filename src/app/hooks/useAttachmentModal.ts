import { create } from 'zustand';

interface AttachmentModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useAttachmentModal = create<AttachmentModalStore>((set) => ({
    isOpen: false,
    onOpen: () => {
      console.log('Opening Attachment Modal');
      set({ isOpen: true });
    },
    onClose: () => {
      console.log('Closing Attachment Modal');
      set({ isOpen: false });
    }
}));

export default useAttachmentModal;
