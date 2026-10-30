(() => {
  const MEMBER_STORAGE_KEY = 'tadpole.members.v1';
  const CURRENT_MEMBER_KEY = 'tadpole.currentMember';
  const CART_KEY_PREFIX = 'tadpole.cart.v1.';
  const currentMember = (() => {
    try {
      return JSON.parse(sessionStorage.getItem(CURRENT_MEMBER_KEY) || 'null');
    } catch {
      sessionStorage.removeItem(CURRENT_MEMBER_KEY);
      return null;
    }
  })();

  if (!currentMember?.memberNumber || !currentMember?.userId) {
    window.location.replace('login.html?next=mypage.html');
    return;
  }

  const readMembers = () => {
    try {
      const members = JSON.parse(localStorage.getItem(MEMBER_STORAGE_KEY) || '[]');
      return Array.isArray(members) ? members : [];
    } catch {
      return [];
    }
  };

  const members = readMembers();
  const memberIndex = members.findIndex((member) => member.memberNumber === currentMember.memberNumber && member.userId === currentMember.userId);
  if (memberIndex < 0) {
    sessionStorage.removeItem(CURRENT_MEMBER_KEY);
    window.location.replace('login.html?next=mypage.html');
    return;
  }
  const member = members[memberIndex];
  const cartKey = `${CART_KEY_PREFIX}${member.memberNumber}`;
  const cartList = document.getElementById('cartList');
  const cartEmpty = document.getElementById('cartEmpty');
  const cartTotalRow = document.getElementById('cartTotalRow');
  const cartTotal = document.getElementById('cartTotal');
  const toast = document.getElementById('mypageToast');
  let toastTimer;

  const formatPrice = (value) => `₩ ${Number(value || 0).toLocaleString('ko-KR')}`;
  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2300);
  };

  function readCart() {
    try {
      const value = JSON.parse(localStorage.getItem(cartKey) || '[]');
      return Array.isArray(value) ? value.filter((item) => item && typeof item.productId === 'string' && Number(item.quantity) > 0) : [];
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(cartKey, JSON.stringify(cart));
    renderCart();
  }

  document.getElementById('welcomeUser').textContent = member.userId;
  document.getElementById('memberUserId').textContent = member.userId;
  document.getElementById('memberNumber').textContent = member.memberNumber;
  document.getElementById('memberJoinedAt').textContent = member.createdAt
    ? new Date(member.createdAt).toLocaleDateString('ko-KR')
    : '정보 없음';

  function makeCartItem(item, index) {
    const article = document.createElement('article');
    article.className = 'cart-item';

    const image = document.createElement('img');
    image.className = 'cart-item-image';
    image.src = item.image || 'assets/images/product-01.svg';
    image.alt = `${item.name || '상품'} 이미지`;

    const detail = document.createElement('div');
    detail.className = 'cart-item-detail';
    const name = document.createElement('h3');
    name.textContent = item.name || '상품';
    const price = document.createElement('p');
    price.textContent = formatPrice(item.price);
    detail.append(name, price);

    const controls = document.createElement('div');
    controls.className = 'cart-item-controls';
    const quantityLabel = document.createElement('span');
    quantityLabel.className = 'quantity-label';
    quantityLabel.textContent = `수량 ${Number(item.quantity) || 1}`;

    const quantityActions = document.createElement('div');
    quantityActions.className = 'quantity-actions';
    const decrease = document.createElement('button');
    decrease.type = 'button';
    decrease.textContent = '−';
    decrease.setAttribute('aria-label', `${item.name} 수량 줄이기`);
    decrease.addEventListener('click', () => {
      const cart = readCart();
      if (!cart[index]) return;
      cart[index].quantity = Math.max(1, (Number(cart[index].quantity) || 1) - 1);
      saveCart(cart);
    });
    const increase = document.createElement('button');
    increase.type = 'button';
    increase.textContent = '+';
    increase.setAttribute('aria-label', `${item.name} 수량 늘리기`);
    increase.addEventListener('click', () => {
      const cart = readCart();
      if (!cart[index]) return;
      cart[index].quantity = Math.min(99, (Number(cart[index].quantity) || 1) + 1);
      saveCart(cart);
    });
    quantityActions.append(decrease, increase);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-cart-item';
    remove.textContent = '삭제';
    remove.addEventListener('click', () => {
      const cart = readCart();
      cart.splice(index, 1);
      saveCart(cart);
      showToast('장바구니에서 상품을 삭제했어요.');
    });

    controls.append(quantityLabel, quantityActions, remove);
    const lineTotal = document.createElement('strong');
    lineTotal.className = 'cart-item-total';
    lineTotal.textContent = formatPrice(Number(item.price) * Number(item.quantity));
    article.append(image, detail, controls, lineTotal);
    return article;
  }

  function renderCart() {
    const cart = readCart();
    cartList.replaceChildren();
    cart.forEach((item, index) => cartList.append(makeCartItem(item, index)));
    const isEmpty = cart.length === 0;
    cartEmpty.hidden = !isEmpty;
    cartTotalRow.hidden = isEmpty;
    document.getElementById('clearCartButton').disabled = isEmpty;
    const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
    cartTotal.textContent = formatPrice(total);
  }

  document.getElementById('clearCartButton').addEventListener('click', () => {
    if (!readCart().length) return;
    saveCart([]);
    showToast('장바구니를 비웠어요.');
  });

  const hashPassword = async (value) => {
    if (!window.crypto?.subtle) throw new Error('HTTPS 환경에서 다시 시도해 주세요.');
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  };

  const passwordForm = document.getElementById('passwordChangeForm');
  const passwordFeedback = document.getElementById('passwordChangeFeedback');
  passwordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    passwordFeedback.textContent = '';
    passwordFeedback.classList.remove('is-error');

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
      passwordFeedback.textContent = '모든 비밀번호 항목을 입력해 주세요.';
      passwordFeedback.classList.add('is-error');
      return;
    }
    if (newPassword.length < 1 || newPassword.length > 4) {
      passwordFeedback.textContent = '새 비밀번호는 1~4자로 입력해 주세요.';
      passwordFeedback.classList.add('is-error');
      return;
    }
    if (newPassword !== confirmPassword) {
      passwordFeedback.textContent = '새 비밀번호와 비밀번호 확인이 일치하지 않습니다.';
      passwordFeedback.classList.add('is-error');
      return;
    }
    if (newPassword === currentPassword) {
      passwordFeedback.textContent = '현재 비밀번호와 다른 비밀번호를 입력해 주세요.';
      passwordFeedback.classList.add('is-error');
      return;
    }

    try {
      const currentHash = await hashPassword(currentPassword);
      if (currentHash !== member.passwordHash) {
        passwordFeedback.textContent = '현재 비밀번호가 일치하지 않습니다.';
        passwordFeedback.classList.add('is-error');
        return;
      }
      member.passwordHash = await hashPassword(newPassword);
      member.passwordUpdatedAt = new Date().toISOString();
      members[memberIndex] = member;
      localStorage.setItem(MEMBER_STORAGE_KEY, JSON.stringify(members));
      passwordForm.reset();
      passwordFeedback.textContent = '비밀번호가 변경되었습니다. 다음 로그인부터 새 비밀번호를 사용해 주세요.';
      showToast('비밀번호가 변경되었어요.');
    } catch (error) {
      passwordFeedback.textContent = error.message || '비밀번호 변경 중 문제가 발생했습니다.';
      passwordFeedback.classList.add('is-error');
    }
  });

  document.getElementById('mypageLogout').addEventListener('click', () => {
    sessionStorage.removeItem(CURRENT_MEMBER_KEY);
    window.location.href = 'index.html';
  });

  renderCart();
})();
