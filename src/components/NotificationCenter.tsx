'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface NotificationItem {
  id: string;
  type: 'achievement' | 'milestone' | 'system' | 'referral';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationCenterProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  className?: string;
}

const typeIcons = {
  achievement: '🏆',
  milestone: '🎯',
  system: 'ℹ️',
  referral: '👥',
};

const typeColors = {
  achievement: 'bg-yellow-500/20 text-yellow-400',
  milestone: 'bg-purple-500/20 text-purple-400',
  system: 'bg-blue-500/20 text-blue-400',
  referral: 'bg-green-500/20 text-green-400',
};

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  className = '',
}: NotificationCenterProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            🔔 Notifications
            {unreadCount > 0 && (
              <Badge variant="default">{unreadCount} new</Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              Mark all as read
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No notifications yet
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface NotificationItemProps {
  notification: NotificationItem;
  onMarkAsRead: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div
      className={`flex gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
        notification.read ? 'bg-gray-800/30' : 'bg-gray-800 hover:bg-gray-700'
      }`}
      onClick={() => !notification.read && onMarkAsRead(notification.id)}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${typeColors[notification.type]}`}>
        {typeIcons[notification.type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className={`font-medium ${notification.read ? 'text-gray-400' : 'text-white'}`}>
            {notification.title}
          </h4>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {formatTime(notification.timestamp)}
          </span>
        </div>
        <p className="text-sm text-gray-400 truncate">{notification.message}</p>
      </div>
      {!notification.read && (
        <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
      )}
    </div>
  );
}

export function NotificationBell({ count }: { count: number }) {
  return (
    <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      {count > 0 && (
        <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}
