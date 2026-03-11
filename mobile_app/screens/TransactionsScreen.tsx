import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styles } from '../styles';

const API_BASE = 'http://10.12.72.106:6700';

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/transactions`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      // Mock data fallback
      setTransactions([
        {
          id: '1',
          type: 'topup',
          amount: 50,
          uid: 'ABC123',
          created_at: new Date().toISOString(),
          product_name: null,
          quantity: null,
          balance_after: 150
        },
        {
          id: '2',
          type: 'payment',
          amount: 25,
          uid: 'DEF456',
          created_at: new Date().toISOString(),
          product_name: 'Coffee',
          quantity: 1,
          balance_after: 75
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screenContainer}>
      <Text style={styles.pageTitle}>📋 Transaction History</Text>
      <Text style={styles.pageSubtitle}>Complete ledger</Text>

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>All Transactions</Text>
        </View>
        <ScrollView style={styles.panelBody}>
          {transactions.length > 0 ? (
            <View style={styles.dataTable}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Time</Text>
                <Text style={styles.tableHeaderCell}>Type</Text>
                <Text style={styles.tableHeaderCell}>Card UID</Text>
                <Text style={styles.tableHeaderCell}>Details</Text>
                <Text style={styles.tableHeaderCell}>Amount</Text>
                <Text style={styles.tableHeaderCell}>Balance After</Text>
              </View>
              {transactions.map(tx => (
                <View key={tx.id} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{new Date(tx.created_at).toLocaleString()}</Text>
                  <View style={[styles.badge, tx.type === 'topup' ? styles.badgeTopup : styles.badgePayment]}>
                    <Text style={styles.badgeText}>{tx.type.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.tableCellMono}>{tx.uid}</Text>
                  <Text style={styles.tableCell}>
                    {tx.product_name ? `${tx.product_name} × ${tx.quantity}` : '—'}
                  </Text>
                  <Text style={[styles.tableCell, tx.type === 'topup' ? styles.textSuccess : styles.textDanger]}>
                    {tx.type === 'topup' ? '+' : '-'}${tx.amount.toLocaleString()}
                  </Text>
                  <Text style={styles.tableCell}>${tx.balance_after.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No transactions yet</Text>
          )}
        </ScrollView>
      </View>
    </ScrollView>
  );
}
