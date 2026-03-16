import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styles } from '../styles';
import { API_BASE } from '../config';

interface Transaction {
  _id: string;
  uid: string;
  holderName: string;
  type: 'topup' | 'debit';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  timestamp: string;
}

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await fetch(`${API_BASE}/transactions`);
      const data = await response.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch {
      setTransactions([]);
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
          <Text style={styles.panelTitle}>All Transactions ({transactions.length})</Text>
        </View>
        <ScrollView style={styles.panelBody}>
          {transactions.length > 0 ? (
            <View style={styles.dataTable}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Time</Text>
                <Text style={styles.tableHeaderCell}>Type</Text>
                <Text style={styles.tableHeaderCell}>Card UID</Text>
                <Text style={styles.tableHeaderCell}>Holder</Text>
                <Text style={styles.tableHeaderCell}>Amount</Text>
                <Text style={styles.tableHeaderCell}>Balance After</Text>
              </View>
              {transactions.map(tx => (
                <View key={tx._id} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{new Date(tx.timestamp).toLocaleString()}</Text>
                  <View style={[styles.badge, tx.type === 'topup' ? styles.badgeTopup : styles.badgePayment]}>
                    <Text style={styles.badgeText}>{tx.type === 'topup' ? 'TOPUP' : 'PAYMENT'}</Text>
                  </View>
                  <Text style={styles.tableCellMono}>{tx.uid}</Text>
                  <Text style={styles.tableCell}>{tx.holderName}</Text>
                  <Text style={[styles.tableCell, tx.type === 'topup' ? styles.textSuccess : styles.textDanger]}>
                    {tx.type === 'topup' ? '+' : '-'}${tx.amount.toLocaleString()}
                  </Text>
                  <Text style={styles.tableCell}>${tx.balanceAfter.toLocaleString()}</Text>
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
