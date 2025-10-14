'use client';

import { useState, useEffect } from 'react';

interface ContainerProps {
    children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({
    children
}) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        const checkSidebarState = () => {
            const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
            setIsSidebarCollapsed(collapsed);
        };

        checkSidebarState();
        window.addEventListener('sidebarToggle', checkSidebarState);
        
        return () => {
            window.removeEventListener('sidebarToggle', checkSidebarState);
        };
    }, []);

    return (
        <div className={`
            max-w-[500px]
            md:max-w-[2520px]
            mx-auto
            transition-all duration-300 ease-in-out
            md:mt-8
            ${isSidebarCollapsed ? 'md:mx-24' : 'md:ml-24 md:mr-24'}
        `}>
            {children}
        </div>
    );
}

export default Container;