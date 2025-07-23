// Глобальные переменные
let nestor = 0;
let vadimus = 0;
let history = [];
let isLoading = true;
let db = null;
// Константа флага пользователя - для разных детей используйте разные флаги
const USER_FLAG = 'Ksusha'; // Для других детей: 'Nestor', 'Vadimus' и т.д.

// ID пользователя включает флаг для уникальности
let userId = `family_child_${USER_FLAG.toLowerCase()}`;

// ГЛОБАЛЬНЫЕ ФУНКЦИИ ДЛЯ HTML onclick - ОБЪЯВЛЯЕМ СРАЗУ!

function showEarnModal() {
  console.log('🦊 Показываем модальное окно Лисичка Сахарочек');
  const modal = document.getElementById('earnModal');
  if (modal) {
    modal.style.display = 'block';
  } else {
    console.error('❌ Модальное окно earnModal не найдено');
  }
}

function showSpendModal() {
  console.log('🦊 Показываем модальное окно Лисичка Тролл');
  const modal = document.getElementById('spendModal');
  if (modal) {
    modal.style.display = 'block';
  } else {
    console.error('❌ Модальное окно spendModal не найдено');
  }
}

function showShopModal() {
  console.log('🦊 Показываем модальное окно магазина');
  const modal = document.getElementById('shopModal');
  if (modal) {
    modal.style.display = 'block';
  } else {
    console.error('❌ Модальное окно shopModal не найдено');
  }
}

function closeModal(modalId) {
  console.log(`🦊 Закрываем модальное окно: ${modalId}`);
  
  if (!modalId) {
    console.error('❌ modalId не передан в closeModal');
    return;
  }
  
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';

    const selectors = {
      earnModal: 'earnAction',
      spendModal: 'spendAction',
      shopModal: 'shopAction',
    };

    if (selectors[modalId]) {
      const selectElement = document.getElementById(selectors[modalId]);
      if (selectElement) {
        selectElement.value = '';
      }
    }
  } else {
    console.error(`❌ Модальное окно ${modalId} не найдено`);
  }
}

function confirmEarn() {
  const select = document.getElementById('earnAction');
  if (!select) {
    console.error('❌ Элемент earnAction не найден');
    return;
  }
  
  const value = parseInt(select.value);
  const text = select.options[select.selectedIndex].text;

  if (!value || !text || value <= 0) {
    alert('Выберите действие!');
    return;
  }

  console.log(`✅ Заработал: ${text} (+${value} вадимусов)`);

  vadimus += value;
  convertVadimus();
  addToHistory(`✅ ${text}`, 'earn');
  updateDisplay();
  closeModal('earnModal');
}

function confirmSpend() {
  const select = document.getElementById('spendAction');
  if (!select) {
    console.error('❌ Элемент spendAction не найден');
    return;
  }
  
  const value = parseInt(select.value);
  const text = select.options[select.selectedIndex].text;

  if (!value || !text || value <= 0) {
    alert('Выберите проступок!');
    return;
  }

  console.log(`❌ Штраф: ${text} (-${value} вадимусов/несторкоинов)`);

  if (value >= 100) {
    const nestorToRemove = Math.floor(value / 10);
    if (nestor >= nestorToRemove) {
      nestor -= nestorToRemove;
    } else {
      const totalVadimus = nestor * 10 + vadimus;
      if (totalVadimus >= value) {
        const remainingVadimus = totalVadimus - value;
        nestor = Math.floor(remainingVadimus / 10);
        vadimus = remainingVadimus % 10;
      } else {
        nestor = 0;
        vadimus = 0;
      }
    }
  } else {
    if (vadimus >= value) {
      vadimus -= value;
    } else {
      const totalVadimus = nestor * 10 + vadimus;
      if (totalVadimus >= value) {
        const remainingVadimus = totalVadimus - value;
        nestor = Math.floor(remainingVadimus / 10);
        vadimus = remainingVadimus % 10;
      } else {
        nestor = 0;
        vadimus = 0;
      }
    }
  }

  addToHistory(`❌ ${text}`, 'spend');
  updateDisplay();
  closeModal('spendModal');
}

