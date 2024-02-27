import React from 'react'
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';

function Attachment() {
  return (
    <div className="flex items-center p-2 px-4 rounded-2xl shadow-sm mr-2 bg-white">
    <div className="flex items-center justify-center bg-[#b7b7b7] rounded-2xl p-1 cursor-pointer drop-shadow-sm">
    <AttachFileRoundedIcon className="w-4 h-4 text-[#ffffff]" />
    </div>
</div>
  )
}

export default Attachment