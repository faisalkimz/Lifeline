import React, { useState, useRef, useEffect } from 'react';
import { useGetNotificationsQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation } from '../../store/api';
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatDistanceToNow } from 'date-fns';

import { usePushNotifications } from '../../hooks/usePushNotifications';

const NotificationsPopover = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { data: notificationsData, isLoading } = useGetNotificationsQuery(undefined, {
        pollingInterval: 15000, // Poll every 15s
    });
    const [markRead] = useMarkNotificationReadMutation();
    const [markAllRead] = useMarkAllNotificationsReadMutation();
    const popoverRef = useRef(null);

    const { isSupported, subscription, subscribeToNotifications } = usePushNotifications();

    // Handle Paginated or List data safely
    const notifications = Array.isArray(notificationsData)
        ? notificationsData
        : (notificationsData?.results || []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleMarkRead = async (id, e) => {
        e.stopPropagation();
        try {
            await markRead(id).unwrap();
        } catch (error) {
            console.error('Failed to mark read', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllRead().unwrap();
        } catch (error) {
            console.error('Failed to mark all read', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
            case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    return (
        <div className="relative" ref={popoverRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "p-2 rounded-xl transition-all relative",
                    isOpen ? "bg-primary-50 text-primary-600" : "text-gray-500 hover:text-primary-600 hover:bg-primary-50"
                )}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-fade-in origin-top-right">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-800">Notifications</h3>
                            {isSupported && !subscription && (
                                <button
                                    onClick={subscribeToNotifications}
                                    className="text-[10px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-semibold hover:bg-primary-200 transition-colors"
                                    title="Enable Push Notifications"
                                >
                                    Enable Push
                                </button>
                            )}
                        </div>

                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            >
                                <Check className="h-3 w-3" /> Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto">
                        {isLoading ? (
                            <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-gray-500 font-medium text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            <div>
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "p-4 border-b border-slate-50 hover:bg-gray-50 transition-colors flex gap-3 cursor-default group",
                                            !notification.is_read && "bg-primary-50/30"
                                        )}
                                    >
                                        <div className="mt-1 flex-shrink-0">
                                            {notification.actor_avatar ? (
                                                <img src={notification.actor_avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                    {getIcon(notification.notification_type)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900 leading-snug">
                                                <span className="font-semibold">{notification.actor_name || 'System'}</span> {notification.verb}
                                            </p>
                                            {notification.description && (
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                    {notification.description}
                                                </p>
                                            )}
                                            <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                        <div>
                                            {!notification.is_read && (
                                                <button
                                                    onClick={(e) => handleMarkRead(notification.id, e)}
                                                    className="h-2 w-2 rounded-full bg-primary-500 group-hover:bg-primary-600 transition-colors"
                                                    title="Mark as read"
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsPopover;
