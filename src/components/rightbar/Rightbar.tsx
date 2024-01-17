export default function Rightbar() {
    return (
      <div className="flex flex-col justify-end bg-transparent  gap-6 pr-28 h-auto mt-8">
        <div className="w-full md:w-11/12 h-32 rounded-lg shadow-md border bg-[#F9FCFF] bg-opacity-85 px-8 md:px-6 md:py-6 mx-4 md:mr-20 md:ml-12 relative">
          <div className="text-xl font-bold mb-2">Subscribe today
            <div className="text-sm font-normal">Subscribe to unlock new features and if eligible, receive a share of ad&apos;s revenue.</div>
          </div>
        </div>


        <div className="w-full md:w-11/12 flex flex-col justify-start rounded-lg shadow-md border bg-[#F9FCFF] bg-opacity-85 p-0 mx-0 overflow-hidden ml-12">
        <div className="px-6 py-4 text-xl font-bold -mb-2">What&apos;s Happening</div>
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex justify-between items-center hover:bg-white rounded w-full px-6 py-4">
              <div>
                <h3 className="text-base font-semibold">Article {index + 1}</h3>
                <p className="text-sm">Small description</p>
              </div>
              <div className="w-20 h-20 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  