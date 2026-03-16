import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styles } from '../styles';
import { API_BASE } from '../config';

interface Card {
  uid: string;
  holderName: string;
  balance: number;
  createdAt: string;
}

export default function CardsScreen() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/cards`);
      const data = await response.json();
      setCards(Array.isArray(data) ? data : []);
    } catch {
      setCards([]);
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
                  <Text style={styles.tableCell}>{card.holderName}</Text>
                  <Text style={[styles.tableCell, styles.textSuccess]}>
                    ${card.balance.toLocaleString()}
                  </Text>
                  <Text style={styles.tableCell}>{new Date(card.createdAt).toLocaleString()}</Text>
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
