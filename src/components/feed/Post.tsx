
import MoreVertIcon from '@mui/icons-material/MoreVert';

import React from 'react'

export default function Post() {
  return (
    <div className="w-full rounded-lg bg-white shadow-md my-6">
        <div className="p-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <img className="w-8 h-8 rounded-full object-cover" alt=""/>
                    <span className="text-sm font-medium mx-2">Username</span>
                    <span className="text-xs">post date</span>
                </div>
                <div>
                    <MoreVertIcon/>
                </div>
            </div>
            <div className="my-5">
                <span>post description</span>
                <img className="mt-5 w-full max-h-128 object-contain" alt=""/>Photo
            </div>
        
        </div>
    </div>
  )
}
