(() => {
  const form = document.getElementById('loginForm');
  const userId = document.getElementById('userId');
  const password = document.getElementById('userPassword');
  const userIdError = document.getElementById('userIdError');
  const passwordError = document.getElementById('passwordError');
  const feedback = document.getElementById('loginFeedback');
  const passwordToggle = document.getElementById('passwordToggle');
  const toast = document.getElementById('toast');
  const STORAGE_KEY = 'tadpole.members.v1';

  const readMembers = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  };

  const hashPassword = async (value) => {
    if (!window.crypto?.subtle) throw new Error('보안 연결(HTTPS)에서 이용해 주세요.');
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  };

  passwordToggle?.addEventListener('click', () => {
    const willShow = password.type === 'password';
    password.type = willShow ? 'text' : 'password';
    passwordToggle.textContent = willShow ? 'HIDE' : 'SHOW';
    passwordToggle.setAttribute('aria-label', willShow ? '비밀번호 숨기기' : '비밀번호 표시');
  });

  const params = new URLSearchParams(window.location.search);
  if (params.get('joined') === '1') feedback.textContent = '회원가입이 완료되었습니다. 로그인해 주세요.';

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    userIdError.textContent = '';
    passwordError.textContent = '';
    feedback.textContent = '';
    feedback.classList.remove('is-error');

    const id = userId.value.trim().toLowerCase();
    const passwordValue = password.value;
    let valid = true;
    if (!id) { userIdError.textContent = '아이디를 입력해 주세요.'; valid = false; }
    if (!passwordValue) { passwordError.textContent = '비밀번호를 입력해 주세요.'; valid = false; }
    if (!valid) return;

    try {
      const passwordHash = await hashPassword(passwordValue);
      const member = readMembers().find(item => item.userId === id && item.passwordHash === passwordHash);
      if (!member) {
        feedback.textContent = '아이디 또는 비밀번호가 일치하지 않습니다.';
        feedback.classList.add('is-error');
        return;
      }
      sessionStorage.setItem('tadpole.currentMember', JSON.stringify({ memberNumber: member.memberNumber, userId: member.userId }));

      // 비회원 상태에서 담아둔 상품이 있으면 로그인한 회원의 장바구니에 합칩니다.
      const guestCartKey = 'tadpole.cart.v1.guest';
      const memberCartKey = `tadpole.cart.v1.${member.memberNumber}`;
      try {
        const guestCart = JSON.parse(localStorage.getItem(guestCartKey) || '[]');
        const memberCart = JSON.parse(localStorage.getItem(memberCartKey) || '[]');
        if (Array.isArray(guestCart) && guestCart.length) {
          const mergedCart = Array.isArray(memberCart) ? memberCart : [];
          guestCart.forEach((guestItem) => {
            const existing = mergedCart.find((item) => item.productId === guestItem.productId);
            if (existing) existing.quantity = Math.min(99, (Number(existing.quantity) || 0) + (Number(guestItem.quantity) || 0));
            else mergedCart.push(guestItem);
          });
          localStorage.setItem(memberCartKey, JSON.stringify(mergedCart));
          localStorage.removeItem(guestCartKey);
        }
      } catch {
        // 장바구니 데이터가 비정상이어도 로그인 자체는 계속 진행합니다.
      }

      feedback.textContent = '로그인되었습니다! 페이지로 이동합니다.';
      const nextPage = new URLSearchParams(window.location.search).get('next');
      const destination = nextPage === 'mypage.html' ? 'mypage.html' : 'index.html';
      window.setTimeout(() => { window.location.href = destination; }, 900);
    } catch (error) {
      feedback.textContent = error.message || '로그인 중 오류가 발생했습니다.';
      feedback.classList.add('is-error');
    }
  });

  document.getElementById('guestButton')?.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  document.getElementById('findAccount')?.addEventListener('click', (event) => {
    event.preventDefault();
    if (toast) {
      toast.textContent = '아이디 / 비밀번호 찾기는 데모 화면에서 제공하지 않습니다.';
      toast.classList.add('is-visible');
      window.setTimeout(() => toast.classList.remove('is-visible'), 2300);
    }
  });

  document.getElementById('signupLink')?.addEventListener('click', (event) => {
    event.preventDefault();
    window.location.href = 'signup.html';
  });
})();
