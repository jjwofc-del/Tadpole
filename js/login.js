(() => {
  const form = document.getElementById('loginForm');
  const userId = document.getElementById('userId');
  const password = document.getElementById('userPassword');
  const userIdError = document.getElementById('userIdError');
  const passwordError = document.getElementById('passwordError');
  const feedback = document.getElementById('loginFeedback');
  const passwordToggle = document.getElementById('passwordToggle');
  const toast = document.getElementById('toast');

  passwordToggle?.addEventListener('click', () => {
    const willShow = password.type === 'password';
    password.type = willShow ? 'text' : 'password';
    passwordToggle.textContent = willShow ? 'HIDE' : 'SHOW';
    passwordToggle.setAttribute('aria-label', willShow ? '비밀번호 숨기기' : '비밀번호 표시');
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    userIdError.textContent = '';
    passwordError.textContent = '';
    feedback.textContent = '';

    let isValid = true;
    if (!userId.value.trim()) {
      userIdError.textContent = '아이디를 입력해 주세요.';
      isValid = false;
    }
    if (!password.value) {
      passwordError.textContent = '비밀번호를 입력해 주세요.';
      isValid = false;
    }

    if (!isValid) {
      feedback.textContent = '입력 항목을 확인해 주세요.';
      return;
    }

    feedback.textContent = '입력 형식이 확인되었습니다. 실제 계정 인증은 연결되어 있지 않습니다.';
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
    if (toast) {
      toast.textContent = '회원가입 페이지는 다음 개발 단계에서 추가할 수 있어요.';
      toast.classList.add('is-visible');
      window.setTimeout(() => toast.classList.remove('is-visible'), 2300);
    }
  });
})();
