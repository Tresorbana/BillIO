import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styles } from '../styles';

const API_BASE = 'http://10.12.72.106:6700';

interface Card {
  uid: string;
  card_holder: string;
  balance: number;
  registered_at: string;
}

interface CardsScreenProps {}

export default function CardsScreen({}: CardsScreenProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/cards`);
      const data = await response.json();
      setCards(data);
    } catch (error) {
      // Mock data fallback
      setCards([
        {
          uid: 'ABC123',
          card_holder: 'John Doe',
          balance: 150,
          registered_at: new Date().toISOString()
        },
        {
          uid: 'DEF456',
          card_holder: 'Jane Smith',
          balance: 75,
          registered_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading cards...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screenContainer}>
      <Text style={styles.pageTitle}>💳 Registered Cards</Text>
      <Text style={styles.pageSubtitle}>All RFID cards</Text>

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Cards</Text>
        </View>
        <ScrollView style={styles.panelBody}>
          {cards.length > 0 ? (
            <View style={styles.dataTable}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>UID</Text>
                <Text style={styles.tableHeaderCell}>Card Holder</Text>
                <Text style={styles.tableHeaderCell}>Balance</Text>
                <Text style={styles.tableHeaderCell}>Registered</Text>
              </View>
              {cards.map(card => (
                <View key={card.uid} style={styles.tableRow}>
                  <Text style={styles.tableCellMono}>{card.uid}</Text>
                  <Text style={styles.tableCell}>{card.card_holder}</Text>
                  <Text style={[styles.tableCell, styles.textSuccess]}>
                    ${card.balance.toLocaleString()}
                  </Text>
                  <Text style={styles.tableCell}>{new Date(card.registered_at).toLocaleString()}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No cards registered yet</Text>
          )}
        </ScrollView>
      </View>
    </ScrollView>
  );
}
