import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { styles } from '../styles';
import { API_BASE } from '../config';

interface Card {
  uid: string;
  card_holder: string;
  balance: number;
  registered_at: string;
}

interface TopupScreenProps {
  scannedCard: Card | null;
  setScannedCard: (card: Card | null) => void;
  onTopup: (uid: string, amount: number) => Promise<void>;
}

export default function TopupScreen({ scannedCard, setScannedCard, onTopup }: TopupScreenProps) {
  const [cardId, setCardId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [manualUid, setManualUid] = useState('');
  const [regHolder, setRegHolder] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  const manualLookup = async () => {
    if (!manualUid.trim()) return;
    try {
      const response = await fetch(`${API_BASE}/api/cards/${manualUid.trim()}`);
      if (response.ok) {
        const card = await response.json();
        setScannedCard({ uid: card.uid, card_holder: card.card_holder, balance: card.balance, registered_at: card.registered_at });
      } else {
        setScannedCard({ uid: manualUid.trim(), card_holder: '', balance: 0, registered_at: '' });
        setShowRegister(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to lookup card');
    }
  };

  const registerNewCard = async () => {
    if (!regHolder.trim() || !scannedCard) return;
    try {
      const response = await fetch(`${API_BASE}/api/cards/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: scannedCard.uid, cardHolder: regHolder.trim() }),
      });
      if (response.ok) {
        const data = await response.json();
        setScannedCard(data.card);
        setShowRegister(false);
        setRegHolder('');
      } else {
        Alert.alert('Error', (await response.json()).error);
      }
    } catch (error) {
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
      await onTopup(scannedCard.uid, amt);
      setResult({ type: 'success', message: `Added $${amt.toLocaleString()} — New Balance: $${(scannedCard.balance + amt).toLocaleString()}` });
      setAmount('');
      // Update local card balance
      setScannedCard({ ...scannedCard, balance: scannedCard.balance + amt });
    } catch (error) {
      setResult({ type: 'error', message: 'Top-up failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screenContainer}>
      <Text style={styles.pageTitle}>💰 Top-Up Card</Text>
      <Text style={styles.pageSubtitle}>Add funds to an RFID card</Text>

      {/* Scan Area */}
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
          ) : !scannedCard.card_holder ? (
            <View style={styles.scanArea}>
              <Text style={styles.scanIcon}>🔍</Text>
              <Text style={styles.scannedUid}>{scannedCard.uid}</Text>
              <Text style={styles.scanText}>Unknown Card</Text>

              {!showRegister ? (
                <TouchableOpacity
                  style={styles.btnWarning}
                  onPress={() => setShowRegister(true)}
                >
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
              <Text style={styles.scannedHolder}>👤 {scannedCard.card_holder}</Text>
              <Text style={styles.scannedBalance}>Balance: ${scannedCard.balance.toLocaleString()}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Top-up Form */}
      {scannedCard?.card_holder && (
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

      {/* Recent Top-ups */}
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Recent Top-Ups</Text>
        </View>
        <ScrollView style={styles.panelBody}>
          {/* Would load recent transactions here */}
          <Text style={styles.emptyText}>Recent top-ups will appear here</Text>
        </ScrollView>
      </View>
    </ScrollView>
  );
}
