<template>
  <div class="app-container">
    <div class="glass-card">
      
      <!-- Top Navigation -->
      <header class="top-nav">
        <div class="logo">
          <h1>Metu Tracker</h1>
        </div>
        <button v-if="isAuthenticated" @click="isDrawerOpen = true" class="profile-btn" aria-label="Open Profile">
          <div class="avatar">{{ user?.username.charAt(0).toUpperCase() }}</div>
        </button>
      </header>

      <!-- DRAWER OVERLAY & MENU -->
      <div v-if="isDrawerOpen" class="drawer-overlay" @click="isDrawerOpen = false"></div>
      <div class="drawer" :class="{ 'drawer-open': isDrawerOpen }">
        <div class="drawer-header">
          <h2>Profile</h2>
          <button class="close-btn" @click="isDrawerOpen = false">✕</button>
        </div>
        <div class="drawer-content">
          <div class="profile-info">
            <div class="avatar large">{{ user?.username.charAt(0).toUpperCase() }}</div>
            <p class="username">@{{ user?.username }}</p>
          </div>
          <button @click="logoutAndClose" class="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div class="header-text" v-if="!isAuthenticated">
        <p>Please login to continue</p>
      </div>

      <!-- LOGIN FORM -->
      <form v-if="!isAuthenticated" @submit.prevent="login" class="expense-form">
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

      <!-- EXPENSE FORM -->
      <div v-else>
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
</template>

<script setup>
import { ref, onMounted } from 'vue';

const isAuthenticated = ref(false);
const user = ref(null);
const isDrawerOpen = ref(false);

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
    }
  } catch (e) {
    console.error('Session check failed', e);
  }
};

onMounted(() => {
  checkSession();
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
    isDrawerOpen.value = false;
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