function confirmShop() {
  const select = document.getElementById('shopAction');
  if (!select) {
    console.error('❌ Элемент shopAction не найден');
    return;
  }
  
  const value = parseInt(select.value);
  const text = select.options[select.selectedIndex].text;

  if (!value || !text || value <= 0) {
    alert('Выберите награду!');
    return;
  }

  const nestorNeeded = Math.floor(value / 10);
  const totalNestor = nestor + Math.floor(vadimus / 10);

  if (totalNestor < nestorNeeded) {
    alert(`Недостаточно несторкоинов! Нужно: ${nestorNeeded}, есть: ${totalNestor}`);
    return;
  }

  console.log(`🛒 Покупка: ${text} (-${nestorNeeded} несторкоинов)`);

  const totalVadimus = nestor * 10 + vadimus;
  const remainingVadimus = totalVadimus - value;

  nestor = Math.floor(remainingVadimus / 10);
  vadimus = remainingVadimus % 10;

  addToHistory(`🛒 Купил: ${text}`, 'shop');
  updateDisplay();
  closeModal('shopModal');
}

// ALIAS для совместимости
function addEarning() {
  console.warn('⚠️ Используется устаревшая функция addEarning, используйте confirmEarn');
  confirmEarn();
}

function addSpending() {
  console.warn('⚠️ Используется устаревшая функция addSpending, используйте confirmSpend');
  confirmSpend();
}

function addShopping() {
  console.warn('⚠️ Используется устаревшая функция addShopping, используйте confirmShop');
  confirmShop();
}

console.log('🦊 Глобальные функции загружены!');

// Функции для управления статусом синхронизации
function updateSyncStatus(status, message) {
  const statusEl = document.getElementById('sync-status');
  if (!statusEl) return;
  
  statusEl.className = `sync-status ${status}`;
  statusEl.textContent = message;
}

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyB8i6XUdNv8XdMEtip7mMBZe_f1-6MuawE',
  authDomain: 'mamcoins-tracker.firebaseapp.com',
  projectId: 'mamcoins-tracker',
  storageBucket: 'mamcoins-tracker.firebasestorage.app',
  messagingSenderId: '655371831130',
  appId: '1:655371831130:web:1bd473c42b14cb4bd15563',
};

// Инициализация Firebase v8
function initializeFirebase() {
  updateSyncStatus('syncing', '🔄 Подключаемся к облаку...');
  
  try {
    console.log('🔥 Инициализируем Firebase v8...');
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log('✅ Firebase v8 инициализирован');
    
    // Запускаем синхронизацию с таймаутом
    startDataListenerWithTimeout();
    
  } catch (error) {
    console.error('❌ Ошибка инициализации Firebase:', error);
    console.log('📱 Работаем только с localStorage');
    updateSyncStatus('offline', '📱 Только локально');
    isLoading = false;
  }
}

// Слушатель изменений данных Firebase с таймаутом и фильтрацией по флагу
function startDataListenerWithTimeout() {
  try {
    // Используем query для фильтрации данных по userFlag
    const usersQuery = db.collection('users').where('userFlag', '==', USER_FLAG);
    
    // Устанавливаем таймаут на подключение к Firebase
    let syncTimeout = setTimeout(() => {
      console.log('⏰ Firebase медленный, продолжаем с localStorage');
      updateSyncStatus('offline', '📱 Медленный интернет');
      isLoading = false;
      updateDisplay();
      loadHistory();
    }, 3000); // 3 секунды таймаут
    
    // Слушаем изменения в реальном времени с фильтрацией по флагу
    usersQuery.onSnapshot((querySnapshot) => {
      // Отменяем таймаут - Firebase загрузился
      clearTimeout(syncTimeout);
      
      console.log(`🔍 Найдено документов с флагом ${USER_FLAG}: ${querySnapshot.size}`);
      
      if (!querySnapshot.empty) {
        // Берем первый (и должен быть единственный) документ с нашим флагом
        const docSnapshot = querySnapshot.docs[0];
        const data = docSnapshot.data();
        
        console.log(`📥 Загружены данные для пользователя ${USER_FLAG}:`, {
          userFlag: data.userFlag,
          nestor: data.nestor,
          vadimus: data.vadimus,
          historyCount: (data.history || []).length
        });
        
        // Дополнительная проверка флага (на всякий случай)
        if (data.userFlag !== USER_FLAG) {
          console.error(`❌ Несоответствие флага! Ожидался: ${USER_FLAG}, получен: ${data.userFlag}`);
          createNewUser();
          updateSyncStatus('synced', '☁️ Новый профиль создан');
          isLoading = false;
          return;
        }
        
        // Проверяем, изменились ли данные
        const newNestor = data.nestor || 0;
        const newVadimus = data.vadimus || 0;
        const newHistory = data.history || [];
        
        // Обновляем только если данные изменились
        if (newNestor !== nestor || newVadimus !== vadimus || 
            JSON.stringify(newHistory) !== JSON.stringify(history)) {
          
          nestor = newNestor;
          vadimus = newVadimus;
          history = newHistory;
          
          console.log(`💰 Синхронизировано с Firebase (${USER_FLAG}): ${nestor} несторкоинов, ${vadimus} вадимусов`);
          
          // Обновляем localStorage для быстрого доступа в следующий раз
          saveToLocalStorage();
          updateDisplay();
          loadHistory();
        }
        
        updateSyncStatus('synced', '☁️ Синхронизировано');
        
      } else {
        console.log(`👶 Нет данных для пользователя ${USER_FLAG}, создаем нового`);
        createNewUser();
        updateSyncStatus('synced', '☁️ Новый профиль создан');
      }
      
      isLoading = false;
      
    }, (error) => {
      clearTimeout(syncTimeout);
      console.error('❌ Ошибка подключения к Firebase:', error);
      console.log('📱 Работаем с localStorage');
      updateSyncStatus('offline', '📱 Нет подключения');
      isLoading = false;
      updateDisplay();
      loadHistory();
    });
    
  } catch (error) {
    console.error('❌ Ошибка настройки слушателя Firebase:', error);
    updateSyncStatus('offline', '📱 Ошибка подключения');
    isLoading = false;
    updateDisplay();
    loadHistory();
  }
}

