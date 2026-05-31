document.addEventListener('DOMContentLoaded', () => {
  const savedRole = localStorage.getItem('userRole') || 'customer';

  const btn = document.getElementById(`btn-${savedRole}`);

  if (btn) {
    setRole(savedRole, btn);
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
    }
  });

  btn.classList.add('active');

  localStorage.setItem('userRole', role);

  /* move slider */
  const track = document.getElementById('role-track');
  const wrap = document.getElementById('role-wrap');

  if (track && wrap) {
    const wr = wrap.getBoundingClientRect();
    const br = btn.getBoundingClientRect();

    track.style.left = (br.left - wr.left) + 'px';
    track.style.width = br.width + 'px';
  }
}

function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  const errorMsg = document.getElementById('error-msg');

  const role = localStorage.getItem('userRole') || 'customer';

  const credentials = {
    customer: {
      username: 'customer',
      password: 'customer'
    },

    seller: {
      username: 'seller',
      password: 'seller'
    },

    admin: {
      username: 'admin',
      password: 'admin'
    }
  };

  const valid =
    credentials[role] &&
    username === credentials[role].username &&
    password === credentials[role].password;

  if (valid) {
    errorMsg.style.display = 'none';

    localStorage.setItem('userName', username);

    const redirectPages = {
      customer: 'pages/customer.html',
      seller: 'pages/seller.html',
      admin: 'admin/dashboard.html'
    };

    window.location.href = redirectPages[role];
  } else {
    errorMsg.textContent = 'Invalid credentials. Please try again.';
    errorMsg.style.display = 'block';

    shakeForm();
  }
}

function shakeForm() {
  const form = document.getElementById('login-form');

  form.classList.remove('shake');

  void form.offsetWidth;

  form.classList.add('shake');
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