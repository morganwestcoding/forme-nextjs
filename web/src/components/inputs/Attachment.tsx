import React, { useState } from 'react';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';

function Attachment() {
  const [isExtended, setIsExtended] = useState(false);

  // Toggle the isExtended state on click
  const handleExtensionToggle = () => {
    setIsExtended(!isExtended);
  };

  return (
    <div 
      className={`flex items-center p-3 px-3 rounded-full shadow-sm backdrop-blur-full cursor-pointer ${
        isExtended ? 'pl-[5rem]' : 'ml-3'
      }`}
      onClick={handleExtensionToggle} // Add click handler
    >
      <AttachFileOutlinedIcon height={21} width={21} className=" text-[#ffffff]" />
    </div>
  );
}

export default Attachment;
