// components/ui/Badge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { OrderStatus } from '../../types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; color: string }> = {
  pending: { label: 'Pending', bg: Colors.warningLight, color: Colors.warning },
  accepted: { label: 'Accepted', bg: Colors.infoLight, color: Colors.info },
  preparing: { label: 'Preparing', bg: '#EEF2FF', color: '#4F46E5' },
  ready_pickup: { label: 'Ready for Pickup', bg: Colors.accentLight + '30', color: Colors.accent },
  out_delivery: { label: 'Out for Delivery', bg: '#FFF7ED', color: '#EA580C' },
  completed: { label: 'Completed', bg: Colors.successLight, color: Colors.success },
  cancelled: { label: 'Cancelled', bg: '#FEF2F2', color: Colors.danger },
  declined: { label: 'Declined', bg: '#FEF2F2', color: Colors.danger },
};

interface StatusBadgeProps {
  status: OrderStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

interface BadgeProps {
  label: string;
  color?: string;
  bg?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color = Colors.primary,
  bg = Colors.overlay,
  size = 'md',
}) => (
  <View style={[styles.badge, { backgroundColor: bg }, size === 'sm' && styles.badgeSm]}>
    <Text style={[styles.text, { color }, size === 'sm' && styles.textSm]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  badgeSm: { paddingHorizontal: 8, paddingVertical: 2 },
  text: { fontSize: 12, fontWeight: '700' },
  textSm: { fontSize: 11 },
});
