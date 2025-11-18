// Расширенная база данных книг (60+ книг для демонстрации пагинации)
const books = [
    {
        id: 1,
        title: "Политическая наука: современные подходы",
        author: "Иванов А.А., Петрова В.С.",
        year: 2023,
        category: "Учебник",
        cover: "📘",
        language: "русский",
        format: "PDF",
        file: "books/polit_nauka.pdf",
        size: "2.4 MB",
        pages: 345,
        description: "Современный учебник по политической науке, охватывающий основные теории и методологии."
    },
    {
        id: 2,
        title: "Теория международных отношений",
        author: "Сидоров К.М.",
        year: 2022,
        category: "Монография",
        cover: "📗",
        language: "русский",
        format: "PDF",
        file: "books/mezhdunarodnye.pdf",
        size: "3.1 MB",
        pages: 412,
        description: "Глубокий анализ современных международных отношений и политических процессов."
    },
    // Добавляем еще книги для демонстрации пагинации
    ...Array.from({length: 58}, (_, i) => ({
        id: i + 3,
        title: `Политология. Книга ${i + 1}`,
        author: `Автор ${String.fromCharCode(65 + (i % 26))}.${String.fromCharCode(65 + ((i + 1) % 26))}.`,
        year: 2020 + (i % 5),
        category: ["Учебник", "Монография", "Исследование", "Research"][i % 4],
        cover: ["📘", "📗", "📕", "📙", "📓", "📒"][i % 6],
        language: i % 3 === 0 ? "english" : "русский",
        format: ["PDF", "EPUB", "DJVU"][i % 3],
        file: `books/book_${i + 3}.pdf`,
        size: `${(1 + (i % 3)).toFixed(1)} MB`,
        pages: 200 + (i * 7) % 300,
        description: `Описание книги по политологии номер ${i + 1}. Эта книга охватывает важные аспекты политической науки.`
    }))
];

// Система пользователей
class UserSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users') || '[]');
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    }

    register(email, password, name) {
        if (this.users.find(u => u.email === email)) {
            throw new Error('Пользователь с таким email уже существует');
        }
        
        const user = { 
            email, 
            password, 
            name, 
            joined: new Date().toISOString() 
        };
        this.users.push(user);
        localStorage.setItem('users', JSON.stringify(this.users));
        return user;
    }

    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (!user) throw new Error('Неверный email или пароль');
        
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }
}

// Система избранного
class FavoritesSystem {
    constructor() {
        this.favorites = JSON.parse(localStorage.getItem('favorites') || '{}');
    }

    addToFavorites(userEmail, bookId) {
        if (!this.favorites[userEmail]) {
            this.favorites[userEmail] = [];
        }
        
        if (!this.favorites[userEmail].includes(bookId)) {
            this.favorites[userEmail].push(bookId);
            localStorage.setItem('favorites', JSON.stringify(this.favorites));
        }
    }

    removeFromFavorites(userEmail, bookId) {
        if (this.favorites[userEmail]) {
            this.favorites[userEmail] = this.favorites[userEmail].filter(id => id !== bookId);
            localStorage.setItem('favorites', JSON.stringify(this.favorites));
        }
    }

    getUserFavorites(userEmail) {
        return this.favorites[userEmail] || [];
    }

    isFavorite(userEmail, bookId) {
        return this.favorites[userEmail]?.includes(bookId) || false;
    }
}

// Система закладок
class BookmarkSystem {
    constructor() {
        this.bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '{}');
    }

    addBookmark(userEmail, bookId, currentPage) {
        if (!this.bookmarks[userEmail]) {
            this.bookmarks[userEmail] = {};
        }
        
        this.bookmarks[userEmail][bookId] = {
            currentPage: Math.max(1, Math.min(currentPage, books.find(b => b.id === bookId)?.pages || currentPage)),
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
    }

    removeBookmark(userEmail, bookId) {
        if (this.bookmarks[userEmail]) {
            delete this.bookmarks[userEmail][bookId];
            localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
        }
    }

    getBookmark(userEmail, bookId) {
        return this.bookmarks[userEmail] ? this.bookmarks[userEmail][bookId] : null;
    }

    getUserBookmarks(userEmail) {
        return this.bookmarks[userEmail] || {};
    }
}

// Система истории скачиваний
class DownloadSystem {
    constructor() {
        this.downloads = JSON.parse(localStorage.getItem('downloads') || '{}');
    }

