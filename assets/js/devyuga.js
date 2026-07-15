/**
 * Devyuga — main site behavior
 * Header state, mobile nav, scroll reveal, metric counters,
 * blog load-all, Calendly modal, contact form (EmailJS + spam guards).
 */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header scrolled state ---------- */
  var header = document.querySelector(".site-header");
  function onScrollHeader() {
    header.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");

  function closeNav() {
    nav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  navToggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeNav();
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in-view");
    });
  }

  /* ---------- Metric counters ---------- */
  function formatMetric(value, format) {
    if (format === "money") {
      return "$" + (value / 1000000).toFixed(0) + "M";
    }
    return String(value);
  }

  function animateCounter(el) {
    var target = parseInt(el.dataset.count, 10);
    var format = el.dataset.format || "plain";
    if (prefersReducedMotion) {
      el.textContent = formatMetric(target, format);
      return;
    }
    var duration = 1600;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatMetric(Math.round(target * eased), format);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach(function (el) {
      counterObserver.observe(el);
    });
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------- Scroll-to-top ---------- */
  var scrollTop = document.querySelector(".scroll-top");
  function onScrollTopBtn() {
    scrollTop.classList.toggle("visible", window.scrollY > 320);
  }
  window.addEventListener("scroll", onScrollTopBtn, { passive: true });
  onScrollTopBtn();
  scrollTop.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  /* ---------- Blog: load all posts ---------- */
  var loadAllBtn = document.getElementById("load-all-btn");
  if (loadAllBtn) {
    loadAllBtn.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelectorAll(".hidden-blog").forEach(function (post) {
        post.classList.add("revealed");
      });
      loadAllBtn.parentElement.style.display = "none";
    });
  }

  /* ---------- Calendly modal ---------- */
  var calendlyModal = document.getElementById("calendly-modal");
  var calendlyIframe = document.getElementById("calendly-iframe");

  window.openCalendlyModal = function (event) {
    if (event) event.preventDefault();
    calendlyIframe.src = "https://calendly.com/ash-singla-devyuga/meet";
    calendlyModal.classList.add("open");
    document.body.style.overflow = "hidden";
    calendlyModal.querySelector(".calendly-modal-close").focus();
  };

  window.closeCalendlyModal = function () {
    calendlyModal.classList.remove("open");
    calendlyIframe.src = "";
    document.body.style.overflow = "";
  };

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") window.closeCalendlyModal();
  });

  /* ---------- Contact form (EmailJS + spam protection) ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    if (typeof emailjs === "undefined") return;
    emailjs.init("sfdbCxS2BHHEmelZO");

    var form = document.getElementById("contact-form");
    if (!form) return;

    var loading = form.querySelector(".loading");
    var errorMessage = form.querySelector(".error-message");
    var sentMessage = form.querySelector(".sent-message");

    var formLoadTime = Date.now();
    document.getElementById("form_load_time").value = formLoadTime;

    function isValidEmail(email) {
      var emailPattern = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
      if (!emailPattern.test(email)) return false;

      var disposableDomains = [
        "tempmail", "throwaway", "guerrillamail", "10minutemail", "mailinator",
        "trashmail", "fakeinbox", "yopmail", "maildrop", "getnada", "temp-mail",
        "sharklasers", "guerrillamailblock", "spam4", "grr.la", "mailnesia",
        "discard.email", "discardmail", "mintemail", "emailondeck"
      ];
      var emailLower = email.toLowerCase();
      if (disposableDomains.some(function (domain) { return emailLower.includes(domain); })) return false;
      if (email.split("@")[0].length < 2) return false;
      if ((email.match(/\./g) || []).length > 5) return false;
      return true;
    }

    function containsSpamKeywords(text) {
      var spamKeywords = [
        /viagra/gi, /cialis/gi, /pharmacy/gi, /prescription/gi, /pills/gi,
        /casino/gi, /poker/gi, /betting/gi, /lottery/gi, /jackpot/gi,
        /winner/gi, /prize/gi, /won.*\$/gi, /claim.*prize/gi, /inheritance/gi,
        /cryptocurrency/gi, /crypto/gi, /bitcoin/gi, /forex/gi, /trading/gi,
        /investment opportunity/gi, /guaranteed.*return/gi, /double.*money/gi,
        /make money/gi, /work from home/gi, /free money/gi, /earn.*daily/gi,
        /passive income/gi, /get rich/gi, /financial freedom/gi,
        /click here/gi, /buy now/gi, /limited time/gi, /act now/gi,
        /order now/gi, /call now/gi, /hurry/gi, /urgent/gi,
        /congratulations!/gi, /you've been selected/gi, /exclusive offer/gi,
        /seo service/gi, /increase traffic/gi, /boost ranking/gi,
        /backlinks/gi, /website optimization/gi,
        /loan approved/gi, /credit score/gi, /debt relief/gi, /refinance/gi,
        /adult/gi, /dating/gi, /hookup/gi, /singles/gi,
        /unsubscribe/gi, /opt-out/gi, /remove.*list/gi,
        /please verify/gi, /confirm.*account/gi, /suspended.*account/gi
      ];
      return spamKeywords.some(function (keyword) { return keyword.test(text); });
    }

    function hasExcessiveLinks(text) {
      var urlPattern = /(https?:\/\/[^\s]+)|(\b\w+\.(com|net|org|io|co|biz|info)\b)/gi;
      var matches = text.match(urlPattern) || [];
      return matches.length > 1;
    }

    function hasRepeatedChars(text) {
      return /(.)\1{5,}/.test(text);
    }

    function hasSuspiciousPattern(text) {
      var capsCount = (text.match(/[A-Z]/g) || []).length;
      var letterCount = (text.match(/[a-zA-Z]/g) || []).length;
      if (letterCount > 0 && capsCount / letterCount > 0.5) return true;

      var specialChars = (text.match(/[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]/g) || []).length;
      if (specialChars > text.length * 0.2) return true;

      var numbers = (text.match(/\d/g) || []).length;
      if (numbers > text.length * 0.3) return true;

      return false;
    }

    function isRateLimited() {
      var lastSubmission = localStorage.getItem("lastFormSubmission");
      if (lastSubmission) {
        var timeSinceLastSubmission = Date.now() - parseInt(lastSubmission, 10);
        var cooldownPeriod = 180000; // 3 minutes
        return timeSinceLastSubmission < cooldownPeriod;
      }
      return false;
    }

    function getSubmissionCount() {
      var today = new Date().toDateString();
      var submissionData = localStorage.getItem("formSubmissionData");
      if (submissionData) {
        var data = JSON.parse(submissionData);
        if (data.date === today) return data.count;
      }
      return 0;
    }

    function updateSubmissionCount() {
      var today = new Date().toDateString();
      localStorage.setItem("formSubmissionData", JSON.stringify({
        date: today,
        count: getSubmissionCount() + 1
      }));
    }

    function validateForm() {
      var honeypot = form.querySelector("input[name='website']").value;
      var name = form.querySelector("input[name='from_name']").value;
      var email = form.querySelector("input[name='email']").value;
      var subject = form.querySelector("input[name='subject']").value;
      var message = form.querySelector("textarea[name='message']").value;

      if (honeypot) {
        console.warn("Honeypot triggered");
        return { valid: false, error: "Please try again." };
      }

      var timeTaken = Date.now() - formLoadTime;
      if (timeTaken < 5000) {
        console.warn("Form submitted too quickly");
        return { valid: false, error: "Please take your time to fill out the form." };
      }

      if (isRateLimited()) {
        return { valid: false, error: "Please wait 3 minutes before submitting again." };
      }

      if (getSubmissionCount() >= 5) {
        return { valid: false, error: "Daily submission limit reached. Please try again tomorrow." };
      }

      if (!isValidEmail(email)) {
        return { valid: false, error: "Please enter a valid email address." };
      }

      if (name.length < 2 || name.length > 50) {
        return { valid: false, error: "Please enter a valid name (2-50 characters)." };
      }
      if (/\d{2,}/.test(name)) {
        return { valid: false, error: "Please enter a valid name without numbers." };
      }
      if (/[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]/.test(name)) {
        return { valid: false, error: "Please enter a valid name without special characters." };
      }

      if (subject.length < 3 || subject.length > 100) {
        return { valid: false, error: "Subject must be between 3-100 characters." };
      }

      if (message.length < 20) {
        return { valid: false, error: "Please provide a more detailed message (minimum 20 characters)." };
      }
      if (message.length > 2000) {
        return { valid: false, error: "Your message is too long (maximum 2000 characters)." };
      }

      var allText = name + " " + email + " " + subject + " " + message;
      if (containsSpamKeywords(allText)) {
        return { valid: false, error: "Your message contains suspicious content. Please revise." };
      }

      if (hasExcessiveLinks(message)) {
        return { valid: false, error: "Please limit links in your message (maximum 1 link allowed)." };
      }

      if (hasRepeatedChars(message) || hasRepeatedChars(name) || hasRepeatedChars(subject)) {
        return { valid: false, error: "Your message contains invalid content." };
      }

      if (hasSuspiciousPattern(message)) {
        return { valid: false, error: "Your message contains suspicious formatting. Please write normally." };
      }

      return { valid: true };
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var submitBtn = form.querySelector("button[type='submit']");
      loading.style.display = "block";
      errorMessage.style.display = "none";
      sentMessage.style.display = "none";

      var validation = validateForm();
      if (!validation.valid) {
        loading.style.display = "none";
        errorMessage.textContent = validation.error;
        errorMessage.style.display = "block";
        return;
      }

      submitBtn.disabled = true;

      var formData = {
        from_name: form.querySelector("input[name='from_name']").value,
        reply_to: form.querySelector("input[name='email']").value,
        subject: form.querySelector("input[name='subject']").value,
        message: form.querySelector("textarea[name='message']").value
      };

      emailjs.send("service_6hqsf6n", "template_kvhtw7q", formData)
        .then(function () {
          loading.style.display = "none";
          sentMessage.style.display = "block";
          submitBtn.disabled = false;
          form.reset();
          localStorage.setItem("lastFormSubmission", Date.now().toString());
          updateSubmissionCount();
          setTimeout(function () {
            document.getElementById("form_load_time").value = Date.now();
          }, 100);
        })
        .catch(function (error) {
          loading.style.display = "none";
          errorMessage.textContent = "Failed to send message. Please try again later.";
          errorMessage.style.display = "block";
          submitBtn.disabled = false;
          console.error("EmailJS Error:", error);
        });
    });
  });
})();
