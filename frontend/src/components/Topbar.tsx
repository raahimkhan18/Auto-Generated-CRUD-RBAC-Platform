import { useState } from "react";
import { User, Shield, Eye, UserCog, Crown, ChevronDown } from "lucide-react";

interface Props {
  currentRole: string;
  onRoleChange: (role: string) => void;
}

const roleIcons = {
  Admin: Crown,
  Manager: UserCog,
  Viewer: Eye,
  Owner: User,
};

const roleColors = {
  Admin: "bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200",
  Manager: "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200",
  Viewer: "bg-green-100 text-green-700 border-green-300 hover:bg-green-200",
  Owner: "bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200",
};

const roleDescriptions = {
  Admin: "Full access to everything",
  Manager: "Can create, read, update (no delete)",
  Viewer: "Read-only access",
  Owner: "Can manage own records only",
};

const allRoles = ["Admin", "Manager", "Viewer", "Owner"];

export default function Topbar({ currentRole, onRoleChange }: Props) {
  const [showDropdown, setShowDropdown] = useState(false);
  const Icon = roleIcons[currentRole as keyof typeof roleIcons] || Shield;
  const colorClass = roleColors[currentRole as keyof typeof roleColors] || "";

  return (
    <header className="bg-white shadow-md py-3 px-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-indigo-600">
          Admin Control Panel
        </h1>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">Testing as:</span>
          </div>

          {/* Interactive Role Badge with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg border-2 transition-all cursor-pointer ${colorClass}`}
            >
              <Icon className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold text-sm">{currentRole}</div>
                <div className="text-xs opacity-75">
                  {roleDescriptions[currentRole as keyof typeof roleDescriptions]}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                {/* Backdrop to close dropdown */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowDropdown(false)}
                />
                
                {/* Dropdown Content */}
                <div className="absolute right-0 mt-2 w-72 bg-white border-2 border-gray-200 rounded-lg shadow-xl z-20">
                  <div className="p-2">
                    <div className="text-xs font-semibold text-gray-500 px-3 py-2">
                      Switch Role
                    </div>
                    {allRoles.map((role) => {
                      const RoleIcon = roleIcons[role as keyof typeof roleIcons];
                      const isActive = role === currentRole;
                      
                      return (
                        <button
                          key={role}
                          onClick={() => {
                            onRoleChange(role);
                            setShowDropdown(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                            isActive 
                              ? roleColors[role as keyof typeof roleColors]
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <RoleIcon className="w-5 h-5" />
                          <div className="text-left flex-1">
                            <div className="font-semibold text-sm">{role}</div>
                            <div className="text-xs opacity-75">
                              {roleDescriptions[role as keyof typeof roleDescriptions]}
                            </div>
                          </div>
                          {isActive && (
                            <span className="text-xs font-bold">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}