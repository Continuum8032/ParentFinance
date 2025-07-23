// Глобальные переменные
let mamcoins = 0;
let pavlushi = 0;
let history = [];
let isLoading = true;
let db = null;
// Константа флага пользователя - для разных детей используйте разные флаги
const USER_FLAG = 'Ksusha'; // Для других детей: 'Nestor', 'Vadimus' и т.д.

// ID пользователя включает флаг для уникальности
let userId = `family_child_${USER_FLAG.toLowerCase()}`;

// ГЛОБАЛЬНЫЕ ФУНКЦИИ ДЛЯ HTML onclick - ОБЪЯВЛЯЕМ СРАЗУ!

function showEarnModal() {
  console.log('🦊 Показываем модальное окно заработка');
  const modal = document.getElementById('earnModal');
  if (modal) {
    modal.style.display = 'block';
  } else {
    console.error('❌ Модальное окно earnModal не найдено');
  }
}

function showSpendModal() {
  console.log('🦊 Показываем модальное окно штрафа');
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

  console.log(`✅ Заработал: ${text} (+${value} павлушей)`);

  pavlushi += value;
  convertPavlushi();
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

  console.log(`❌ Штраф: ${text} (-${value} павлушей/мамкоинов)`);

  if (value >= 100) {
    const mamcoinsToRemove = Math.floor(value / 10);
    if (mamcoins >= mamcoinsToRemove) {
      mamcoins -= mamcoinsToRemove;
    } else {
      const totalPavlushi = mamcoins * 10 + pavlushi;
      if (totalPavlushi >= value) {
        const remainingPavlushi = totalPavlushi - value;
        mamcoins = Math.floor(remainingPavlushi / 10);
        pavlushi = remainingPavlushi % 10;
      } else {
        mamcoins = 0;
        pavlushi = 0;
      }
    }
  } else {
    if (pavlushi >= value) {
      pavlushi -= value;
    } else {
      const totalPavlushi = mamcoins * 10 + pavlushi;
      if (totalPavlushi >= value) {
        const remainingPavlushi = totalPavlushi - value;
        mamcoins = Math.floor(remainingPavlushi / 10);
        pavlushi = remainingPavlushi % 10;
      } else {
        mamcoins = 0;
        pavlushi = 0;
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

  const mamcoinsNeeded = Math.floor(value / 10);
  const totalMamcoins = mamcoins + Math.floor(pavlushi / 10);

  if (totalMamcoins < mamcoinsNeeded) {
    alert(`Недостаточно мамкоинов! Нужно: ${mamcoinsNeeded}, есть: ${totalMamcoins}`);
    return;
  }

  console.log(`🛒 Покупка: ${text} (-${mamcoinsNeeded} мамкоинов)`);

  const totalPavlushi = mamcoins * 10 + pavlushi;
  const remainingPavlushi = totalPavlushi - value;

  mamcoins = Math.floor(remainingPavlushi / 10);
  pavlushi = remainingPavlushi % 10;

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
          mamcoins: data.mamcoins,
          pavlushi: data.pavlushi,
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
        const newMamcoins = data.mamcoins || 0;
        const newPavlushi = data.pavlushi || 0;
        const newHistory = data.history || [];
        
        // Обновляем только если данные изменились
        if (newMamcoins !== mamcoins || newPavlushi !== pavlushi || 
            JSON.stringify(newHistory) !== JSON.stringify(history)) {
          
          mamcoins = newMamcoins;
          pavlushi = newPavlushi;
          history = newHistory;
          
          console.log(`💰 Синхронизировано с Firebase (${USER_FLAG}): ${mamcoins} мамкоинов, ${pavlushi} павлушей`);
          
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
      mamcoins: mamcoins,
      pavlushi: pavlushi,
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
      mamcoins: mamcoins,
      pavlushi: pavlushi,
      history: history,
      lastActive: firebase.firestore.FieldValue.serverTimestamp(),
    };
    
    console.log(`💾 Сохраняем данные для ${USER_FLAG}:`, {
      userFlag: USER_FLAG,
      mamcoins: mamcoins,
      pavlushi: pavlushi,
      historyCount: history.length
    });
    
    // Используем set с merge, чтобы создать документ если его нет, или обновить существующий
    userDocRef.set(updateData, { merge: true }).then(() => {
      console.log(`💾 Синхронизировано с Firebase (${USER_FLAG}): ${mamcoins} мамкоинов, ${pavlushi} павлушей`);
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
  const savedMamcoins = localStorage.getItem(`mamcoins_${USER_FLAG}`);
  const savedPavlushi = localStorage.getItem(`pavlushi_${USER_FLAG}`);
  const savedHistory = localStorage.getItem(`history_${USER_FLAG}`);

  if (savedMamcoins !== null) {
    mamcoins = parseInt(savedMamcoins) || 0;
  }

  if (savedPavlushi !== null) {
    pavlushi = parseInt(savedPavlushi) || 0;
  }

  if (savedHistory) {
    try {
      history = JSON.parse(savedHistory) || [];
    } catch (e) {
      history = [];
    }
  }

  console.log(`📱 Загружено из localStorage (${USER_FLAG}): ${mamcoins} мамкоинов, ${pavlushi} павлушей`);
}

function saveToLocalStorage() {
  localStorage.setItem(`mamcoins_${USER_FLAG}`, mamcoins.toString());
  localStorage.setItem(`pavlushi_${USER_FLAG}`, pavlushi.toString());
  localStorage.setItem(`history_${USER_FLAG}`, JSON.stringify(history));
  
  console.log(`📱 Сохранено в localStorage (${USER_FLAG}): ${mamcoins} мамкоинов, ${pavlushi} павлушей`);
}

// Обновление отображения
function updateDisplay() {
  const mamcoinsEl = document.getElementById('mamcoins');
  const pavlushiEl = document.getElementById('pavlushi');
  
  if (mamcoinsEl) mamcoinsEl.textContent = mamcoins;
  if (pavlushiEl) pavlushiEl.textContent = pavlushi;
}

// Конвертация павлушей в мамкоины
function convertPavlushi() {
  if (pavlushi >= 10) {
    const newMamcoins = Math.floor(pavlushi / 10);
    mamcoins += newMamcoins;
    pavlushi = pavlushi % 10;

    addToHistory(`🔄 Конвертация: ${newMamcoins} мамкоинов из павлушей`, 'earn');
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
window.mamcoinsDebug = {
  showData: () => console.log({ 
    userFlag: USER_FLAG,
    userId: userId,
    mamcoins, 
    pavlushi, 
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
  addMamcoins: (amount) => { 
    mamcoins += amount; 
    updateDisplay(); 
    saveToFirebase(); 
    console.log(`➕ Добавлено ${amount} мамкоинов`);
  },
  addPavlushi: (amount) => { 
    pavlushi += amount; 
    updateDisplay(); 
    saveToFirebase(); 
    console.log(`➕ Добавлено ${amount} павлушей`);
  },
  reset: () => { 
    if (confirm('Точно сбросить все данные?')) {
      mamcoins = 0; 
      pavlushi = 0; 
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
      if (key.startsWith('mamcoins_') || key.startsWith('pavlushi_') || key.startsWith('history_')) {
        const flag = key.split('_')[1];
        userFlags.add(flag);
      }
    });
    
    if (userFlags.size === 0) {
      console.log('Нет сохраненных пользователей');
      return;
    }
    
    userFlags.forEach(flag => {
      const mamcoins = localStorage.getItem(`mamcoins_${flag}`) || '0';
      const pavlushi = localStorage.getItem(`pavlushi_${flag}`) || '0';
      const history = localStorage.getItem(`history_${flag}`);
      let historyCount = 0;
      try {
        historyCount = history ? JSON.parse(history).length : 0;
      } catch (e) {
        historyCount = 0;
      }
      
      console.log(`🦊 ${flag}: ${mamcoins} мамкоинов, ${pavlushi} павлушей, ${historyCount} записей истории`);
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
        console.log(`🦊 ${data.userFlag || 'НЕТ ФЛАГА'} (ID: ${doc.id}): ${data.mamcoins || 0} мамкоинов, ${data.pavlushi || 0} павлушей, ${(data.history || []).length} записей истории`);
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
          mamcoins: data.mamcoins,
          pavlushi: data.pavlushi,
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
  console.log('🦊 Запускаем систему мамкоинов...');
  
  // СНАЧАЛА загружаем из localStorage мгновенно
  loadFromLocalStorage();
  updateDisplay();
  loadHistory();
  console.log('📱 Данные из localStorage загружены мгновенно');
  
  // Показываем что интерфейс готов
  isLoading = false;
  updateSyncStatus('offline', '📱 Локальные данные');
  
  setTimeout(() => {
    window.mamcoinsDebug.testElements();
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

console.log(`🦊 Система мамкоинов для ${USER_FLAG} с Firebase v8 готова! Команды отладки: window.mamcoinsDebug`); 
