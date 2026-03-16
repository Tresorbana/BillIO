import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, Orbitron_700Bold } from '@expo-google-fonts/orbitron';

// Import screens
import HomeScreen from './screens/HomeScreen';
import DashboardScreen from './screens/DashboardScreen';
import TopupScreen from './screens/TopupScreen';
import PaymentsScreen from './screens/PaymentsScreen';
import ProductsScreen from './screens/ProductsScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import CardsScreen from './screens/CardsScreen';

// Import components
import CornerAccents from './components/CornerAccents';
import {
  DashboardIcon,
  TopUpIcon,
  PaymentIcon,
  ProductsIcon,
  TransactionsIcon,
  CardsIcon,
  LogoutIcon,
  UserIcon,
  MenuIcon,
  CloseIcon
} from './components/Icons';

// Import styles
import { styles } from './styles';
import { API_BASE } from './config';

interface User {
  username: string;
  role: string;
}

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

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Orbitron_700Bold,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const storedToken = await AsyncStorage.getItem('token');
      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setToken(storedToken);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  async function handleLogin(loginData: { token: string; username: string; role: string }) {
    const userData = { username: loginData.username, role: loginData.role };
    setUser(userData);
    setToken(loginData.token);
    setIsAuthenticated(true);
    setShowAuth(false);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    await AsyncStorage.setItem('token', loginData.token);
  }

  async function handleLogout() {
    setUser(null);
    setIsAuthenticated(false);
    setShowAuth(false);
    await AsyncStorage.removeItem('user');
  }

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <StatusBar style="light" backgroundColor="#0a0a12" />
          {!isAuthenticated && !showAuth ? (
            <HomeScreen onShowAuth={() => setShowAuth(true)} />
          ) : !isAuthenticated && showAuth ? (
            <AuthScreen onLogin={handleLogin} onBack={() => setShowAuth(false)} />
          ) : (
            <MainApp user={user!} token={token} onLogout={handleLogout} />
          )}
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

function AuthScreen({ onLogin, onBack }: { onLogin: (loginData: { token: string; username: string; role: string }) => void; onBack: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [signupRole, setSignupRole] =
    useState<'agent' | 'cashier' | 'admin'>('agent');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Login failed');
        return;
      }

      console.log('✅ Backend connected successfully - Login response:', data);
      onLogin(data);
    } catch {
      alert('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!username.trim() || !password) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
          role: signupRole
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Signup failed');
        return;
      }
     console.log('✅ Backend connected successfully - Signup response:', data);
      onLogin(data);
    } catch {
      alert('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.authWrapper}>
      <View style={styles.authBox}>
        <CornerAccents color="#6366f1" size={12} thickness={2} />

        {/* Back Button */}
        <TouchableOpacity 
          style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}
          onPress={onBack}
        >
          <Text style={{ color: '#6366f1', fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.authTitle}>
          <Text style={styles.brand}>Ballio</Text>
        </Text>
        <Text style={styles.authSubtitle}>Secure Transaction System</Text>

        <View style={styles.authTabs}>
          <TouchableOpacity
            style={[styles.authTab, isLogin && styles.authTabActive]}
            onPress={() => setIsLogin(true)}
          >
            <Text style={[styles.authTabText, isLogin && styles.authTabTextActive]}>
              Log In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.authTab, !isLogin && styles.authTabActive]}
            onPress={() => setIsLogin(false)}
          >
            <Text style={[styles.authTabText, !isLogin && styles.authTabTextActive]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {!isLogin && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Role</Text>

            <Picker
              selectedValue={signupRole}
              onValueChange={(v) => setSignupRole(v)}
              style={{ color: '#000', backgroundColor: '#fff' }}
              dropdownIconColor="#000"
            >
              <Picker.Item label="Agent" value="agent" color="#000" />
              <Picker.Item label="Cashier" value="cashier" color="#000" />
              <Picker.Item label="Admin" value="admin" color="#000" />
            </Picker>
          </View>
        )}

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={isLogin ? handleLogin : handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnPrimaryText}>
              {isLogin ? 'Log In' : 'Create Account'}
            </Text>
          )}
        </TouchableOpacity>

      </View>
    </View>
  );
}

