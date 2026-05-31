document.addEventListener('DOMContentLoaded', () => {
  const savedRole = localStorage.getItem('userRole');
  if (savedRole) {
    const role = savedRole;
    const btn = document.getElementById(`btn-${role}`);
    if (btn) setRole(role, btn);
  }
  animateOnLoad();
});

function animateOnLoad() {
  const logo = document.querySelector('.fa-wave-square');
  if (logo) {
    logo.parentElement.classList.add('animate-float');
  }
}

function setRole(role, btn) {
  const roles = ['customer', 'seller', 'admin'];
  roles.forEach(r => {
    const b = document.getElementById(`btn-${r}`);
    if (b) {
      b.classList.remove('active');
      const icon = b.querySelector('i');
      if (icon) icon.classList.add('animate-pulse-glow');
      setTimeout(() => icon?.classList.remove('animate-pulse-glow'), 300);
    }
  });
  btn.classList.add('active');
  localStorage.setItem('userRole', role);
}

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('error-msg');
  const role = localStorage.getItem('userRole') || 'customer';

  const credentials = {
    customer: { username: 'customer', password: 'customer' },
    seller: { username: 'seller', password: 'seller' },
    admin: { username: 'admin', password: 'admin' }
  };

  const valid = credentials[role] &&
                username === credentials[role].username &&
                password === credentials[role].password;

  if (valid) {
    errorMsg.classList.add('hidden');
    const form = document.getElementById('login-form');
    form.classList.add('animate-slide-up');
    setTimeout(() => {
      localStorage.setItem('userName', username);
      localStorage.setItem('userRole', role);
      const adminPages = { admin: 'admin/dashboard.html', customer: 'customer.html', seller: 'seller.html' };
      window.location.href = `pages/${adminPages[role] || `${role}.html`}`;
    }, 300);
  } else {
    errorMsg.textContent = 'Invalid credentials. Please try again.';
    errorMsg.classList.remove('hidden');
    shakeForm();
  }
}

function shakeForm() {
  const form = document.getElementById('login-form');
  form.classList.add('animate-shake');
  setTimeout(() => form.classList.remove('animate-shake'), 500);
}

class AnimationLib {
  fadeIn(element, duration = 400) {
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms ease-out`;
    setTimeout(() => element.style.opacity = '1', 10);
  }

  slideUp(element, duration = 400, distance = 24) {
    element.style.opacity = '0';
    element.style.transform = `translateY(${distance}px)`;
    element.style.transition = `all ${duration}ms ease-out`;
    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, 10);
  }

  slideRight(element, duration = 350, distance = 24) {
    element.style.opacity = '0';
    element.style.transform = `translateX(-${distance}px)`;
    element.style.transition = `all ${duration}ms ease-out`;
    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateX(0)';
    }, 10);
  }

  pulse(element) {
    element.classList.add('animate-pulse-badge');
    setTimeout(() => element.classList.remove('animate-pulse-badge'), 400);
  }

  countUp(element, start, end, duration = 800) {
    const startTime = performance.now();
    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      element.textContent = Math.floor(start + (end - start) * progress);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}

window.anim = new AnimationLib();