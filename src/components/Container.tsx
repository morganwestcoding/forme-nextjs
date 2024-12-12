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
        px-4
        sm:px-8
        md:px-24
        ">
            {children}
        </div>
    );
}

export default Container;