import Image from "next/image";

const articles = [
  {
    title: "Startup Challenges",
    description: "Key strategies to tackle startup obstacles.",
    imageSrc: "/assets/business-3.jpg", // Replace with your image path
  },
  {
    title: "Digital Age Marketing",
    description: "Exploring innovative digital marketing methods.",
    imageSrc: "/assets/business-4.jpg", // Replace with your image path
  },
  {
    title: "Sustainable Business",
    description: "Adopting sustainability for business success.",
    imageSrc:"/assets/business-1.jpg", // Replace with your image path
  },
  {
    title: "Social Entrepreneurship",
    description: "Entrepreneurs blending profit with social impact.",
    imageSrc: "/assets/business-2.jpg", // Replace with your image path
  },
  // ... more articles
];

export default function ProfileRightbar() {
    return (
      <div className="flex flex-col justify-end bg-transparent  gap-6 pr-28 h-auto mt-8">
         {/* Adjusted User Information Div to use Flex Grow to fill available space */}
         <div className="flex flex-col justify-between w-full md:w-11/12 rounded-lg shadow-md bg-[#ffffff] bg-opacity-90 px-8 md:px-6 md:py-6 mx-4 md:mr-20 md:ml-12 relative min-h-[128px]">
          <div className="text-xl font-bold mb-2">About Me
            <div className="text-sm font-normal flex-grow">
              <p className="py-2">
              Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.
              </p>
              <ul>
             {/* Adjusted list items to include flex layout for icon and text alignment */}
             <li className="flex items-center pb-1">
                <Image src="/icons/location-tick.svg" alt='notification-bell' width={21} height={21}/>
                <span className="ml-2">Your Location Here</span>
              </li>
              <li className="flex items-center">
                <Image src="/icons/calendar-tick.svg" alt='notification-bell' width={21} height={21}/>
                <span className="ml-2">Date Here</span>
              </li>
              </ul>
            </div>
          </div>
        </div>

{/* New Section: 3x3 Grid of Placeholder Images */}
<div className="w-full md:w-11/12 grid grid-cols-3 gap-0 mx-4 md:mr-20 md:ml-12 bg-transparent bg-opacity-80 rounded-lg shadow-md">
  {Array.from({ length: 9 }).map((_, index) => {
    // Determine the class for rounding specific corners based on the square's position
    let cornerClass = "";
    if (index === 0) cornerClass = "rounded-tl-lg"; // Top-left corner of the grid
    if (index === 2) cornerClass = "rounded-tr-lg"; // Top-right corner of the grid
    if (index === 6) cornerClass = "rounded-bl-lg"; // Bottom-left corner of the grid
    if (index === 8) cornerClass = "rounded-br-lg"; // Bottom-right corner of the grid

    const squareClasses = `w-full h-24 bg-white bg-opacity-80 ${cornerClass}`;
    return (
      <div key={index} className={squareClasses}>
      
      </div>
    );
  })}
</div>
      
{/* Storefront */}
<div className="w-full md:w-11/12 flex flex-col justify-start rounded-lg shadow-md bg-[#ffffff] bg-opacity-80 p-0 mx-0 overflow-hidden ml-12 pb-6">
  <div className="px-6 py-6 text-xl font-bold">Morgan's Storefronts</div>
  <div className="grid grid-cols-4 gap-4 p-4">
    {articles.slice(0, 16).map((article, index) => (
      <div key={index} className="w-20 h-20 bg-gray-300 rounded-md border-white border-2 drop-shadow flex-shrink-0" style={{ backgroundImage: `url(${article.imageSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        {/* You can add overlays or text here if needed */}
      </div>
    ))}
  </div>
</div>
         
      </div>

      
    );
  }
  