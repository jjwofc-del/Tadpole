(() => {
  const productCards = [...document.querySelectorAll('.product-card')];
  const filterButtons = [...document.querySelectorAll('.filter-button')];
  const categoryCards = [...document.querySelectorAll('.category-card')];
  const searchInput = document.getElementById('productSearch');
  const emptyMessage = document.getElementById('emptyMessage');
  const bagCount = document.getElementById('bagCount');
  const bagButton = document.querySelector('.bag-button');
  const toast = document.getElementById('toast');
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.getElementById('mainNav');
  const authLink = document.querySelector('.login-link');
  const CURRENT_MEMBER_KEY = 'tadpole.currentMember';
  let activeFilter = 'all';
  let cartCount = 0;
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2300);
  }

  function getCurrentMember() {
    try {
      const member = JSON.parse(sessionStorage.getItem(CURRENT_MEMBER_KEY) || 'null');
      return member && typeof member.userId === 'string' ? member : null;
    } catch {
      sessionStorage.removeItem(CURRENT_MEMBER_KEY);
      return null;
    }
  }

  function updateAuthLink() {
    if (!authLink) return;
    const currentMember = getCurrentMember();

    if (currentMember) {
      authLink.textContent = 'LOGOUT';
      authLink.href = '#logout';
      authLink.setAttribute('aria-label', `${currentMember.userId} 로그아웃`);
      authLink.dataset.authAction = 'logout';
    } else {
      authLink.textContent = 'LOGIN';
      authLink.href = 'login.html';
      authLink.setAttribute('aria-label', '로그인');
      authLink.dataset.authAction = 'login';
    }
  }

  // 로그인 상태에 따라 헤더의 LOGIN / LOGOUT 표시를 갱신합니다.
  updateAuthLink();

  authLink?.addEventListener('click', (event) => {
    if (getCurrentMember()) {
      event.preventDefault();
      sessionStorage.removeItem(CURRENT_MEMBER_KEY);
      updateAuthLink();
      showToast('로그아웃되었습니다.');
    }
  });

  function applyFilters() {
    const keyword = (searchInput?.value || '').trim().toLocaleLowerCase('ko-KR');
    let visibleCount = 0;

    productCards.forEach((card) => {
      const matchesCategory = activeFilter === 'all' || card.dataset.category === activeFilter;
      const matchesSearch = (card.dataset.name || '').toLocaleLowerCase('ko-KR').includes(keyword);
      const isVisible = matchesCategory && matchesSearch;
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    if (emptyMessage) emptyMessage.hidden = visibleCount !== 0;
  }

  function setFilter(filter) {
    activeFilter = filter;
    filterButtons.forEach((button) => {
      const isActive = button.dataset.filter === filter;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
    applyFilters();
    document.getElementById('new-arrivals')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => setFilter(button.dataset.filter || 'all'));
  });

  categoryCards.forEach((button) => {
    button.addEventListener('click', () => setFilter(button.dataset.filter || 'all'));
  });

  searchInput?.addEventListener('input', applyFilters);

  document.querySelectorAll('.add-button').forEach((button) => {
    button.addEventListener('click', () => {
      cartCount += 1;
      if (bagCount) bagCount.textContent = String(cartCount);
      bagButton?.setAttribute('aria-label', `장바구니, 담긴 상품 ${cartCount}개`);
      const productName = button.closest('.product-card')?.dataset.name || '상품';
      showToast(`${productName} 상품을 장바구니에 담았어요.`);
    });
  });

  document.querySelectorAll('.wish-button').forEach((button) => {
    button.addEventListener('click', () => {
      const isPressed = button.getAttribute('aria-pressed') === 'true';
      button.setAttribute('aria-pressed', String(!isPressed));
      button.textContent = isPressed ? '♡' : '♥';
      showToast(isPressed ? '관심 상품에서 삭제했어요.' : '관심 상품에 추가했어요.');
    });
  });

  bagButton?.addEventListener('click', () => {
    showToast(cartCount ? `장바구니에 상품 ${cartCount}개가 담겨 있어요. (데모 기능)` : '장바구니가 비어 있어요.');
  });

  menuToggle?.addEventListener('click', () => {
    const isOpen = mainNav?.classList.toggle('is-open') || false;
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
  });

  mainNav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      menuToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  document.getElementById('newsletterForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('newsletterEmail');
    const feedback = document.getElementById('newsletterFeedback');
    if (feedback) feedback.textContent = `${email.value} 주소로 소식을 보내는 기능은 데모 화면입니다.`;
    email.value = '';
  });
})();
