import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { styles } from '../styles';
import { API_BASE } from '../config';

interface Card {
  uid: string;
  holderName: string;
  balance: number;
  createdAt: string;
}

interface TopupScreenProps {
  scannedCard: Card | null;
  setScannedCard: (card: Card | null) => void;
  onTopup: (uid: string, amount: number, holderName?: string) => Promise<void>;
}

export default function TopupScreen({ scannedCard, setScannedCard, onTopup }: TopupScreenProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [manualUid, setManualUid] = useState('');
  const [regHolder, setRegHolder] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  const manualLookup = async () => {
    if (!manualUid.trim()) return;
    try {
      const response = await fetch(`${API_BASE}/api/card/${manualUid.trim()}`);
      if (response.ok) {
        const card = await response.json();
        setScannedCard({ uid: card.uid, holderName: card.holderName, balance: card.balance, createdAt: card.createdAt });
      } else {
        setScannedCard({ uid: manualUid.trim(), holderName: '', balance: 0, createdAt: '' });
        setShowRegister(true);
      }
    } catch {
      Alert.alert('Error', 'Failed to lookup card');
    }
  };

  const registerNewCard = async () => {
    if (!regHolder.trim() || !scannedCard) return;
    try {
      const response = await fetch(`${API_BASE}/api/cards/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: scannedCard.uid, holderName: regHolder.trim() }),
      });
      if (response.ok) {
        const data = await response.json();
        setScannedCard(data.card);
        setShowRegister(false);
        setRegHolder('');
      } else {
        Alert.alert('Error', (await response.json()).error);
      }
    } catch {
      Alert.alert('Error', 'Failed to register card');
    }
  };

  const handleTopup = async () => {
    if (!scannedCard || !amount) return;
    const amt = parseInt(amount);
    if (!amt || amt <= 0) return Alert.alert('Error', 'Enter a valid amount');

    setLoading(true);
    setResult(null);
    try {
      await onTopup(scannedCard.uid, amt, scannedCard.holderName || undefined);
      setResult({ type: 'success', message: `Added ${amt.toLocaleString()} — New Balance: ${(scannedCard.balance + amt).toLocaleString()}` });
      setAmount('');
      setScannedCard({ ...scannedCard, balance: scannedCard.balance + amt });
    } catch {
      setResult({ type: 'error', message: 'Top-up failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screenContainer}>
      <Text style={styles.pageTitle}>💰 Top-Up Card</Text>
      <Text style={styles.pageSubtitle}>Add funds to an RFID card</Text>

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Card Selection</Text>
        </View>
        <View style={styles.panelBody}>
          {!scannedCard ? (
            <View style={styles.scanArea}>
              <Text style={styles.scanIcon}>📡</Text>
              <Text style={styles.scanText}>Waiting for RFID card scan...</Text>
              <Text style={styles.scanSubtext}>Or enter UID manually below</Text>
              <View style={styles.manualLookup}>
                <TextInput
                  style={styles.manualInput}
                  placeholder="Enter UID"
                  value={manualUid}
                  onChangeText={setManualUid}
                  autoCapitalize="none"
                />
                <TouchableOpacity style={styles.btnPrimary} onPress={manualLookup}>
                  <Text style={styles.btnPrimaryText}>Lookup</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : !scannedCard.holderName ? (
            <View style={styles.scanArea}>
              <Text style={styles.scanIcon}>🔍</Text>
              <Text style={styles.scannedUid}>{scannedCard.uid}</Text>
              <Text style={styles.scanText}>Unknown Card</Text>
              {!showRegister ? (
                <TouchableOpacity style={styles.btnWarning} onPress={() => setShowRegister(true)}>
                  <Text style={styles.btnWarningText}>⚠️ Card not registered — Register it first</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.registerForm}>
                  <Text style={styles.alertWarning}>⚠️ Card not registered in database</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Card Holder Name"
                    value={regHolder}
                    onChangeText={setRegHolder}
                  />
                  <TouchableOpacity style={styles.btnSuccess} onPress={registerNewCard}>
                    <Text style={styles.btnSuccessText}>Register Card</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.scanArea}>
              <Text style={styles.scanIcon}>✅</Text>
              <Text style={styles.scannedUid}>{scannedCard.uid}</Text>
              <Text style={styles.scannedHolder}>👤 {scannedCard.holderName}</Text>
              <Text style={styles.scannedBalance}>Balance: ${scannedCard.balance.toLocaleString()}</Text>
            </View>
          )}
        </View>
      </View>

      {scannedCard?.holderName && (
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Top-Up Amount</Text>
          </View>
          <View style={styles.panelBody}>
            {result && (
              <View style={[styles.alert, result.type === 'success' ? styles.alertSuccess : styles.alertError]}>
                <Text style={styles.alertText}>
                  {result.type === 'success' ? '✅' : '❌'} {result.message}
                </Text>
              </View>
            )}
            <TextInput
              style={styles.input}
              placeholder="Amount ($)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.btnSuccess, loading && styles.btnDisabled]}
              onPress={handleTopup}
              disabled={loading}
            >
              <Text style={styles.btnSuccessText}>⬆ Process Top-Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Recent Top-Ups</Text>
        </View>
        <ScrollView style={styles.panelBody}>
          <Text style={styles.emptyText}>Recent top-ups will appear here</Text>
        </ScrollView>
      </View>
    </ScrollView>
  );
}
