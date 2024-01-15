export default function Rightbar() {
  return (
      <div className="flex justify-end bg-transparent pt-8">
          <div className="w-full md:w-11/12 h-full rounded-lg shadow-md border bg-[#F9FCFF] bg-opacity-85 p-4 md:p-10 space-y-6 md:space-y-10 mx-4 md:mr-20 md:ml-14">
              {/* Articles Section */}
              <div>
                  <h2 className="text-sm md:text-base font-semibold mb-4">Articles</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 ">
                      {[1, 2, 3].map((article) => (
                          <div key={article} className="flex items-center ">
                              <div
                                  
                                  className="w-66 h-66 md:w-24 md:h-24 mr-4 object-cover rounded-lg bg-gray-300"
                              />
                           
                          </div>
                      ))}
                  </div>
              </div>

              {/* Trending Topics Section */}
              <div>
                  <h2 className="text-sm md:text-base font-semibold mb-4">Trending Topics</h2>
                  <ul className="grid grid-cols-1 md:grid-cols-3 gap-1">
                      {['Topic 1', 'Topic 2', 'Topic 3'].map((topic) => (
                          <li key={topic} className="text-xs md:text-sm text-gray-600 border rounded-lg inline-block px-2 mx-auto my-1 ml-1">{topic}</li>
                      ))}
                  </ul>
              </div>

              {/* Who to Follow Section */}
              <div>
                  <h2 className="text-sm md:text-base font-semibold mb-4">Who to Follow</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[1, 2, 3].map((user) => (
                          <div key={user} className="flex items-center">
                              <div
                                  
                                  
                                  className="w-20 bg-gray-300 h-20 md:w-16 md:h-16 mr-4 object-cover rounded-full"
                              />
                              <div>
                                  <h3 className="font-semibold text-xs md:text-sm">{user}</h3>
                                 {/* <p className="text-xs md:text-sm text-gray-600">User description...</p>*/}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
  );
}
