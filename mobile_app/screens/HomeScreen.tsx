import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { styles } from '../styles';
import CornerAccents from '../components/CornerAccents';

import { API_BASE } from '../config';

interface HomeScreenProps {
  onShowAuth: () => void;
}

export default function HomeScreen({ onShowAuth }: HomeScreenProps) {
  const [cardUid, setCardUid] = useState('');
  const [amount, setAmount] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('offline');

  return (
    <ScrollView style={styles.homeContainer}>
      <View style={styles.homeContent}>
        
        {/* Connection Status */}
        <View style={[styles.connBadge, connectionStatus === 'online' ? styles.connBadgeOnline : styles.connBadgeOffline]}>
          <View style={[styles.connDot, connectionStatus === 'online' ? styles.connDotOnline : styles.connDotOffline]} />
          <Text style={[styles.connBadgeText, connectionStatus === 'online' ? styles.connBadgeTextOnline : styles.connBadgeTextOffline]}>
            {connectionStatus === 'online' ? 'CONNECTED' : 'DISCONNECTED'}
          </Text>
        </View>

        {/* Header */}
        <View style={styles.homeHeader}>
          <Text style={styles.homeTitle}>
            <Text style={styles.brand}>Ballio</Text>
          </Text>
          <Text style={styles.homeSubtitle}>
            Secure, real-time IoT payment processing dashboard.
          </Text>
        </View>

        {/* Manual Top-Up Panel */}
        <View style={styles.homePanel}>
          <CornerAccents color="#6366f1" size={12} thickness={2} />
          
          <View style={styles.homePanelHeader}>
            <Text style={styles.homePanelTitle}>+ Manual Top-Up</Text>
          </View>

          <View style={styles.homePanelBody}>
            {/* Card UID Input */}
            <View style={styles.homeFormGroup}>
              <Text style={styles.homeLabel}>CARD UID</Text>
              <View style={styles.homeInputWrapper}>
                <TextInput
                  style={[styles.homeInput, styles.homeInputMono]}
                  value={cardUid}
                  onChangeText={setCardUid}
                  placeholder="Scanning..."
                  placeholderTextColor="#555570"
                  editable={!isScanning}
                />
                <TouchableOpacity style={styles.homeInputIcon}>
                  <Text style={styles.homeInputIconText}>📡</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Amount Input */}
            <View style={styles.homeFormGroup}>
              <Text style={styles.homeLabel}>AMOUNT</Text>
              <View style={styles.homeInputWrapper}>
                <Text style={styles.homeCurrencySymbol}>$</Text>
                <TextInput
                  style={[styles.homeInput, styles.homeInputWithSymbol]}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor="#555570"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Process Button */}
            <TouchableOpacity 
              style={styles.homeProcessButton}
              disabled={!cardUid || !amount}
            >
              <Text style={styles.homeProcessButtonText}>
                Process Transaction →
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Terminal/Log Panel */}
        <View style={styles.homeTerminal}>
          <CornerAccents color="#6366f1" size={12} thickness={2} />
          
          <View style={styles.homeTerminalHeader}>
            <View style={styles.homeTerminalDots}>
              <View style={[styles.homeTerminalDot, { backgroundColor: '#ef4444' }]} />
              <View style={[styles.homeTerminalDot, { backgroundColor: '#f59e0b' }]} />
              <View style={[styles.homeTerminalDot, { backgroundColor: '#22c55e' }]} />
            </View>
            <Text style={styles.homeTerminalTitle}>log.sh</Text>
            <TouchableOpacity>
              <Text style={styles.homeTerminalAction}>STDOUT</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.homeTerminalBody}>
            <Text style={styles.homeTerminalText}>
              <Text style={styles.homeTerminalPrompt}>~ </Text>
              READY FOR SCAN...
            </Text>
            <Text style={[styles.homeTerminalText, styles.homeTerminalError]}>
              16:57:03 <Text style={styles.homeTerminalErrorLabel}>[ERROR]</Text> WebSocket Fault: Unknown
            </Text>
            <Text style={[styles.homeTerminalText, styles.homeTerminalSystem]}>
              16:57:03 <Text style={styles.homeTerminalSystemLabel}>[SYSTEM]</Text> Connection lost.
            </Text>
            <Text style={styles.homeTerminalText}>
              {'\n'}
              <Text style={styles.homeTerminalPrompt}>~ </Text>
              Listening for data packets
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.homeFooter}>
          <Text style={styles.homeFooterText}>
            © 2026 1nt3rn4l_53rv3r_3rr0r | SYSTEM v1.0
          </Text>
        </View>

        {/* Sign In / Sign Up Button */}
        <TouchableOpacity 
          style={styles.homeAuthButton}
          onPress={onShowAuth}
        >
          <Text style={styles.homeAuthButtonText}>
            🔐 Sign In / Sign Up
          </Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}
