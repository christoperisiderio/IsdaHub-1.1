import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../store/authStore';
import { useOrdersStore } from '../store/ordersStore';
import { useMessagesStore } from '../store/messagesStore';
import { Colors } from '../constants/Colors';

export default function OrderChatScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { currentUser } = useAuthStore();
  const { getOrderById } = useOrdersStore();
  const { getMessagesByOrder, sendMessage } = useMessagesStore();
  const [draft, setDraft] = useState('');

  const order = getOrderById(orderId);
  const messages = getMessagesByOrder(orderId);

  const partnerName = useMemo(() => {
    if (!order || !currentUser) return '';
    return currentUser.id === order.buyerId ? order.fishermanName : order.buyerName;
  }, [order, currentUser]);

  if (!order || !currentUser) return null;

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage(order.id, currentUser.id, draft);
    setDraft('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LinearGradient colors={[Colors.dark, Colors.primary]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Chat</Text>
        <Text style={styles.headerSub}>with {partnerName}</Text>
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {messages.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="chatbubble-ellipses-outline" size={30} color={Colors.muted} />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySub}>Start the conversation for this order.</Text>
          </View>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === currentUser.id;
            return (
              <View key={m.id} style={[styles.msgBubble, mine ? styles.msgMine : styles.msgOther]}>
                <Text style={[styles.msgText, mine && styles.msgTextMine]}>{m.text}</Text>
                <Text style={[styles.msgTime, mine && styles.msgTimeMine]}>
                  {new Date(m.createdAt).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={Colors.mutedLight}
          value={draft}
          onChangeText={setDraft}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Ionicons name="send" size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 20 },
  backBtn: { marginBottom: 10 },
  headerTitle: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold', color: Colors.white },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_500Medium', marginTop: 3 },
  body: { flex: 1 },
  bodyContent: { padding: 14, gap: 10 },
  emptyCard: {
    marginTop: 36,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 15, color: Colors.dark, fontFamily: 'Inter_700Bold', marginTop: 8 },
  emptySub: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  msgBubble: {
    maxWidth: '82%',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  msgMine: { alignSelf: 'flex-end', backgroundColor: Colors.primary },
  msgOther: { alignSelf: 'flex-start', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  msgText: { color: Colors.dark, fontSize: 14, fontFamily: 'Inter_500Medium' },
  msgTextMine: { color: Colors.white },
  msgTime: { marginTop: 4, fontSize: 10, color: Colors.muted },
  msgTimeMine: { color: 'rgba(255,255,255,0.75)' },
  composer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: Colors.text,
    fontSize: 14,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
