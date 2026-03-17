import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { styles } from '../styles';

const API_BASE = 'http://10.12.72.106:6700';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

interface ProductsScreenProps {
  products: Product[];
  onLoadProducts: () => Promise<void>;
  setProducts: (products: Product[]) => void;
}

export default function ProductsScreen({
  products,
  onLoadProducts,
  setProducts
}: ProductsScreenProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'General' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    onLoadProducts();
  }, []);

  const addProduct = async () => {
    const name = newProduct.name.trim();
    const price = parseFloat(newProduct.price);
    const category = newProduct.category.trim();

    if (!name || !price || price <= 0) {
      Alert.alert('Error', 'Name and valid price required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price, category }),
      });

      if (response.ok) {
        await onLoadProducts();
        setNewProduct({ name: '', price: '', category: 'General' });
        setShowAddForm(false);
      } else {
        Alert.alert('Error', (await response.json()).error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: number, field: string, value: string | number) => {
    try {
      const response = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });

      if (response.ok) {
        await onLoadProducts();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update product');
    }
  };

  const deleteProduct = async (id: number) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE' });
              if (response.ok) {
                await onLoadProducts();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.screenContainer}>
      <Text style={styles.pageTitle}>📦 Products</Text>
      <Text style={styles.pageSubtitle}>Manage products and services</Text>

      {/* Add New Product */}
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Add New Product</Text>
        </View>
        <View style={styles.panelBody}>
          <TouchableOpacity
            style={styles.btnSuccess}
            onPress={() => setShowAddForm(!showAddForm)}
          >
            <Text style={styles.btnSuccessText}>{showAddForm ? '− Cancel' : '+ Add Product'}</Text>
          </TouchableOpacity>

          {showAddForm && (
            <View style={styles.addForm}>
              <TextInput
                style={styles.input}
                placeholder="Product Name"
                value={newProduct.name}
                onChangeText={(name) => setNewProduct({...newProduct, name})}
              />
              <TextInput
                style={styles.input}
                placeholder="Price ($)"
                value={newProduct.price}
                onChangeText={(price) => setNewProduct({...newProduct, price})}
                keyboardType="decimal-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Category"
                value={newProduct.category}
                onChangeText={(category) => setNewProduct({...newProduct, category})}
              />
              <TouchableOpacity
                style={[styles.btnSuccess, loading && styles.btnDisabled]}
                onPress={addProduct}
                disabled={loading}
              >
                <Text style={styles.btnSuccessText}>+ Add Product</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* All Products */}
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>All Products</Text>
        </View>
        <ScrollView style={styles.panelBody}>
          {products.length > 0 ? (
            <View style={styles.dataTable}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>ID</Text>
                <Text style={styles.tableHeaderCell}>Name</Text>
                <Text style={styles.tableHeaderCell}>Price</Text>
                <Text style={styles.tableHeaderCell}>Category</Text>
                <Text style={styles.tableHeaderCell}>Actions</Text>
              </View>
              {products.map(product => (
                <View key={product.id} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{product.id}</Text>
                  <TextInput
                    style={styles.editableCell}
                    value={product.name}
                    onChangeText={(value) => updateProduct(product.id, 'name', value)}
                  />
                  <TextInput
                    style={styles.editableCell}
                    value={product.price.toString()}
                    onChangeText={(value) => updateProduct(product.id, 'price', parseFloat(value) || 0)}
                    keyboardType="decimal-pad"
                  />
                  <TextInput
                    style={styles.editableCell}
                    value={product.category}
                    onChangeText={(value) => updateProduct(product.id, 'category', value)}
                  />
                  <View style={styles.inlineActions}>
                    <TouchableOpacity
                      style={styles.btnPrimarySmall}
                      onPress={() => updateProduct(product.id, 'name', product.name)}
                    >
                      <Text style={styles.btnPrimarySmallText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.btnDangerSmall}
                      onPress={() => deleteProduct(product.id)}
                    >
                      <Text style={styles.btnDangerSmallText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No products yet</Text>
          )}
        </ScrollView>
      </View>
    </ScrollView>
  );
}
