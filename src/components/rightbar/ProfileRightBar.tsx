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
        <div className="w-full md:w-11/12 h-32 rounded-lg shadow-md bg-[#ffffff] bg-opacity-80 px-8 md:px-6 md:py-6 mx-4 md:mr-20 md:ml-12 relative">
          <div className="text-xl font-bold mb-2">User Information
            <div className="text-sm font-normal">Subscribe to unlock new features and if eligible, receive a share of ad&apos;s revenue.</div>
          </div>
        </div>


        <div className="w-full md:w-11/12 flex flex-col justify-start rounded-lg shadow-md bg-[#ffffff] bg-opacity-80 p-0 mx-0 overflow-hidden ml-12 pb-6">
        <div className="px-6 py-6 text-xl font-bold">What&apos;s Happening</div>
        {articles.map((article, index) => (
          <div key={index} className="flex justify-between items-center hover:bg-[#ffffff] rounded w-full px-6 py-4">
            <div>
              <h3 className="text-base font-semibold">{article.title}</h3>
              <p className="text-sm">{article.description}</p>
            </div>
            <div className="w-20 h-20 bg-gray-300 rounded-md border-white border-2 drop-shadow flex-shrink-0" style={{ backgroundImage: `url(${article.imageSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
          </div>
        ))}
        </div>
      </div>
    );
  }
  