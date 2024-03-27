import React from 'react'
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';

function Attachment() {
  return (
    <div className="flex items-center p-2 px-2 rounded-full shadow mr-2 bg-[#dfdede] ">
    <div className="flex items-center justify-center  rounded-2xl p-1  cursor-pointer drop-shadow-sm">
    <AttachFileRoundedIcon className="w-4 h-4 text-[#ffffff]" />
    </div>
</div>
  )
}

export default Attachment