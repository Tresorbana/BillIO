import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { styles } from '../styles';
import { API_BASE } from '../config';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  lineCost: number;
}

interface Card {
  uid: string;
  card_holder: string;
  balance: number;
  registered_at: string;
}

interface PaymentsScreenProps {
  products: Product[];
  cart: {[key: number]: number};
  scannedCard: Card | null;
  setScannedCard: (card: Card | null) => void;
  onToggleProduct: (id: number) => void;
  onSetCartQty: (id: number, qty: number) => void;
  onPay: (items: {productId: number, quantity: number}[]) => Promise<void>;
  getCartItems: () => CartItem[];
  getCartTotal: () => number;
}

export default function PaymentsScreen({
  products,
  cart,
  scannedCard,
  setScannedCard,
  onToggleProduct,
  onSetCartQty,
  onPay,
  getCartItems,
  getCartTotal
}: PaymentsScreenProps) {
  const [manualUid, setManualUid] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const cartItems = getCartItems();
  const totalCost = getCartTotal();
  const hasSelection = cartItems.length > 0;
  const canPay = hasSelection && scannedCard?.card_holder && scannedCard.balance >= totalCost;
  const insufficient = hasSelection && scannedCard?.card_holder && scannedCard.balance < totalCost;

  const manualLookup = async () => {
    if (!manualUid.trim()) return;
    try {
      const response = await fetch(`${API_BASE}/api/cards/${manualUid.trim()}`);
      if (response.ok) {
        const card = await response.json();
        setScannedCard({ uid: card.uid, card_holder: card.card_holder, balance: card.balance, registered_at: card.registered_at });
      } else {
        Alert.alert('Error', 'Card not found');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to lookup card');
    }
  };

  const handlePay = async () => {
    if (!scannedCard || !cartItems.length) return;

    setLoading(true);
    setResult(null);
    try {
      const items = cartItems.map(i => ({ productId: i.product.id, quantity: i.quantity }));
      await onPay(items);
      setResult({
        type: 'success',
        message: `Payment Approved! $${totalCost.toLocaleString()} | Remaining Balance: $${(scannedCard.balance - totalCost).toLocaleString()}`
      });
      // Reset cart and scanned card
      Object.keys(cart).forEach(key => onSetCartQty(parseInt(key), 0));
      setScannedCard(null);
    } catch (error) {
      setResult({ type: 'error', message: 'Payment failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screenContainer}>
      <Text style={styles.pageTitle}>🛒 Payment</Text>
      <Text style={styles.pageSubtitle}>Select products, then tap customer's card</Text>

      {/* Step 1: Select Products */}
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Step 1 — Select Products</Text>
        </View>
        <View style={styles.panelBody}>
          <View style={styles.productGrid}>
            {products.map(product => {
              const inCart = cart[product.id] > 0;
              const quantity = cart[product.id] || 0;
              
              return (
                <View
                  key={product.id}
                  style={[styles.productCard, inCart && styles.productCardSelected]}
                >
                  <TouchableOpacity
                    style={styles.productCardContent}
                    onPress={() => !inCart && onToggleProduct(product.id)}
                  >
                    {inCart && <Text style={styles.productCheck}>✓</Text>}
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>${product.price.toLocaleString()}</Text>
                    <Text style={styles.productCategory}>{product.category}</Text>
                  </TouchableOpacity>
                  
                  {inCart && (
                    <View style={styles.productQuantityControls}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => {
                          if (quantity > 1) {
                            onSetCartQty(product.id, quantity - 1);
                          } else {
                            onToggleProduct(product.id);
                          }
                        }}
                      >
                        <Text style={styles.quantityButtonText}>−</Text>
                      </TouchableOpacity>
                      
                      <Text style={styles.quantityText}>{quantity}</Text>
                      
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => onSetCartQty(product.id, quantity + 1)}
                      >
                        <Text style={styles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {!hasSelection && (
            <Text style={styles.selectionHint}>👆 Tap products above to add them to the cart</Text>
          )}
        </View>
      </View>

      {/* Cart Summary */}
      {hasSelection && (
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Cart ({cartItems.length} items)</Text>
          </View>
          <View style={styles.panelBody}>
            {cartItems.map(item => (
              <View key={item.product.id} style={styles.cartRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cartItemName}>{item.product.name}</Text>
                  <Text style={styles.cartItemPrice}>${item.product.price.toLocaleString()} each</Text>
                </View>
                <TextInput
                  style={styles.cartQtyInput}
                  value={item.quantity.toString()}
                  onChangeText={(val) => onSetCartQty(item.product.id, parseInt(val) || 1)}
                  keyboardType="numeric"
                />
                <Text style={styles.cartItemTotal}>${item.lineCost.toLocaleString()}</Text>
                <TouchableOpacity
                  style={styles.cartRemoveBtn}
                  onPress={() => onToggleProduct(item.product.id)}
                >
                  <Text style={styles.cartRemoveText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.cartTotal}>
              <Text style={styles.cartTotalLabel}>Total</Text>
              <Text style={styles.cartTotalValue}>${totalCost.toLocaleString()}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Step 2: Tap Customer's Card */}
      {hasSelection && (
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Step 2 — Tap Customer's Card</Text>
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
            ) : (
              <View style={styles.balanceDisplay}>
                <Text style={styles.balanceLabel}>Card Balance</Text>
                <Text style={[styles.balanceValue, insufficient && styles.balanceInsufficient]}>
                  ${scannedCard.balance.toLocaleString()}
                </Text>
                <Text style={styles.balanceHolder}>👤 {scannedCard.card_holder}</Text>
                {insufficient && (
                  <Text style={styles.insufficientText}>
                    ⚠️ Insufficient balance — need ${totalCost.toLocaleString()}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      )}

      {/* Step 3: Confirm Payment */}
      {canPay && (
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Step 3 — Confirm Payment</Text>
          </View>
          <View style={styles.panelBody}>
            {result && (
              <View style={[styles.alert, result.type === 'success' ? styles.alertSuccess : styles.alertError]}>
                <Text style={styles.alertText}>{result.message}</Text>
              </View>
            )}

            <View style={styles.paymentSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items</Text>
                <Text style={styles.summaryValue}>
                  {cartItems.map(i => `${i.product.name}×${i.quantity}`).join(', ')}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total</Text>
                <Text style={styles.summaryValueTotal}>${totalCost.toLocaleString()}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Card Balance</Text>
                <Text style={styles.summaryValueSuccess}>${scannedCard!.balance.toLocaleString()}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Remaining After</Text>
                <Text style={styles.summaryValueWarning}>
                  ${(scannedCard!.balance - totalCost).toLocaleString()}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.btnPrimary, loading && styles.btnDisabled]}
              onPress={handlePay}
              disabled={loading}
            >
              <Text style={styles.btnPrimaryText}>💳 Confirm & Pay</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