// Создание нового пользователя в Firebase (неблокирующее)
function createNewUser() {
  try {
    // Создаем документ с уникальным ID, но обязательно с флагом пользователя
    const userDocRef = db.collection('users').doc(userId);
    
    const userData = {
      userFlag: USER_FLAG,
      userId: userId,
      nestor: nestor,
      vadimus: vadimus,
      history: history,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastActive: firebase.firestore.FieldValue.serverTimestamp(),
    };
    
    console.log(`📝 Создаем нового пользователя с данными:`, userData);
    
    userDocRef.set(userData).then(() => {
      console.log(`✅ Новый пользователь создан в Firebase с флагом: ${USER_FLAG}`);
    }).catch((error) => {
      console.error('❌ Ошибка создания пользователя:', error);
    });
    
  } catch (error) {
    console.error('❌ Ошибка создания пользователя:', error);
  }
}

// Сохранение в Firebase (неблокирующее)
function saveToFirebase() {
  // Всегда сохраняем в localStorage немедленно
  saveToLocalStorage();
  
  if (!db) {
    console.log('⏳ Firebase недоступен, сохранили только локально');
    updateSyncStatus('offline', '📱 Сохранено локально');
    return;
  }
  
  try {
    const userDocRef = db.collection('users').doc(userId);
    
    const updateData = {
      userFlag: USER_FLAG,
      userId: userId,
      nestor: nestor,
      vadimus: vadimus,
      history: history,
      lastActive: firebase.firestore.FieldValue.serverTimestamp(),
    };
    
    console.log(`💾 Сохраняем данные для ${USER_FLAG}:`, {
      userFlag: USER_FLAG,
      nestor: nestor,
      vadimus: vadimus,
      historyCount: history.length
    });
    
    // Используем set с merge, чтобы создать документ если его нет, или обновить существующий
    userDocRef.set(updateData, { merge: true }).then(() => {
      console.log(`💾 Синхронизировано с Firebase (${USER_FLAG}): ${nestor} несторкоинов, ${vadimus} вадимусов`);
      updateSyncStatus('synced', '☁️ Синхронизировано');
    }).catch((error) => {
      console.error('❌ Ошибка синхронизации с Firebase:', error);
      console.log('📱 Данные сохранены локально');
      updateSyncStatus('offline', '📱 Сохранено локально');
    });
    
  } catch (error) {
    console.error('❌ Ошибка синхронизации с Firebase:', error);
    updateSyncStatus('offline', '📱 Ошибка синхронизации');
  }
}

// Fallback методы для localStorage с учетом флага пользователя
function loadFromLocalStorage() {
  const savedNestor = localStorage.getItem(`nestor_${USER_FLAG}`);
  const savedVadimus = localStorage.getItem(`vadimus_${USER_FLAG}`);
  const savedHistory = localStorage.getItem(`history_${USER_FLAG}`);

  if (savedNestor !== null) {
    nestor = parseInt(savedNestor) || 0;
  }

  if (savedVadimus !== null) {
    vadimus = parseInt(savedVadimus) || 0;
  }

  if (savedHistory) {
    try {
      history = JSON.parse(savedHistory) || [];
    } catch (e) {
      history = [];
    }
  }

  console.log(`📱 Загружено из localStorage (${USER_FLAG}): ${nestor} несторкоинов, ${vadimus} вадимусов`);
}