    addDownload(userEmail, bookId) {
        if (!this.downloads[userEmail]) {
            this.downloads[userEmail] = [];
        }
        
        const downloadRecord = {
            bookId: bookId,
            timestamp: new Date().toISOString(),
            book: books.find(b => b.id === bookId)
        };
        
        this.downloads[userEmail].push(downloadRecord);
        localStorage.setItem('downloads', JSON.stringify(this.downloads));
    }

    getUserDownloads(userEmail) {
        return this.downloads[userEmail] || [];
    }
}

// Система пагинации
class PaginationSystem {
    constructor() {
        this.booksPerPage = 12; // Для демонстрации - 12 книг на страницу
        this.currentPage = 1;
    }

    getTotalPages(booksCount) {
        return Math.ceil(booksCount / this.booksPerPage);
    }

    getBooksForPage(booksList, page) {
        const startIndex = (page - 1) * this.booksPerPage;
        const endIndex = startIndex + this.booksPerPage;
        return booksList.slice(startIndex, endIndex);
    }

    setCurrentPage(page) {
        this.currentPage = page;
    }

    getCurrentPage() {
        return this.currentPage;
    }
}

// Система фильтрации с разделенным поиском
class BookFilter {
    constructor() {
        this.filters = {
            searchTitle: '',
            searchAuthor: '',
            year: '',
            language: '',
            format: '',
            category: ''
        };
    }

    applyFilters(booksList) {
        return booksList.filter(book => {
            // Поиск по названию
            if (this.filters.searchTitle) {
                const searchTerm = this.filters.searchTitle.toLowerCase();
                const matchesTitle = book.title.toLowerCase().includes(searchTerm);
                if (!matchesTitle) return false;
            }

            // Поиск по автору
            if (this.filters.searchAuthor) {
                const searchTerm = this.filters.searchAuthor.toLowerCase();
                const matchesAuthor = book.author.toLowerCase().includes(searchTerm);
                if (!matchesAuthor) return false;
            }

            // Фильтр по году
            if (this.filters.year && book.year != this.filters.year) {
                return false;
            }

            // Фильтр по языку
            if (this.filters.language && book.language !== this.filters.language) {
                return false;
            }

            // Фильтр по формату
            if (this.filters.format && book.format !== this.filters.format) {
                return false;
            }

            // Фильтр по категории
            if (this.filters.category && book.category !== this.filters.category) {
                return false;
            }

            return true;
        });
    }

    updateFilter(type, value) {
        this.filters[type] = value;
    }

    resetFilters() {
        this.filters = {
            searchTitle: '',
            searchAuthor: '',
            year: '',
            language: '',
            format: '',
            category: ''
        };
    }
}

