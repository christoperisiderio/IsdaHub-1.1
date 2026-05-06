// app/notifications.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../store/authStore';
import { useNotificationsStore } from '../store/notificationsStore';
import { Colors } from '../constants/Colors';

const TYPE_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  order: { icon: 'receipt-outline', color: Colors.primary, bg: Colors.overlay },
  payment: { icon: 'cash-outline', color: Colors.success, bg: Colors.successLight },
  stock: { icon: 'warning-outline', color: Colors.warning, bg: Colors.warningLight },
  message: { icon: 'chatbubble-outline', color: Colors.info, bg: Colors.infoLight },
  system: { icon: 'information-circle-outline', color: Colors.muted, bg: Colors.surfaceSecondary },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const past = new Date(dateStr).getTime();
  const diff = Math.floor((now - past) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationsScreen() {
  const { currentUser } = useAuthStore();
  const { getUserNotifications, markAsRead, markAllAsRead } = useNotificationsStore();

  if (!currentUser) return null;
  const notifications = getUserNotifications(currentUser.id);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LinearGradient colors={[Colors.dark, Colors.primary]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unread > 0 && <View style={styles.unreadBadge}><Text style={styles.unreadBadgeText}>{unread}</Text></View>}
        </View>
        {unread > 0 && (
          <TouchableOpacity onPress={() => markAllAsRead(currentUser.id)}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔔</Text>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyDesc}>You'll see order updates and alerts here.</Text>
          </View>
        ) : (
          notifications.map((n) => {
            const cfg = TYPE_ICONS[n.type] || TYPE_ICONS.system;
            return (
              <TouchableOpacity
                key={n.id}
                style={[styles.notifCard, !n.read && styles.notifCardUnread]}
                onPress={() => {
                  markAsRead(n.id);
                  if (n.orderId) {
                    if (currentUser.role === 'fisherman') {
                      router.push({ pathname: '/(fisherman)/order-detail', params: { orderId: n.orderId } });
                    } else {
                      router.push({ pathname: '/(buyer)/order-tracking', params: { orderId: n.orderId } });
                    }
                  }
                }}
                activeOpacity={0.85}
              >
                <View style={[styles.notifIcon, { backgroundColor: cfg.bg }]}>
                  <Ionicons name={cfg.icon as any} size={20} color={cfg.color} />
                </View>
                <View style={styles.notifBody}>
                  <Text style={styles.notifTitle}>{n.title}</Text>
                  <Text style={styles.notifMsg}>{n.message}</Text>
                  <Text style={styles.notifTime}>{timeAgo(n.createdAt)}</Text>
                </View>
                {!n.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 24 },
  backBtn: { marginBottom: 12 },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  headerTitle: { fontSize: 26, fontFamily: 'Nunito_800ExtraBold', color: Colors.white },
  unreadBadge: { backgroundColor: Colors.danger, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  unreadBadgeText: { fontSize: 12, fontFamily: 'Inter_700Bold', color: Colors.white },
  markAllText: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter_600SemiBold' },
  scroll: { flex: 1 },
  content: { padding: 16, flexGrow: 1 },
  empty: { flex: 1, alignItems: 'center', paddingVertical: 80 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontFamily: 'Nunito_800ExtraBold', color: Colors.dark },
  emptyDesc: { fontSize: 14, color: Colors.textSecondary, marginTop: 6 },
  notifCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.surface, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border, gap: 12 },
  notifCardUnread: { borderColor: Colors.primary + '50', backgroundColor: Colors.overlay },
  notifIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notifBody: { flex: 1 },
  notifTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', color: Colors.dark, marginBottom: 4 },
  notifMsg: { fontSize: 13, color: Colors.textSecondary, fontFamily: 'Inter_400Regular', lineHeight: 18 },
  notifTime: { fontSize: 11, color: Colors.muted, fontFamily: 'Inter_400Regular', marginTop: 6 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary, marginTop: 4, flexShrink: 0 },
});
