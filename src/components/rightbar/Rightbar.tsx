export default function Rightbar() {
  return (
      <div className="flex justify-end bg-transparent pt-8">
          <div className="w-11/12 h-full rounded-lg shadow-md border  bg-[#F9FCFF] bg-opacity-85 p-10 space-y-10 mr-20 ml-14">
              {/* Articles Section */}
              <div>
                  <h2 className="text-base font-semibold mb-4">Articles</h2>
                  <div className="grid grid-cols-2 gap-4">
                      {[1, 2].map((article) => (
                          <div key={article} className="flex items-center">
                              <img 
                                  src="https://via.placeholder.com/150" 
                                  alt="Article" 
                                  className="w-20 h-20 mr-4 object-cover rounded-lg"
                              />
                              <div>
                                  <h3 className="font-semibold text-sm">Article Title {article}</h3>
                                  <p className="text-sm text-gray-600">Brief description of the article...</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Trending Topics Section */}
              <div>
                  <h2 className="text-base font-semibold mb-4">Trending Topics</h2>
                  <ul className="grid grid-cols-2 gap-4">
                      {['Topic 1', 'Topic 2', 'Topic 3'].map((topic) => (
                          <li key={topic} className="text-sm text-gray-600">{topic}</li>
                      ))}
                  </ul>
              </div>

              {/* Who to Follow Section */}
              <div>
                  <h2 className="text-base font-semibold mb-4">Who to Follow</h2>
                  <div className="grid grid-cols-2 gap-4">
                      {[1, 2, 3].map((user) => (
                          <div key={user} className="flex items-center">
                              <img 
                                  src="https://via.placeholder.com/50" 
                                  alt="User" 
                                  className="w-12 h-12 mr-4 object-cover rounded-full"
                              />
                              <div>
                                  <h3 className="font-semibold">User Name {user}</h3>
                                  <p className="text-sm text-gray-600">User description...</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
  );
}