// Инициализация фильтров с разделенным поиском
function setupFilters() {
    const searchTitleInput = document.getElementById('searchTitle');
    const searchAuthorInput = document.getElementById('searchAuthor');
    const yearFilter = document.getElementById('yearFilter');
    const languageFilter = document.getElementById('languageFilter');
    const formatFilter = document.getElementById('formatFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const resetButton = document.getElementById('resetFilters');

    if (searchTitleInput) {
        searchTitleInput.addEventListener('input', (e) => {
            bookFilter.updateFilter('searchTitle', e.target.value);
            loadBooks(books, 1);
        });
    }

    if (searchAuthorInput) {
        searchAuthorInput.addEventListener('input', (e) => {
            bookFilter.updateFilter('searchAuthor', e.target.value);
            loadBooks(books, 1);
        });
    }

    if (yearFilter) {
        yearFilter.addEventListener('change', (e) => {
            bookFilter.updateFilter('year', e.target.value);
            loadBooks(books, 1);
        });
    }

    if (languageFilter) {
        languageFilter.addEventListener('change', (e) => {
            bookFilter.updateFilter('language', e.target.value);
            loadBooks(books, 1);
        });
    }

    if (formatFilter) {
        formatFilter.addEventListener('change', (e) => {
            bookFilter.updateFilter('format', e.target.value);
            loadBooks(books, 1);
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            bookFilter.updateFilter('category', e.target.value);
            loadBooks(books, 1);
        });
    }

    if (resetButton) {
        resetButton.addEventListener('click', () => {
            bookFilter.resetFilters();
            // Сбрасываем значения всех полей
            if (searchTitleInput) searchTitleInput.value = '';
            if (searchAuthorInput) searchAuthorInput.value = '';
            if (yearFilter) yearFilter.value = '';
            if (languageFilter) languageFilter.value = '';
            if (formatFilter) formatFilter.value = '';
            if (categoryFilter) categoryFilter.value = '';
            loadBooks(books, 1);
            showNotification('Все фильтры сброшены', 'info');
        });
    }
}

// Инициализация систем
const userSystem = new UserSystem();
const favoritesSystem = new FavoritesSystem();
const bookmarkSystem = new BookmarkSystem();
const downloadSystem = new DownloadSystem();
const paginationSystem = new PaginationSystem();
const bookFilter = new BookFilter();

// Загрузка каталога книг с пагинацией
function loadBooks(booksToShow = books, page = 1) {
    const container = document.getElementById('booksContainer');
    const paginationContainer = document.getElementById('paginationContainer');
    if (!container) return;

    const filteredBooks = bookFilter.applyFilters(booksToShow);
    const totalPages = paginationSystem.getTotalPages(filteredBooks.length);
    
    // Корректируем текущую страницу, если она превышает общее количество страниц
    const currentPage = Math.min(page, totalPages) || 1;
    paginationSystem.setCurrentPage(currentPage);
    
    const booksForPage = paginationSystem.getBooksForPage(filteredBooks, currentPage);

    if (filteredBooks.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-light);">
                <h3>Книги не найдены</h3>
                <p>Попробуйте изменить параметры поиска или фильтры</p>
            </div>
        `;
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    // Отображаем книги для текущей страницы
    container.innerHTML = booksForPage.map(book => {
        const isFavorite = favoritesSystem.isFavorite(userSystem.currentUser?.email, book.id);
        const bookmark = bookmarkSystem.getBookmark(userSystem.currentUser?.email, book.id);
        const progress = bookmark ? Math.min(100, Math.round((bookmark.currentPage / book.pages) * 100)) : 0;
        
        return `
            <div class="book-card" data-book-id="${book.id}">
                <div class="book-cover">${book.cover}</div>
                <h4>${book.title}</h4>
                <p class="book-author">${book.author}</p>
                <div class="book-meta">
                    <span>${book.year} г.</span>
                    <span>${book.language}</span>
                </div>
                <div class="book-meta">
                    <span>${book.format}</span>
                    <span>${book.pages} стр.</span>
                </div>
                ${bookmark ? `
                <div class="reading-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="progress-text">
                        <span>Прочитано ${progress}%</span>
                        <span>Стр. ${bookmark.currentPage}/${book.pages}</span>
                    </div>
                </div>
                ` : ''}
                <p style="font-size: 0.875rem; color: var(--text-light); margin-bottom: 1rem;">
                    ${book.description}
                </p>
                <div class="book-actions">
                    <button class="btn btn-success" onclick="downloadBook(${book.id})">
                        📥 Скачать (${book.size})
                    </button>
                    <button class="btn btn-primary" onclick="addBookmark(${book.id})">
                        ${bookmark ? '📍 Продолжить' : '📖 Читать'}
                    </button>
                    <button class="btn btn-outline favorite-btn" onclick="toggleFavorite(${book.id})">
                        ${isFavorite ? '★' : '⭐'}
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Отображаем пагинацию
    if (paginationContainer && totalPages > 1) {
        renderPagination(paginationContainer, currentPage, totalPages, filteredBooks.length);
    } else if (paginationContainer) {
        paginationContainer.innerHTML = '';
    }
}

// Отрисовка пагинации
function renderPagination(container, currentPage, totalPages, totalBooks) {
    const startBook = (currentPage - 1) * paginationSystem.booksPerPage + 1;
    const endBook = Math.min(currentPage * paginationSystem.booksPerPage, totalBooks);
    
    let paginationHTML = `
        <div class="pagination">
            <button class="pagination-button" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                ← Назад
            </button>
            
            <div class="pagination-info">
                Показано ${startBook}-${endBook} из ${totalBooks} книг
            </div>
            
            <div class="pagination-pages">
    `;

    // Показываем до 5 страниц вокруг текущей
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="page-number ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }

    paginationHTML += `
            </div>
            
            <button class="pagination-button" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
                Вперед →
            </button>
        </div>
    `;

    container.innerHTML = paginationHTML;
}

// Смена страницы
function changePage(page) {
    const filteredBooks = bookFilter.applyFilters(books);
    const totalPages = paginationSystem.getTotalPages(filteredBooks.length);
    
    if (page < 1 || page > totalPages) return;
    
    loadBooks(books, page);
    
    // Прокрутка к верху страницы
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Инициализация фильтров с разделенным поиском
function setupFilters() {
    const searchTitleInput = document.getElementById('searchTitle');
    const searchAuthorInput = document.getElementById('searchAuthor');
    const yearFilter = document.getElementById('yearFilter');
    const languageFilter = document.getElementById('languageFilter');
    const formatFilter = document.getElementById('formatFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const resetButton = document.getElementById('resetFilters');

    if (searchTitleInput) {
        searchTitleInput.addEventListener('input', (e) => {
            bookFilter.updateFilter('searchTitle', e.target.value);
            loadBooks(books, 1);
        });
    }

    if (searchAuthorInput) {
        searchAuthorInput.addEventListener('input', (e) => {
            bookFilter.updateFilter('searchAuthor', e.target.value);
            loadBooks(books, 1);
        });
    }

    if (yearFilter) {
        yearFilter.addEventListener('change', (e) => {
            bookFilter.updateFilter('year', e.target.value);
            loadBooks(books, 1);
        });
    }

    if (languageFilter) {
        languageFilter.addEventListener('change', (e) => {
            bookFilter.updateFilter('language', e.target.value);
            loadBooks(books, 1);
        });
    }

    if (formatFilter) {
        formatFilter.addEventListener('change', (e) => {
            bookFilter.updateFilter('format', e.target.value);
            loadBooks(books, 1);
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            bookFilter.updateFilter('category', e.target.value);
            loadBooks(books, 1);
        });
    }

    if (resetButton) {
        resetButton.addEventListener('click', () => {
            bookFilter.resetFilters();
            // Сбрасываем значения всех полей
            if (searchTitleInput) searchTitleInput.value = '';
            if (searchAuthorInput) searchAuthorInput.value = '';
            if (yearFilter) yearFilter.value = '';
            if (languageFilter) languageFilter.value = '';
            if (formatFilter) formatFilter.value = '';
            if (categoryFilter) categoryFilter.value = '';
            loadBooks(books, 1);
            showNotification('Все фильтры сброшены', 'info');
        });
    }
}

// Скачивание книги
function downloadBook(bookId) {
    if (!userSystem.isLoggedIn()) {
        showNotification('Войдите в систему для скачивания книг', 'warning');
        return;
    }

    const book = books.find(b => b.id === bookId);
    if (!book) {
        showNotification('Книга не найдена', 'error');
        return;
    }

    // В реальном приложении здесь будет запрос к серверу для скачивания
    // Имитация скачивания
    const link = document.createElement('a');
    link.href = book.file;
    link.download = `${book.title}.${book.format.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Записываем в историю скачиваний
    downloadSystem.addDownload(userSystem.currentUser.email, bookId);
    
    showNotification(`Книга "${book.title}" скачана успешно!`, 'success');
}

// Управление избранным
function toggleFavorite(bookId) {
    if (!userSystem.isLoggedIn()) {
        showNotification('Войдите в систему, чтобы добавлять книги в избранное', 'warning');
        return;
    }

    const isCurrentlyFavorite = favoritesSystem.isFavorite(userSystem.currentUser.email, bookId);
    
    if (isCurrentlyFavorite) {
        favoritesSystem.removeFromFavorites(userSystem.currentUser.email, bookId);
        showNotification('Книга удалена из избранного', 'info');
    } else {
        favoritesSystem.addToFavorites(userSystem.currentUser.email, bookId);
        showNotification('Книга добавлена в избранное', 'success');
    }
    
    loadBooks(books, paginationSystem.getCurrentPage());
}

// Управление закладками
function addBookmark(bookId, currentPage = null) {
    if (!userSystem.isLoggedIn()) {
        showNotification('Войдите в систему, чтобы добавлять закладки', 'warning');
        return;
    }

    const book = books.find(b => b.id === bookId);
    if (!book) return;

    if (currentPage === null) {
        const existingBookmark = bookmarkSystem.getBookmark(userSystem.currentUser.email, bookId);
        currentPage = prompt(
            `Добавить закладку для "${book.title}". Введите текущую страницу:`, 
            existingBookmark ? existingBookmark.currentPage : "1"
        );
        
        if (!currentPage || isNaN(currentPage)) return;
        currentPage = parseInt(currentPage);
    }

    bookmarkSystem.addBookmark(userSystem.currentUser.email, bookId, currentPage);
    showNotification('Закладка добавлена', 'success');
    loadBooks(books, paginationSystem.getCurrentPage());
}

function removeFromFavorites(bookId) {
    if (!confirm('Удалить книгу из избранного?')) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    favoritesSystem.removeFromFavorites(currentUser.email, bookId);
    showNotification('Книга удалена из избранного', 'info');
    
    // Перезагружаем страницу, если мы на странице профиля
    if (window.location.pathname.includes('profile.html')) {
        loadFavorites();
    } else {
        loadBooks(books, paginationSystem.getCurrentPage());
    }
}

function clearAllFavorites() {
    if (!confirm('Вы уверены, что хотите очистить все избранное?')) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const favorites = JSON.parse(localStorage.getItem('favorites') || '{}');
    
    favorites[currentUser.email] = [];
    localStorage.setItem('favorites', JSON.stringify(favorites));
    showNotification('Все книги удалены из избранного', 'info');
    
    // Перезагружаем страницу, если мы на странице профиля
    if (window.location.pathname.includes('profile.html')) {
        loadFavorites();
    }
}

// Выход из системы
function logout() {
    userSystem.logout();
    showNotification('Вы вышли из системы', 'info');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Уведомления
function showNotification(message, type = 'info') {
    // Удаляем существующие уведомления
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; font-size: 1.25rem;">×</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Обновление навигации
function updateNavigation() {
    const authLinks = document.querySelectorAll('#authLink');
    const mobileAuthLink = document.getElementById('mobileAuthLink');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    authLinks.forEach(link => {
        if (currentUser) {
            link.textContent = 'Личный кабинет';
            link.href = 'profile.html';
        } else {
            link.textContent = 'Войти';
            link.href = 'login.html';
        }
    });
    
    if (mobileAuthLink) {
        if (currentUser) {
            mobileAuthLink.textContent = '👤 Личный кабинет';
            mobileAuthLink.href = 'profile.html';
        } else {
            mobileAuthLink.textContent = '🔐 Войти';
            mobileAuthLink.href = 'login.html';
        }
    }
}

// Мобильное меню - улучшенная версия с предотвращением конфликтов
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const closeMenu = document.querySelector('.close-menu');
    
    if (hamburger && mobileMenu) {
        // Открытие меню
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileMenu.classList.add('active');
            mobileMenuOverlay.classList.add('active');
            hamburger.classList.add('active');
            document.body.classList.add('menu-open');
        });
        
        // Закрытие меню через кнопку
        if (closeMenu) {
            closeMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                closeMobileMenu();
            });
        }
        
        // Закрытие меню через оверлей
        if (mobileMenuOverlay) {
            mobileMenuOverlay.addEventListener('click', (e) => {
                e.stopPropagation();
                closeMobileMenu();
            });
        }
        
         // Закрытие меню при клике на ссылку
        const mobileMenuLinks = document.querySelectorAll('.mobile-nav-menu a');
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.stopPropagation();
                closeMobileMenu();
            });
        });
        
        // Закрытие меню при нажатии Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeMobileMenu();
            }
        });
        
        // Закрытие меню при изменении размера окна (если перешли на десктоп)
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        });
        
        // Предотвращаем открытие меню при клике на логотип
        const navLogo = document.querySelector('.nav-logo');
        if (navLogo) {
            navLogo.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.stopPropagation();
                }
            });
        }
    }
}

function closeMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const hamburger = document.querySelector('.hamburger');
    
    if (mobileMenu) {
        mobileMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.classList.remove('menu-open');
    }
}

// Обновляем инициализацию
document.addEventListener('DOMContentLoaded', () => {
    loadBooks(books, 1);
    setupFilters();
    updateNavigation();
    initMobileMenu();
});

// Для использования в других файлах
window.userSystem = userSystem;
window.favoritesSystem = favoritesSystem;
window.bookmarkSystem = bookmarkSystem;
window.downloadSystem = downloadSystem;
window.paginationSystem = paginationSystem;
window.books = books;
window.toggleFavorite = toggleFavorite;
window.downloadBook = downloadBook;
window.showNotification = showNotification;
window.updateNavigation = updateNavigation;
window.logout = logout;
window.removeFromFavorites = removeFromFavorites;
window.clearAllFavorites = clearAllFavorites;
window.addBookmark = addBookmark;
window.changePage = changePage;