'use client';

import { useSidebarState } from '@/app/hooks/useSidebarState';

interface ContainerProps {
    children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({
    children
}) => {
    const isSidebarCollapsed = useSidebarState();

    return (
        <div className={`
            w-full
            px-4 sm:px-6 lg:px-8 xl:px-12
            mx-auto
            transition-all duration-300 ease-in-out
            mt-4 sm:mt-6 lg:mt-8
            ${isSidebarCollapsed ? '' : ''}
        `}>
            {children}
        </div>
    );
}

export default Container;
