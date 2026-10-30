(() => {
  const form = document.getElementById('signupForm');
  const idInput = document.getElementById('signupId');
  const passwordInput = document.getElementById('signupPassword');
  const idError = document.getElementById('signupIdError');
  const passwordError = document.getElementById('signupPasswordError');
  const feedback = document.getElementById('signupFeedback');
  const toggle = document.getElementById('signupPasswordToggle');
  const STORAGE_KEY = 'tadpole.members.v1';

  const readMembers = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  };

  const hashPassword = async (password) => {
    if (!window.crypto?.subtle) {
      throw new Error('보안 연결(HTTPS)에서 이용해 주세요. GitHub Pages 주소로 접속하면 사용할 수 있습니다.');
    }
    const bytes = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  };

  toggle?.addEventListener('click', () => {
    const show = passwordInput.type === 'password';
    passwordInput.type = show ? 'text' : 'password';
    toggle.textContent = show ? 'HIDE' : 'SHOW';
    toggle.setAttribute('aria-label', show ? '비밀번호 숨기기' : '비밀번호 표시');
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    idError.textContent = '';
    passwordError.textContent = '';
    feedback.textContent = '';
    feedback.classList.remove('is-error');

    const id = idInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    let valid = true;

    if (!/^[a-z0-9_]{4,16}$/.test(id)) {
      idError.textContent = '아이디는 영문 소문자, 숫자, 밑줄(_)로 4~16자 입력해 주세요.';
      valid = false;
    }
    if (password.length < 1 || password.length > 4) {
      passwordError.textContent = '비밀번호는 1~4자로 입력해 주세요.';
      valid = false;
    }
    if (!valid) return;

    const members = readMembers();
    if (members.some(member => member.userId === id)) {
      idError.textContent = '이미 사용 중인 아이디입니다. 다른 아이디를 입력해 주세요.';
      return;
    }

    try {
      const passwordHash = await hashPassword(password);
      const memberNumber = `TD-${crypto.randomUUID()}`;
      members.push({ memberNumber, userId: id, passwordHash, createdAt: new Date().toISOString() });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
      feedback.textContent = `회원가입이 완료되었습니다! 회원번호: ${memberNumber}`;
      form.reset();
      window.setTimeout(() => { window.location.href = 'login.html?joined=1'; }, 1400);
    } catch (error) {
      feedback.textContent = error.message || '회원가입 중 오류가 발생했습니다. 다시 시도해 주세요.';
      feedback.classList.add('is-error');
    }
  });
})();
