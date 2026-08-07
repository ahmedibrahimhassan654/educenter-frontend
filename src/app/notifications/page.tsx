"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import notificationApi, { Notification } from "@/lib/notification-api";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Loader2,
  X,
  ExternalLink,
  Clock,
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Settings,
  Filter,
} from "lucide-react";
import Link from "next/link";

const typeIcons: Record<string, any> = {
  INFO: Info,
  SUCCESS: CheckCircle,
  WARNING: AlertTriangle,
  ERROR: AlertCircle,
  SYSTEM: Settings,
};

const typeColors: Record<string, { bg: string; text: string }> = {
  INFO: { bg: "bg-blue-500/10", text: "text-blue-500" },
  SUCCESS: { bg: "bg-green-500/10", text: "text-green-500" },
  WARNING: { bg: "bg-yellow-500/10", text: "text-yellow-500" },
  ERROR: { bg: "bg-red-500/10", text: "text-red-500" },
  SYSTEM: { bg: "bg-purple-500/10", text: "text-purple-500" },
};

const categoryLabels: Record<string, string> = {
  GENERAL: "عام",
  USER: "مستخدمين",
  PAYMENT: "مدفوعات",
  GROUP: "مجموعات",
  SESSION: "حصص",
  ATTENDANCE: "حضور",
  SYSTEM: "نظام",
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await notificationApi.getNotifications({
        limit: 50,
        unreadOnly: filter === "unread",
      });
      setNotifications(response.data);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      toast.error("خطأ في جلب الإشعارات");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      toast.error("خطأ في تحديث الإشعار");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("تم تحديد جميع الإشعارات كمقروءة");
    } catch (error) {
      toast.error("خطأ في تحديث الإشعارات");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationApi.deleteNotification(id);
      const deleted = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (deleted && !deleted.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      toast.error("خطأ في حذف الإشعار");
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("هل أنت متأكد من حذف جميع الإشعارات؟")) return;
    try {
      await notificationApi.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      toast.success("تم حذف جميع الإشعارات");
    } catch (error) {
      toast.error("خطأ في حذف الإشعارات");
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "الآن";
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    return date.toLocaleDateString("ar-EG");
  };

  const filteredNotifications =
    typeFilter === "all"
      ? notifications
      : notifications.filter((n) => n.type === typeFilter);

  const role = user?.role?.toLowerCase() as "admin" | "teacher" | "student" | "parent";

  return (
    <DashboardLayout role={role || "admin"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">الإشعارات</h2>
            <p className="text-base text-muted-foreground mt-1">
              {unreadCount > 0
                ? `لديك ${unreadCount} إشعار غير مقروء`
                : "جميع الإشعارات مقروءة"}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={handleMarkAllAsRead} className="gap-2">
                <CheckCheck className="w-4 h-4" />
                تحديد الكل كمقروء
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="outline" onClick={handleDeleteAll} className="gap-2 text-destructive">
                <Trash2 className="w-4 h-4" />
                حذف الكل
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border rounded-xl p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">الفلترة:</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                الكل
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("unread")}
              >
                غير مقروء ({unreadCount})
              </Button>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={typeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("all")}
              >
                جميع الأنواع
              </Button>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <Button
                  key={key}
                  variant={typeFilter === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTypeFilter(key)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-card border rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">لا توجد إشعارات</p>
              <p className="text-sm mt-1">
                {filter === "unread"
                  ? "جميع الإشعارات مقروءة"
                  : "ستظهر هنا الإشعارات الجديدة"}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => {
                const TypeIcon = typeIcons[notification.type] || Info;
                const colors = typeColors[notification.type] || typeColors.INFO;

                return (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-muted/30 transition-colors ${
                      !notification.isRead ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}
                      >
                        <TypeIcon className={`w-6 h-6 ${colors.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p
                              className={`text-base ${
                                !notification.isRead ? "font-bold" : "font-medium"
                              }`}
                            >
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleMarkAsRead(notification._id)}
                                title="تحديد كمقروء"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive"
                              onClick={() => handleDelete(notification._id)}
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatTime(notification.createdAt)}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${colors.bg} ${colors.text}`}
                          >
                            {categoryLabels[notification.category] || notification.category}
                          </span>
                          {notification.link && (
                            <Link
                              href={notification.link}
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" />
                              عرض
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
