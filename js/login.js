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
      feedback.textContent = '로그인되었습니다! 메인 페이지로 이동합니다.';
      window.setTimeout(() => { window.location.href = 'index.html'; }, 900);
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