function saveToLocalStorage() {
  localStorage.setItem(`nestor_${USER_FLAG}`, nestor.toString());
  localStorage.setItem(`vadimus_${USER_FLAG}`, vadimus.toString());
  localStorage.setItem(`history_${USER_FLAG}`, JSON.stringify(history));
  
  console.log(`📱 Сохранено в localStorage (${USER_FLAG}): ${nestor} несторкоинов, ${vadimus} вадимусов`);
}

// Обновление отображения
function updateDisplay() {
  const nestorEl = document.getElementById('nestor');
  const vadimusEl = document.getElementById('vadimus');
  
  if (nestorEl) nestorEl.textContent = nestor;
  if (vadimusEl) vadimusEl.textContent = vadimus;
}

// Конвертация вадимусов в несторкоины
function convertVadimus() {
  if (vadimus >= 10) {
    const newNestor = Math.floor(vadimus / 10);
    nestor += newNestor;
    vadimus = vadimus % 10;

    addToHistory(`🔄 Конвертация: ${newNestor} несторкоинов из вадимусов`, 'earn');
  }
}

// Добавление записи в историю
function addToHistory(text, type = 'earn') {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  const newHistoryItem = {
    text: text,
    time: timeStr,
    type: type,
    timestamp: now.getTime(),
  };

  history.unshift(newHistoryItem);

  if (history.length > 50) {
    history = history.slice(0, 50);
  }

  saveToFirebase();
  loadHistory();
}

// Загрузка истории
function loadHistory() {
  const historyList = document.getElementById('history-list');
  if (!historyList) return;

  historyList.innerHTML = '';
  
  // Убираем долгий индикатор загрузки - теперь всё быстро
  if (history.length === 0) {
    historyList.innerHTML = '<div class="history-item">🦊 Лисичка еще ничего не делала</div>';
    return;
  }

  history.forEach(item => {
    const div = document.createElement('div');
    div.className = `history-item ${item.type}`;
    div.innerHTML = `<strong>[${item.time}]</strong> ${item.text}`;
    historyList.appendChild(div);
  });
}

// Закрытие модальных окон по клику вне их
window.onclick = function (event) {
  const modals = ['earnModal', 'spendModal', 'shopModal'];

  modals.forEach(modalId => {
    const modal = document.getElementById(modalId);
    if (modal && event.target === modal) {
      closeModal(modalId);
    }
  });
};

