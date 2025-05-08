'use client';

interface ContainerProps {
    children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({
    children
}) => {
    return (
        <div className="
        
        max-w-[500px]
        md:max-w-[2520px]
        mx-auto
        md:mx-24
        md:mt-8
        ">
            {children}
        </div>
    );
}

export default Container;