function MainApp({ user, token, onLogout }: { user: User; token: string | null; onLogout: () => void }) {
  const insets = useSafeAreaInsets();

  const [currentView, setCurrentView] = useState<string>(
    user.role === 'agent'
      ? 'topup'
      : user.role === 'cashier'
      ? 'payment'
      : 'dashboard'
  );

  const [scannedCard, setScannedCard] = useState<Card | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [isOnline, setIsOnline] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    loadProducts();
    setIsOnline(true);
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/products`);
      setProducts(await response.json());
    } catch {
      setProducts([]);
    }
  };

  const handleTopup = async (uid: string, amount: number) => {
    const response = await fetch(`${API_BASE}/topup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, amount })
    });

    if (!response.ok) throw new Error('Top-up failed');
  };

  const handlePay = async (items: { productId: number; quantity: number }[]) => {
    const response = await fetch(`${API_BASE}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: scannedCard?.uid, items })
    });

    const data = await response.json();

    if (!response.ok || data.status !== 'approved') {
      throw new Error(data.error || 'Payment failed');
    }
  };

  const toggleProduct = (productId: number) => {
    setCart(prev => {
      const newCart = { ...prev };

      if (newCart[productId]) delete newCart[productId];
      else newCart[productId] = 1;

      return newCart;
    });
  };

  const setCartQty = (productId: number, qty: number) => {
    setCart(prev => ({ ...prev, [productId]: Math.max(1, qty) }));
  };

  const getCartItems = (): CartItem[] => {
    return Object.entries(cart)
      .map(([id, qty]) => {
        const product = products.find(p => p.id === Number(id));

        return product
          ? { product, quantity: qty, lineCost: product.price * qty }
          : null;
      })
      .filter(Boolean) as CartItem[];
  };

  const getCartTotal = () =>
    getCartItems().reduce((sum, item) => sum + item.lineCost, 0);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardScreen token={token} />;

      case 'topup':
        return (
          <TopupScreen
            scannedCard={scannedCard}
            setScannedCard={setScannedCard}
            onTopup={handleTopup}
          />
        );

      case 'payment':
        return (
          <PaymentsScreen
            products={products}
            cart={cart}
            scannedCard={scannedCard}
            setScannedCard={setScannedCard}
            onToggleProduct={toggleProduct}
            onSetCartQty={setCartQty}
            onPay={handlePay}
            getCartItems={getCartItems}
            getCartTotal={getCartTotal}
          />
        );

      case 'products':
        return (
          <ProductsScreen
            products={products}
            onLoadProducts={loadProducts}
            setProducts={setProducts}
          />
        );

      case 'transactions':
        return <TransactionsScreen />;

      case 'cards':
        return <CardsScreen />;

      default:
        return <DashboardScreen token={token}/>;
    }
  };

  // Navigation items based on role
  const getNavItems = () => {
    const items = [];
    
    // Admin gets all views
    if (user.role === 'admin') {
      items.push(
        { key: 'dashboard', label: 'Dashboard', IconComponent: DashboardIcon },
        { key: 'topup', label: 'Top-Up', IconComponent: TopUpIcon },
        { key: 'payment', label: 'Payment', IconComponent: PaymentIcon },
        { key: 'products', label: 'Products', IconComponent: ProductsIcon },
        { key: 'transactions', label: 'Transactions', IconComponent: TransactionsIcon },
        { key: 'cards', label: 'Cards', IconComponent: CardsIcon }
      );
    }
    // Agent gets top-up and cards
    else if (user.role === 'agent') {
      items.push(
        { key: 'topup', label: 'Top-Up', IconComponent: TopUpIcon },
        { key: 'cards', label: 'Cards', IconComponent: CardsIcon }
      );
    }
    // Cashier gets only payment
    else if (user.role === 'cashier') {
      items.push(
        { key: 'payment', label: 'Payment', IconComponent: PaymentIcon }
      );
    }
    
    return items;
  };

  const navItems = getNavItems();

  const onSwipeGesture = (event: any) => {
    const { translationX, x } = event.nativeEvent;
    
    // Only respond to swipes from the left edge (first 50px) to open menu
    if (x < 50 && translationX > 100 && !menuOpen) {
      setMenuOpen(true);
    }
    // Swipe left to close menu (only when menu is open)
    else if (translationX < -100 && menuOpen) {
      setMenuOpen(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Status Bar Background */}
      <View style={[styles.statusBarBackground, { height: insets.top }]} />
      
      <View style={styles.appLayout}>

        {/* Edge Swipe Area for Menu */}
        <PanGestureHandler 
          onGestureEvent={onSwipeGesture}
          activeOffsetX={[-10, 10]}
          failOffsetY={[-20, 20]}
        >
          <View style={styles.edgeSwipeArea} />
        </PanGestureHandler>

      {/* Mobile Header */}
      <View style={styles.mobileHeader}>
        <TouchableOpacity 
          style={styles.hamburgerButton}
          onPress={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <CloseIcon size={24} color="#fff" />
          ) : (
            <MenuIcon size={24} color="#fff" />
          )}
        </TouchableOpacity>
        
        <Text style={styles.mobileHeaderTitle}>
          <Text style={styles.brand}>Ballio</Text>
          <Text style={styles.titleRest}> — RFID Wallet System</Text>
        </Text>
        
        <View style={styles.mobileHeaderRight}>
          <View style={[styles.statusDot, isOnline && styles.statusDotOnline]} />
        </View>
      </View>

      {/* Sidebar / Mobile Menu */}
      <View style={[styles.sidebar, menuOpen && styles.sidebarOpen]}>

        {/* User Info */}
        <View style={styles.sidebarHeader}>
          <View style={styles.userInfoSection}>
            <View style={styles.userIconWrapper}>
              <UserIcon size={20} color="#6366f1" />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user.username}</Text>
              <Text style={[styles.userRole, user.role ? styles[`userRole${user.role.charAt(0).toUpperCase() + user.role.slice(1)}` as keyof typeof styles] : styles.userRole]}>
                {user.role?.toUpperCase() || 'UNKNOWN'}
              </Text>
            </View>
          </View>
          
          {/* Connection Status */}
          <View style={[styles.connStatusBadge, isOnline ? styles.connStatusOnline : styles.connStatusOffline]}>
            <View style={[styles.connStatusDot, isOnline && styles.connStatusDotActive]} />
            <Text style={styles.connStatusText}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </Text>
          </View>
        </View>

        {/* Navigation Items */}
        <View style={styles.sidebarNav}>
          {navItems.map(item => {
            const IconComponent = item.IconComponent;
            const isActive = currentView === item.key;
            
            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.navItem,
                  isActive && styles.navItemActive
                ]}
                onPress={() => {
                  setCurrentView(item.key);
                  setScannedCard(null);
                  setCart({});
                  setMenuOpen(false);
                }}
              >
                <IconComponent 
                  size={18} 
                  color={isActive ? '#6366f1' : '#8888aa'} 
                />
                <Text style={[
                  styles.navItemText,
                  isActive && styles.navItemTextActive
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Logout Button */}
        <View style={styles.sidebarFooter}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={() => {
              setMenuOpen(false);
              onLogout();
            }}
          >
            <LogoutIcon size={18} color="#8888aa" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* Overlay for mobile menu */}
      {menuOpen && (
        <TouchableOpacity 
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuOpen(false)}
        />
      )}

        <View style={styles.mainContent}>
          {renderCurrentView()}
        </View>

      </View>
    </SafeAreaView>
  );
}