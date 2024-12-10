'use client';

interface ContainerProps {
    children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({
    children
}) => {
    return (
        <div className="
        max-w-[2520px]
        mx-auto
        px-4
        sm:px-6
        md:px-24
        ">
            {children}
        </div>
    );
}

export default Container;