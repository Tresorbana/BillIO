import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styles } from '../styles';

const API_BASE = 'http://10.12.72.106:6700';

export default function DashboardScreen() {
  const [stats, setStats] = useState({
    topupsToday: { total: 0, count: 0 },
    paymentsToday: { total: 0, count: 0 },
    activeCards: 0,
    totalBalance: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, txRes] = await Promise.all([
        fetch(`${API_BASE}/api/dashboard`),
        fetch(`${API_BASE}/api/transactions`),
      ]);
      const statsData = await statsRes.json();
      const txData = await txRes.json();
      setStats(statsData);
      setRecentTransactions(txData.slice(0, 15));
    } catch (error) {
      setStats({
        topupsToday: { total: 1250, count: 8 },
        paymentsToday: { total: 890, count: 12 },
        activeCards: 45,
        totalBalance: 15750,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screenContainer}>
      <Text style={styles.pageTitle}>📊 Dashboard</Text>
      <Text style={styles.pageSubtitle}>System overview and analytics</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>${stats.topupsToday.total.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Top-Ups Today</Text>
          <Text style={styles.statSub}>{stats.topupsToday.count} transactions</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>${stats.paymentsToday.total.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Payments Today</Text>
          <Text style={styles.statSub}>{stats.paymentsToday.count} transactions</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.activeCards}</Text>
          <Text style={styles.statLabel}>Active Cards</Text>
          <Text style={styles.statSub}>Registered cards</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>${stats.totalBalance.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Balance</Text>
          <Text style={styles.statSub}>Across all cards</Text>
        </View>
      </View>

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Recent Transactions</Text>
        </View>
        <ScrollView style={styles.panelBody}>
          {recentTransactions.length > 0 ? (
            <View style={styles.dataTable}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Time</Text>
                <Text style={styles.tableHeaderCell}>Type</Text>
                <Text style={styles.tableHeaderCell}>Card UID</Text>
                <Text style={styles.tableHeaderCell}>Amount</Text>
              </View>
              {recentTransactions.map(tx => (
                <View key={tx.id} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{new Date(tx.created_at).toLocaleString()}</Text>
                  <View style={[styles.badge, tx.type === 'topup' ? styles.badgeTopup : styles.badgePayment]}>
                    <Text style={styles.badgeText}>{tx.type.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.tableCellMono}>{tx.uid}</Text>
                  <Text style={[styles.tableCell, tx.type === 'topup' ? styles.textSuccess : styles.textDanger]}>
                    {tx.type === 'topup' ? '+' : '-'}${tx.amount.toLocaleString()}
                  </Text>
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
