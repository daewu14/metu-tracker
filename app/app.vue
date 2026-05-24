<template>
  <div class="dashboard-layout" :class="{ 'sidebar-open': isSidebarOpen }">
    
    <!-- SIDEBAR -->
    <aside class="sidebar" v-if="isAuthenticated">
      <div class="sidebar-header">
        <div class="logo">
          <h2>Metu Tracker</h2>
        </div>
        <button class="close-sidebar-btn d-mobile" @click="isSidebarOpen = false">✕</button>
      </div>
      
      <div class="sidebar-content">
        <div class="profile-info">
          <div class="avatar large">{{ user?.username.charAt(0).toUpperCase() }}</div>
          <p class="username">@{{ user?.username }}</p>
        </div>
      </div>

      <div class="sidebar-footer">
        <button @click="logoutAndClose" class="logout-btn">
          Logout
        </button>
      </div>
    </aside>

    <!-- MOBILE OVERLAY -->
    <div v-if="isAuthenticated && isSidebarOpen" class="sidebar-overlay d-mobile" @click="isSidebarOpen = false"></div>

    <!-- MAIN AREA -->
    <main class="main-area">
      <!-- TOP NAV -->
      <header class="top-nav">
        <div class="nav-left">
          <button v-if="isAuthenticated" @click="isSidebarOpen = !isSidebarOpen" class="toggle-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <h1 class="mobile-title" v-if="!isAuthenticated">Metu Tracker</h1>
        </div>
      </header>

      <div class="app-container">
        <div class="glass-card">
          
          <!-- LOGIN FORM -->
          <div v-if="!isAuthenticated" class="auth-section">
            <div class="header-text">
              <h2>Welcome Back</h2>
              <p>Please login to continue</p>
            </div>
            <form @submit.prevent="login" class="expense-form">
              <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" v-model="loginForm.username" required />
              </div>
              <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" v-model="loginForm.password" required />
              </div>
              <button type="submit" :disabled="authLoading" class="submit-btn">
                <span v-if="authLoading">Logging in...</span>
                <span v-else>Login</span>
              </button>
              <div v-if="authMessage" class="message error">
                {{ authMessage }}
              </div>
            </form>
          </div>

          <!-- EXPENSE FORM -->
          <div v-else>
            <div class="header-text d-mobile" style="margin-bottom: 20px;">
              <h2>Add Expense</h2>
            </div>
            <form @submit.prevent="submitExpense" class="expense-form">
              <div class="form-group">
                <label for="date">Date & Time</label>
                <input type="datetime-local" id="date" v-model="form.date" required />
              </div>

              <div class="form-group">
                <label for="category">Category</label>
                <select id="category" v-model="form.category" required>
                  <option value="" disabled>Select category</option>
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Bills & Utilities">Bills & Utilities</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div class="form-group">
                <label for="amount">Amount (Rp)</label>
                <input type="tel" id="amount" :value="formattedAmount" @input="onAmountInput" placeholder="0" required />
              </div>

              <div class="form-group">
                <label for="description">Description</label>
                <textarea id="description" v-model="form.description" placeholder="What did you buy?" rows="3"></textarea>
              </div>

              <button type="submit" :disabled="loading" class="submit-btn">
                <span v-if="loading">Saving...</span>
                <span v-else>Save Expense</span>
              </button>

              <div v-if="message" :class="['message', isError ? 'error' : 'success']">
                {{ message }}
              </div>
            </form>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const isAuthenticated = ref(false);
const user = ref(null);
const isSidebarOpen = ref(true); // Default open for desktop

const loginForm = ref({ username: '', password: '' });
const authLoading = ref(false);
const authMessage = ref('');

const getLocalDatetime = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now - offset).toISOString().slice(0, 16);
};

const form = ref({
  date: getLocalDatetime(),
  amount: '',
  category: '',
  description: ''
});

const formattedAmount = ref('');

const onAmountInput = (e) => {
  let val = e.target.value.replace(/\D/g, '');
  if (val) {
    val = parseInt(val, 10).toString();
    form.value.amount = parseInt(val, 10);
    formattedAmount.value = val.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  } else {
    form.value.amount = '';
    formattedAmount.value = '';
  }
};

const loading = ref(false);
const message = ref('');
const isError = ref(false);

const checkSession = async () => {
  try {
    const res = await $fetch('/api/auth/session');
    if (res.authenticated) {
      isAuthenticated.value = true;
      user.value = res.user;
      
      // Auto close sidebar on mobile initial load
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        isSidebarOpen.value = false;
      }
    }
  } catch (e) {
    console.error('Session check failed', e);
  }
};

onMounted(() => {
  checkSession();
  
  // Set initial sidebar state based on screen size
  if (typeof window !== 'undefined') {
    isSidebarOpen.value = window.innerWidth >= 768;
    
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768 && isAuthenticated.value) {
        isSidebarOpen.value = true;
      } else {
        isSidebarOpen.value = false;
      }
    });
  }
});

const login = async () => {
  authLoading.value = true;
  authMessage.value = '';
  try {
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: loginForm.value
    });
    isAuthenticated.value = true;
    user.value = res.user;
    loginForm.value.password = '';
    
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      isSidebarOpen.value = true;
    }
  } catch (error) {
    authMessage.value = error.data?.statusMessage || 'Invalid credentials';
  } finally {
    authLoading.value = false;
  }
};

const logoutAndClose = async () => {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' });
    isAuthenticated.value = false;
    user.value = null;
    isSidebarOpen.value = false;
  } catch (error) {
    console.error('Logout failed', error);
  }
};

const submitExpense = async () => {
  loading.value = true;
  message.value = '';
  isError.value = false;

  try {
    const res = await $fetch('/api/expenses', {
      method: 'POST',
      body: form.value
    });

    message.value = res.message || 'Expense saved successfully!';
    form.value.amount = '';
    formattedAmount.value = '';
    form.value.category = '';
    form.value.description = '';
    
    setTimeout(() => {
      message.value = '';
    }, 3000);
  } catch (error) {
    isError.value = true;
    message.value = error.data?.statusMessage || 'Failed to save expense. Please try again.';
    
    if (error.data?.statusCode === 401) {
      isAuthenticated.value = false;
      user.value = null;
    }
  } finally {
    loading.value = false;
  }
};
</script>