// Функции для отладки
window.nestorDebug = {
  showData: () => console.log({ 
    userFlag: USER_FLAG,
    userId: userId,
    nestor, 
    vadimus, 
    history: history.slice(0, 5),
    totalHistory: history.length,
    isLoading, 
    firebaseConnected: !!db,
    elements: {
      earnModal: !!document.getElementById('earnModal'),
      spendModal: !!document.getElementById('spendModal'),
      shopModal: !!document.getElementById('shopModal'),
      earnAction: !!document.getElementById('earnAction'),
      spendAction: !!document.getElementById('spendAction'),
      shopAction: !!document.getElementById('shopAction')
    }
  }),
  addNestor: (amount) => { 
    nestor += amount; 
    updateDisplay(); 
    saveToFirebase(); 
    console.log(`➕ Добавлено ${amount} несторкоинов`);
  },
  addVadimus: (amount) => { 
    vadimus += amount; 
    updateDisplay(); 
    saveToFirebase(); 
    console.log(`➕ Добавлено ${amount} вадимусов`);
  },
  reset: () => { 
    if (confirm('Точно сбросить все данные?')) {
      nestor = 0; 
      vadimus = 0; 
      history = []; 
      updateDisplay(); 
      saveToFirebase();
      console.log('🔄 Все данные сброшены');
    }
  },
  forceSync: () => {
    saveToFirebase();
    console.log('🔄 Принудительная синхронизация');
  },
  testFirebase: () => {
    console.log('🔥 Тестируем Firebase подключение...');
    console.log('Firebase app:', typeof firebase !== 'undefined' ? '✅ Загружен' : '❌ Не загружен');
    console.log('Firestore:', db ? '✅ Подключен' : '❌ Не подключен');
    console.log('User Flag:', USER_FLAG);
    console.log('User ID:', userId);
    console.log('Loading state:', isLoading ? 'Загружается...' : 'Готов');
  },
  testElements: () => {
    console.log('🔍 Проверяем HTML элементы...');
    ['earnModal', 'spendModal', 'shopModal', 'earnAction', 'spendAction', 'shopAction'].forEach(id => {
      const el = document.getElementById(id);
      console.log(`${id}:`, el ? '✅ Найден' : '❌ НЕ найден');
    });
  },
  showAllUsers: () => {
    console.log('👥 Все пользователи в localStorage:');
    const allKeys = Object.keys(localStorage);
    const userFlags = new Set();
    
    allKeys.forEach(key => {
      if (key.startsWith('nestor_') || key.startsWith('vadimus_') || key.startsWith('history_')) {
        const flag = key.split('_')[1];
        userFlags.add(flag);
      }
    });
    
    if (userFlags.size === 0) {
      console.log('Нет сохраненных пользователей');
      return;
    }
    
    userFlags.forEach(flag => {
      const nestor = localStorage.getItem(`nestor_${flag}`) || '0';
      const vadimus = localStorage.getItem(`vadimus_${flag}`) || '0';
      const history = localStorage.getItem(`history_${flag}`);
      let historyCount = 0;
      try {
        historyCount = history ? JSON.parse(history).length : 0;
      } catch (e) {
        historyCount = 0;
      }
      
      console.log(`🦊 ${flag}: ${nestor} несторкоинов, ${vadimus} вадимусов, ${historyCount} записей истории`);
    });
  },
  switchUser: (newFlag) => {
    if (!newFlag) {
      console.log('❌ Необходимо указать флаг пользователя (например: "Ksusha")');
      return;
    }
    console.log(`🔄 Переключение на пользователя: ${newFlag}`);
    console.log('⚠️ Для переключения пользователя измените константу USER_FLAG в коде и перезагрузите страницу');
    console.log(`Установите: const USER_FLAG = '${newFlag}';`);
  },
  showFirebaseUsers: async () => {
    if (!db) {
      console.log('❌ Firebase не подключен');
      return;
    }
    
    try {
      console.log('🔥 Получаем всех пользователей из Firebase...');
      const snapshot = await db.collection('users').get();
      
      if (snapshot.empty) {
        console.log('📭 Нет пользователей в Firebase');
        return;
      }
      
      console.log(`👥 Найдено пользователей в Firebase: ${snapshot.size}`);
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`🦊 ${data.userFlag || 'НЕТ ФЛАГА'} (ID: ${doc.id}): ${data.nestor || 0} несторкоинов, ${data.vadimus || 0} вадимусов, ${(data.history || []).length} записей истории`);
      });
      
    } catch (error) {
      console.error('❌ Ошибка получения данных из Firebase:', error);
    }
  },
  showCurrentUserFirebase: async () => {
    if (!db) {
      console.log('❌ Firebase не подключен');
      return;
    }
    
    try {
      console.log(`🔍 Ищем данные для пользователя ${USER_FLAG} в Firebase...`);
      const snapshot = await db.collection('users').where('userFlag', '==', USER_FLAG).get();
      
      if (snapshot.empty) {
        console.log(`📭 Нет данных для пользователя ${USER_FLAG} в Firebase`);
        return;
      }
      
      console.log(`📥 Найдено документов для ${USER_FLAG}: ${snapshot.size}`);
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`📊 Данные ${USER_FLAG} в Firebase:`, {
          documentId: doc.id,
          userFlag: data.userFlag,
          nestor: data.nestor,
          vadimus: data.vadimus,
          historyCount: (data.history || []).length,
          createdAt: data.createdAt,
          lastActive: data.lastActive
        });
      });
      
    } catch (error) {
      console.error('❌ Ошибка получения данных из Firebase:', error);
    }
  }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
  console.log('🦊 Запускаем систему несторкоинов...');
  
  // СНАЧАЛА загружаем из localStorage мгновенно
  loadFromLocalStorage();
  updateDisplay();
  loadHistory();
  console.log('📱 Данные из localStorage загружены мгновенно');
  
  // Показываем что интерфейс готов
  isLoading = false;
  updateSyncStatus('offline', '📱 Локальные данные');
  
  setTimeout(() => {
    window.nestorDebug.testElements();
  }, 100);
  
  // ПОТОМ пытаемся подключиться к Firebase в фоне
  if (typeof firebase !== 'undefined') {
    console.log('✅ Firebase SDK загружен, начинаем синхронизацию...');
    setTimeout(() => {
      initializeFirebase();
    }, 500); // Даем время интерфейсу отрисоваться
  } else {
    console.error('❌ Firebase SDK не загружен, работаем только с localStorage');
    updateSyncStatus('offline', '📱 Только локально');
  }
});

console.log(`🦊 Система несторкоинов для ${USER_FLAG} с Firebase v8 готова! Команды отладки: window.nestorDebug`); 
