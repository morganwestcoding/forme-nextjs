'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Plus, User } from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  imageSrc: string | null;
}

interface EmployeeInput {
  userId: string;
  jobTitle?: string;
  serviceIds?: string[];
  user?: User; // For display purposes
}

interface Service {
  id: string;
  serviceName: string;
}

type EmployeeSelectorProps = {
  onEmployeesChange: (employees: EmployeeInput[]) => void;
  existingEmployees: EmployeeInput[];
  services?: Service[];
  id?: string;
};

const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  onEmployeesChange,
  existingEmployees,
  services = [],
  id,
}) => {
  const [employees, setEmployees] = useState<EmployeeInput[]>(existingEmployees ?? []);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    onEmployeesChange(employees);
  }, [employees, onEmployeesChange]);

  // Search users with debouncing
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/search/users?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        setSearchResults(data.users || []);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const addEmployee = (user: User) => {
    const isAlreadyAdded = employees.some(emp => emp.userId === user.id);
    if (!isAlreadyAdded) {
      const newEmployee: EmployeeInput = {
        userId: user.id,
        user,
        jobTitle: '',
        serviceIds: []
      };
      setEmployees(prev => [...prev, newEmployee]);
    }
    setSearchQuery('');
    setShowSearch(false);
  };

  const removeEmployee = (userId: string) => {
    setEmployees(prev => prev.filter(emp => emp.userId !== userId));
  };

  const updateEmployee = (userId: string, updates: Partial<EmployeeInput>) => {
    setEmployees(prev => prev.map(emp => 
      emp.userId === userId ? { ...emp, ...updates } : emp
    ));
  };

  const toggleService = (userId: string, serviceId: string) => {
    const employee = employees.find(emp => emp.userId === userId);
    if (!employee) return;

    const currentServices = employee.serviceIds || [];
    const newServices = currentServices.includes(serviceId)
      ? currentServices.filter(id => id !== serviceId)
      : [...currentServices, serviceId];

    updateEmployee(userId, { serviceIds: newServices });
  };

  return (
    <div id={id} className="flex flex-col gap-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-black">Employees</h3>
        <button
          type="button"
          onClick={() => setShowSearch(!showSearch)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} />
          Add Employee
        </button>
      </div>

      {/* Search Section */}
      {showSearch && (
        <div className="relative">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-300 rounded-lg outline-none transition focus:border-black text-black"
            />
          </div>

          {/* Search Results */}
          {searchQuery.length >= 2 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-gray-500">Searching...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => addEmployee(user)}
                    className="w-full p-3 text-left hover:bg-neutral-50 flex items-center gap-3 border-b last:border-b-0 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-neutral-200 overflow-hidden flex items-center justify-center">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || 'User'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={16} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-black">{user.name || 'Unnamed User'}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">No users found</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Current Employees */}
      <div className="space-y-4">
        {employees.map((employee, index) => (
          <div key={employee.userId} className="p-4 border border-neutral-300 rounded-lg bg-neutral-50">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden flex items-center justify-center">
                  {employee.user?.image ? (
                    <img
                      src={employee.user.image}
                      alt={employee.user.name || 'Employee'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={20} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-black">{employee.user?.name || 'Unnamed User'}</div>
                  <div className="text-sm text-gray-500">{employee.user?.email}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeEmployee(employee.userId)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Job Title Input */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  id={`employee-job-title-${index}`}
                  value={employee.jobTitle || ''}
                  onChange={(e) => updateEmployee(employee.userId, { jobTitle: e.target.value })}
                  placeholder=" "
                  className="peer w-full p-3 pt-6 bg-white border border-neutral-300 rounded-lg outline-none transition text-black focus:border-black"
                />
                <label
                  htmlFor={`employee-job-title-${index}`}
                  className="absolute text-sm duration-150 transform -translate-y-3 top-5 left-4 origin-[0] text-neutral-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4"
                >
                  Job Title (optional)
                </label>
              </div>
            </div>

            {/* Services */}
            {services.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Services this employee can provide:
                </label>
                <div className="flex flex-wrap gap-2">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleService(employee.userId, service.id)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        (employee.serviceIds || []).includes(service.id)
                          ? 'bg-black text-white'
                          : 'bg-neutral-200 text-gray-700 hover:bg-neutral-300'
                      }`}
                    >
                      {service.serviceName}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {employees.length === 0 && (
        <div className="text-center py-8 text-gray-500 bg-neutral-50 rounded-lg border border-neutral-300">
          No employees added yet. Click &ldquo;Add Employee&ldquo; to get started.
        </div>
      )}
    </div>
  );
};

export default EmployeeSelector;