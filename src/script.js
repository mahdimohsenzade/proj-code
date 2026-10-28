/**
 * نوح | اسکریپت‌های تعاملی پورتفولیو
 * نسخه مستقل بدون CDN با تکرار مداوم انیمیشن‌های AOS و فریم‌ریت نرم
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ۱. راه‌اندازی AOS با قابلیت انیمیشن رفت و برگشت مداوم در اسکرول
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 750,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      once: false,
      mirror: true,
      offset: 80,
      anchorPlacement: 'top-bottom'
    });
  }

  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  /* ===================================================================
     ۲. کنترل هدر، ناوبری نرم و منوی ریسپانسیو
     =================================================================== */
  const header = document.getElementById('header');
  const navMenu = document.getElementById('navMenu');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // تغییر پس‌زمینه هدر در اسکرول
  const handleScrollHeader = () => {
    if (window.scrollY > 40) {
      header.classList.add('bg-bg-main/98', 'shadow-[0_8px_30px_rgba(0,0,0,0.55)]');
      header.classList.remove('bg-bg-main/85');
    } else {
      header.classList.remove('bg-bg-main/98', 'shadow-[0_8px_30px_rgba(0,0,0,0.55)]');
      header.classList.add('bg-bg-main/85');
    }
  };
  window.addEventListener('scroll', handleScrollHeader, { passive: true });
  handleScrollHeader();

  // اسکرول نرم هنگام کلیک روی تب‌های منو
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          e.preventDefault();

          if (navMenu && !navMenu.classList.contains('max-lg:-translate-y-[130%]')) {
            toggleMobileMenu(false);
          }

          const headerHeight = header ? header.offsetHeight : 74;
          const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight - 10;

          setActiveNavLink(link);

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // کنترل همبرگر منو در تبلت و موبایل
  const toggleMobileMenu = (forceState) => {
    const isOpening = forceState !== undefined ? forceState : navMenu.classList.contains('max-lg:-translate-y-[130%]');
    if (isOpening) {
      navMenu.classList.remove('max-lg:-translate-y-[130%]', 'max-lg:opacity-0', 'max-lg:invisible');
      navMenu.classList.add('max-lg:translate-y-0', 'max-lg:opacity-100', 'max-lg:visible');
      document.body.style.overflow = 'hidden';
    } else {
      navMenu.classList.add('max-lg:-translate-y-[130%]', 'max-lg:opacity-0', 'max-lg:invisible');
      navMenu.classList.remove('max-lg:translate-y-0', 'max-lg:opacity-100', 'max-lg:visible');
      document.body.style.overflow = '';
    }
  };

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });

    document.addEventListener('click', (e) => {
      if (!navMenu.classList.contains('max-lg:-translate-y-[130%]') && !navMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
        toggleMobileMenu(false);
      }
    });
  }

  const setActiveNavLink = (activeLink) => {
    navLinks.forEach(l => {
      l.classList.remove('bg-bg-card', 'border-brand-blue/45', 'text-white', 'shadow-[0_2px_12px_rgba(8,126,255,0.3)]', 'font-semibold');
      l.classList.add('text-[#9AAEC7]');
    });
    activeLink.classList.remove('text-[#9AAEC7]');
    activeLink.classList.add('bg-bg-card', 'border-brand-blue/45', 'text-white', 'shadow-[0_2px_12px_rgba(8,126,255,0.3)]', 'font-semibold');
  };

  // هماهنگی هایلایت منو با موقعیت اسکرول
  window.addEventListener('scroll', () => {
    let scrollPos = window.scrollY + (header ? header.offsetHeight : 74) + 60;
    
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            setActiveNavLink(link);
          }
        });
      }
    });
  }, { passive: true });


  /* ===================================================================
     ۳. کارت‌های 3D Tilt با Lerp Interpolation
     =================================================================== */
  const tiltCards = document.querySelectorAll('[data-tilt]');

  if (!isTouchDevice) {
    tiltCards.forEach(card => {
      let bounds = null;
      let rafId = null;
      let isHovered = false;

      let currentRotateX = 0;
      let currentRotateY = 0;
      let targetRotateX = 0;
      let targetRotateY = 0;

      const lerp = (start, end, factor) => start + (end - start) * factor;

      const animateLoop = () => {
        currentRotateX = lerp(currentRotateX, targetRotateX, 0.1);
        currentRotateY = lerp(currentRotateY, targetRotateY, 0.1);

        card.style.transform = `perspective(1000px) rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg) translateZ(8px)`;

        if (isHovered || Math.abs(currentRotateX) > 0.05 || Math.abs(currentRotateY) > 0.05) {
          rafId = requestAnimationFrame(animateLoop);
        } else {
          card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
          card.classList.remove('is-tilting');
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      };

      card.addEventListener('mouseenter', () => {
        isHovered = true;
        bounds = card.getBoundingClientRect();
        card.classList.add('is-tilting');
        if (!rafId) rafId = requestAnimationFrame(animateLoop);
      });

      card.addEventListener('mousemove', (e) => {
        if (!bounds) bounds = card.getBoundingClientRect();

        const mouseX = e.clientX - bounds.left;
        const mouseY = e.clientY - bounds.top;

        const xPct = Math.round((mouseX / bounds.width) * 100);
        const yPct = Math.round((mouseY / bounds.height) * 100);
        card.style.setProperty('--mouse-x', `${xPct}%`);
        card.style.setProperty('--mouse-y', `${yPct}%`);

        const centerX = bounds.width / 2;
        const centerY = bounds.height / 2;
        targetRotateX = ((mouseY - centerY) / centerY) * -6;
        targetRotateY = ((mouseX - centerX) / centerX) * 6;

        if (!rafId) rafId = requestAnimationFrame(animateLoop);
      });

      card.addEventListener('mouseleave', () => {
        isHovered = false;
        targetRotateX = 0;
        targetRotateY = 0;
        card.style.setProperty('--mouse-x', '50%');
        card.style.setProperty('--mouse-y', '50%');
      });
    });
  }


  /* ===================================================================
     ۴. دکمه‌های مغناطیسی نرم
     =================================================================== */
  const magneticButtons = document.querySelectorAll('.magnetic-btn');

  if (!isTouchDevice) {
    magneticButtons.forEach(btn => {
      let btnBounds = null;
      let magRaf = null;
      let isOver = false;

      let currX = 0, currY = 0;
      let targetX = 0, targetY = 0;

      const lerp = (start, end, factor) => start + (end - start) * factor;

      const magLoop = () => {
        currX = lerp(currX, targetX, 0.12);
        currY = lerp(currY, targetY, 0.12);

        btn.style.transform = `translate(${currX.toFixed(2)}px, ${currY.toFixed(2)}px)`;

        if (isOver || Math.abs(currX) > 0.1 || Math.abs(currY) > 0.1) {
          magRaf = requestAnimationFrame(magLoop);
        } else {
          btn.style.transform = 'translate(0px, 0px)';
          cancelAnimationFrame(magRaf);
          magRaf = null;
        }
      };

      btn.addEventListener('mouseenter', () => {
        isOver = true;
        btnBounds = btn.getBoundingClientRect();
        if (!magRaf) magRaf = requestAnimationFrame(magLoop);
      });

      btn.addEventListener('mousemove', (e) => {
        if (!btnBounds) btnBounds = btn.getBoundingClientRect();
        const centerX = btnBounds.left + btnBounds.width / 2;
        const centerY = btnBounds.top + btnBounds.height / 2;

        targetX = (e.clientX - centerX) * 0.18;
        targetY = (e.clientY - centerY) * 0.18;

        if (!magRaf) magRaf = requestAnimationFrame(magLoop);
      });

      btn.addEventListener('mouseleave', () => {
        isOver = false;
        targetX = 0;
        targetY = 0;
      });
    });
  }


  /* ===================================================================
     ۵. پارالکس صحنه Hero
     =================================================================== */
  const heroVisual = document.getElementById('heroVisual');
  const heroLayers = document.querySelectorAll('.hero-layer');

  if (heroVisual && !isTouchDevice) {
    let heroBounds = null;
    let heroRaf = null;
    let isHeroHover = false;
    let targetNormX = 0, targetNormY = 0;
    let currNormX = 0, currNormY = 0;

    const lerp = (start, end, factor) => start + (end - start) * factor;

    const heroLoop = () => {
      currNormX = lerp(currNormX, targetNormX, 0.08);
      currNormY = lerp(currNormY, targetNormY, 0.08);

      heroLayers.forEach(layer => {
        const depth = parseFloat(layer.getAttribute('data-depth')) || 0.15;
        const moveX = currNormX * depth * 24;
        const moveY = currNormY * depth * 24;
        layer.style.transform = `translate3d(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px, 0)`;
      });

      if (isHeroHover || Math.abs(currNormX) > 0.01 || Math.abs(currNormY) > 0.01) {
        heroRaf = requestAnimationFrame(heroLoop);
      } else {
        heroLayers.forEach(layer => {
          layer.style.transform = 'translate3d(0px, 0px, 0)';
        });
        cancelAnimationFrame(heroRaf);
        heroRaf = null;
      }
    };

    heroVisual.addEventListener('mouseenter', () => {
      isHeroHover = true;
      heroBounds = heroVisual.getBoundingClientRect();
      if (!heroRaf) heroRaf = requestAnimationFrame(heroLoop);
    });

    heroVisual.addEventListener('mousemove', (e) => {
      if (!heroBounds) heroBounds = heroVisual.getBoundingClientRect();
      const centerX = heroBounds.left + heroBounds.width / 2;
      const centerY = heroBounds.top + heroBounds.height / 2;

      targetNormX = (e.clientX - centerX) / (heroBounds.width / 2);
      targetNormY = (e.clientY - centerY) / (heroBounds.height / 2);

      if (!heroRaf) heroRaf = requestAnimationFrame(heroLoop);
    });

    heroVisual.addEventListener('mouseleave', () => {
      isHeroHover = false;
      targetNormX = 0;
      targetNormY = 0;
    });
  }


  /* ===================================================================
     ۶. اعتبارسنجی و ارسال فرم تماس
     =================================================================== */
  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const formStatus = document.getElementById('formStatus');

  if (contactForm) {
    const userName = document.getElementById('userName');
    const userContact = document.getElementById('userContact');
    const projectType = document.getElementById('projectType');
    const userMessage = document.getElementById('userMessage');

    const nameError = document.getElementById('nameError');
    const contactError = document.getElementById('contactError');
    const typeError = document.getElementById('typeError');
    const messageError = document.getElementById('messageError');

    [userName, userContact, projectType, userMessage].forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('border-red-500', 'ring-1', 'ring-red-500');
        const errSpan = document.getElementById(input.id.replace('user', '').toLowerCase() + 'Error') || 
                        document.getElementById(input.name + 'Error');
        if (errSpan) errSpan.textContent = '';
      });
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      if (!userName.value.trim() || userName.value.trim().length < 2) {
        userName.classList.add('border-red-500', 'ring-1', 'ring-red-500');
        nameError.textContent = 'لطفاً نام و نام خانوادگی خود را کامل وارد کنید.';
        isValid = false;
      } else {
        userName.classList.remove('border-red-500', 'ring-1', 'ring-red-500');
        nameError.textContent = '';
      }

      const contactVal = userContact.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^(\+98|0)?9\d{9}$/;
      if (!contactVal) {
        userContact.classList.add('border-red-500', 'ring-1', 'ring-red-500');
        contactError.textContent = 'شماره تماس یا ایمیل معتبر ضروری است.';
        isValid = false;
      } else if (!emailRegex.test(contactVal) && !phoneRegex.test(contactVal) && contactVal.length < 5) {
        userContact.classList.add('border-red-500', 'ring-1', 'ring-red-500');
        contactError.textContent = 'لطفاً یک ایمیل یا شماره تماس صحیح وارد کنید.';
        isValid = false;
      } else {
        userContact.classList.remove('border-red-500', 'ring-1', 'ring-red-500');
        contactError.textContent = '';
      }

      if (!projectType.value) {
        projectType.classList.add('border-red-500', 'ring-1', 'ring-red-500');
        typeError.textContent = 'لطفاً نوع همکاری را انتخاب کنید.';
        isValid = false;
      } else {
        projectType.classList.remove('border-red-500', 'ring-1', 'ring-red-500');
        typeError.textContent = '';
      }

      if (!userMessage.value.trim() || userMessage.value.trim().length < 8) {
        userMessage.classList.add('border-red-500', 'ring-1', 'ring-red-500');
        messageError.textContent = 'لطفاً توضیحات مختصری درباره پروژه بنویسید (حداقل ۸ حرف).';
        isValid = false;
      } else {
        userMessage.classList.remove('border-red-500', 'ring-1', 'ring-red-500');
        messageError.textContent = '';
      }

      if (!isValid) return;

      submitBtn.disabled = true;
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = `<span>در حال ارسال پیام...</span>`;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;

        formStatus.classList.remove('hidden', 'bg-red-500/20', 'text-red-400', 'border-red-500/30');
        formStatus.classList.add('block', 'bg-green-500/15', 'text-green-400', 'border', 'border-green-500/30');
        formStatus.textContent = '✅ پیام شما با موفقیت دریافت شد! به‌زودی با شما تماس خواهم گرفت.';

        contactForm.reset();

        setTimeout(() => {
          formStatus.classList.add('hidden');
          formStatus.classList.remove('block');
        }, 6000);
      }, 1000);
    });
  }

});