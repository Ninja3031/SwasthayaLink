import React from 'react';
import { Card, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import {
  Bell,
  Pill,
  Calendar,
  FileText,
  Settings,
  Check,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { useNotifications, type Notification } from '../hooks/useNotifications';

export const Notifications: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    getNotificationsByType
  } = useNotifications();

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'medication':
        return <Pill className="h-5 w-5 text-purple-600" />;
      case 'appointment':
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'report':
        return <FileText className="h-5 w-5 text-green-600" />;
      case 'prescription':
        return <FileText className="h-5 w-5 text-orange-600" />;
      case 'general':
        return <Bell className="h-5 w-5 text-gray-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'medication':
        return 'bg-purple-100';
      case 'appointment':
        return 'bg-blue-100';
      case 'report':
        return 'bg-green-100';
      case 'prescription':
        return 'bg-orange-100';
      case 'general':
        return 'bg-gray-100';
      default:
        return 'bg-gray-100';
    }
  };

  // Filter notifications by date
  const todayNotifications = notifications.filter(notif => {
    const today = new Date().toDateString();
    const notifDate = new Date(notif.createdAt).toDateString();
    return today === notifDate;
  });

  const earlierNotifications = notifications.filter(notif => {
    const today = new Date().toDateString();
    const notifDate = new Date(notif.createdAt).toDateString();
    return today !== notifDate;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated with your health alerts and reminders</p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={markAllAsRead}
            variant="outline"
            icon={Check}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Error loading notifications: {error}</span>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Notifications</p>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-blue-600">{notifications.length}</p>
                )}
              </div>
              <Bell className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today</p>
                <p className="text-2xl font-bold text-green-600">{todayNotifications.length}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Medication Alerts</p>
                <p className="text-2xl font-bold text-purple-600">
                  {notifications.filter(n => n.type === 'medication').length}
                </p>
              </div>
              <Pill className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading notifications...</span>
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-600">You'll see your health alerts and reminders here.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Today's Notifications */}
          {todayNotifications.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Today</h2>
              <div className="space-y-3">
            {todayNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`hover:shadow-md transition-shadow ${
                  !notification.read ? 'ring-2 ring-blue-200' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark as Read
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Earlier Notifications */}
      {earlierNotifications.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Earlier</h2>
          <div className="space-y-3">
            {earlierNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`hover:shadow-md transition-shadow ${
                  !notification.read ? 'ring-2 ring-blue-200' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark as Read
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          </div>
        )}
        </>
      )}
    </div>
  );
};