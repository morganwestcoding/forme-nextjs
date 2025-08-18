'use client';

import { useState } from 'react';
import Modal from '../modals/Modal';
import { categories } from '../Categories';
import CategoryInput from '../inputs/CategoryInput';

interface PostCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: string | null) => void;
}

const PostCategoryModal = ({
  isOpen,
  onClose,
  onSubmit
}: PostCategoryModalProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSubmit = () => {
    onSubmit(selectedCategory);
    onClose();
  };

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <div className="font-medium text-lg text-gray-900">
        Select a category for your post
      </div>
      <div className="text-neutral-500 text-sm mb-2">
        Choose a category that best fits your post, or skip to post without a category
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
        {categories.map((item) => (
          <div key={item.label} className="col-span-1">
            <CategoryInput
              onClick={(value) => setSelectedCategory(value)}
              selected={selectedCategory === item.label}
              label={item.label}
         
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Add a category"
      actionLabel="Continue"
      body={bodyContent}
      secondaryActionLabel="Skip category"
      secondaryAction={() => {
        setSelectedCategory(null);
        onSubmit(null);
        onClose();
      }}
    />
  );
};

export default PostCategoryModal;