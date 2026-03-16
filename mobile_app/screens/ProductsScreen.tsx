import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { styles } from '../styles';
import { API_BASE } from '../config';

interface Product { id: string; name: string; price: number; category: string; }
interface CartItem { product: Product; quantity: number; lineCost: number; }

interface ProductsScreenProps {
  products: Product[];
  onLoadProducts: () => Promise<void>;
  setProducts: (products: Product[]) => void;
  readonly?: boolean;
  cart?: { [key: string]: number };
  onToggleProduct?: (id: string) => void;
  onSetCartQty?: (id: string, qty: number) => void;
  getCartItems?: () => CartItem[];
  getCartTotal?: () => number;
  onGoToPayment?: () => void;
}

export default function ProductsScreen({
  products, onLoadProducts, readonly = false,
  cart = {}, onToggleProduct, onSetCartQty, getCartItems, getCartTotal, onGoToPayment,
}: ProductsScreenProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'General' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { onLoadProducts(); }, []);

  const cartItems = getCartItems ? getCartItems() : [];
  const cartTotal = getCartTotal ? getCartTotal() : 0;

  const addProduct = async () => {
    const name = newProduct.name.trim();
    const price = parseFloat(newProduct.price);
    const category = newProduct.category.trim();
    if (!name || !price || price <= 0) return Alert.alert('Error', 'Name and valid price required');
    // Use a slug-style id from the name
    const id = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, price, category }),
      });
      if (res.ok) { await onLoadProducts(); setNewProduct({ name: '', price: '', category: 'General' }); setShowAddForm(false); }
      else Alert.alert('Error', (await res.json()).error);
    } catch { Alert.alert('Error', 'Failed to add product'); }
    finally { setLoading(false); }
  };

  const deleteProduct = async (id: string) => {
    Alert.alert('Delete Product', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          const res = await fetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE' });
          if (res.ok) await onLoadProducts();
        } catch { Alert.alert('Error', 'Failed to delete product'); }
      }},
    ]);
  };

  return (
    <ScrollView style={styles.screenContainer}>
      <Text style={styles.pageTitle}>📦 Products</Text>
      <Text style={styles.pageSubtitle}>{readonly ? 'Select products to add to cart' : 'Manage products and services'}</Text>

      {/* Cart summary bar — salesperson only */}
      {readonly && cartItems.length > 0 && (
        <View style={styles.panel}>
          <View style={styles.panelBody}>
            <View style={styles.cartTotal}>
              <Text style={styles.cartTotalLabel}>{cartItems.length} item(s) — Total: ${cartTotal.toLocaleString()}</Text>
              <TouchableOpacity style={styles.btnPrimary} onPress={onGoToPayment}>
                <Text style={styles.btnPrimaryText}>💳 Go to Payment →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Add New Product — admin only */}
      {!readonly && (
        <View style={styles.panel}>
          <View style={styles.panelHeader}><Text style={styles.panelTitle}>Add New Product</Text></View>
          <View style={styles.panelBody}>
            <TouchableOpacity style={styles.btnSuccess} onPress={() => setShowAddForm(!showAddForm)}>
              <Text style={styles.btnSuccessText}>{showAddForm ? '− Cancel' : '+ Add Product'}</Text>
            </TouchableOpacity>
            {showAddForm && (
              <View style={styles.addForm}>
                <TextInput style={styles.input} placeholder="Product Name" value={newProduct.name} onChangeText={name => setNewProduct({ ...newProduct, name })} />
                <TextInput style={styles.input} placeholder="Price ($)" value={newProduct.price} onChangeText={price => setNewProduct({ ...newProduct, price })} keyboardType="decimal-pad" />
                <TextInput style={styles.input} placeholder="Category" value={newProduct.category} onChangeText={category => setNewProduct({ ...newProduct, category })} />
                <TouchableOpacity style={[styles.btnSuccess, loading && styles.btnDisabled]} onPress={addProduct} disabled={loading}>
                  <Text style={styles.btnSuccessText}>+ Add Product</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Products list */}
      <View style={styles.panel}>
        <View style={styles.panelHeader}><Text style={styles.panelTitle}>All Products</Text></View>
        <ScrollView style={styles.panelBody}>
          {products.length > 0 ? (
            <View style={styles.productGrid}>
              {products.map(product => {
                const qty = cart[product.id] || 0;
                const inCart = qty > 0;
                return (
                  <View key={product.id} style={[styles.productCard, inCart && styles.productCardSelected]}>
                    <View style={styles.productCardContent}>
                      {inCart && <Text style={styles.productCheck}>✓</Text>}
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productPrice}>${product.price.toLocaleString()}</Text>
                      <Text style={styles.productCategory}>{product.category}</Text>
                    </View>

                    {readonly && onToggleProduct && onSetCartQty ? (
                      inCart ? (
                        <View style={styles.productQuantityControls}>
                          <TouchableOpacity style={styles.quantityButton} onPress={() => qty > 1 ? onSetCartQty(product.id, qty - 1) : onToggleProduct(product.id)}>
                            <Text style={styles.quantityButtonText}>−</Text>
                          </TouchableOpacity>
                          <Text style={styles.quantityText}>{qty}</Text>
                          <TouchableOpacity style={styles.quantityButton} onPress={() => onSetCartQty(product.id, qty + 1)}>
                            <Text style={styles.quantityButtonText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity style={styles.btnPrimary} onPress={() => onToggleProduct(product.id)}>
                          <Text style={styles.btnPrimaryText}>+ Add</Text>
                        </TouchableOpacity>
                      )
                    ) : !readonly ? (
                      <View style={styles.inlineActions}>
                        <TouchableOpacity style={styles.btnDangerSmall} onPress={() => deleteProduct(product.id)}>
                          <Text style={styles.btnDangerSmallText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={styles.emptyText}>No products yet</Text>
          )}
        </ScrollView>
      </View>
    </ScrollView>
  );
}
