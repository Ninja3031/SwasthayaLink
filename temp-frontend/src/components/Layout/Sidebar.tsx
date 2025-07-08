import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Pill,
  Calendar,
  Activity,
  Heart,
  Bell,
  MessageCircle,
  Settings,
  User,
  ChevronLeft,
  Stethoscope,
  Users,
  ClipboardList,
  Scan,
  Share2,
  Zap,
} from 'lucide-react';
import { mockCurrentUser } from '../../data/mockData';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const patientNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Health Records', href: '/health-records', icon: FileText },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'Diabetes Care', href: '/diabetes-care', icon: Activity },
  { name: 'Medications', href: '/medications', icon: Pill },
  { name: 'OCR Reports', href: '/ocr-reports', icon: Scan },
  { name: 'UHI Integration', href: '/uhi-integration', icon: Share2 },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Messages', href: '/messages', icon: MessageCircle },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Profile', href: '/profile', icon: User },
];

const doctorNavigation = [
  { name: 'Dashboard', href: '/doctor', icon: LayoutDashboard },
  { name: 'Patient Records', href: '/doctor/patients', icon: Users },
  { name: 'Appointments', href: '/doctor/appointments', icon: Calendar },
  { name: 'Prescriptions', href: '/doctor/prescriptions', icon: ClipboardList },
  { name: 'Messages', href: '/doctor/messages', icon: MessageCircle },
  { name: 'Notifications', href: '/doctor/notifications', icon: Bell },
  { name: 'Settings', href: '/doctor/settings', icon: Settings },
  { name: 'Profile', href: '/doctor/profile', icon: User },
];

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const navigation = mockCurrentUser.userType === 'patient' ? patientNavigation : doctorNavigation;
  const isDoctor = mockCurrentUser.userType === 'doctor';

  return (
    <div
      className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      } flex flex-col h-full`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`${isDoctor ? 'bg-green-600' : 'bg-blue-600'} rounded-lg p-2`}>
              {isDoctor ? (
                <Stethoscope className="h-6 w-6 text-white" />
              ) : (
                <Zap className="h-6 w-6 text-white" />
              )}
            </div>
            {!isCollapsed && (
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-gray-900">SwasthiyaLink</h1>
                <p className="text-xs text-gray-500">
                  {isDoctor ? 'Doctor Portal' : 'Patient Portal'}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={onToggle}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft
              className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                isCollapsed ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? `${isDoctor ? 'bg-green-50 text-green-700 border-r-2 border-green-700' : 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'}`
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>SwasthiyaLink v2.0</p>
            <p className="mt-1">© 2024 All rights reserved</p>
          </div>
        </div>
      )}
    </div>
  );
};