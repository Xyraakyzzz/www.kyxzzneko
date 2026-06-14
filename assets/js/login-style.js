import { auth } from "https://www.kyzzneko.zone.id/assets/db/firebase.js";
import { GoogleAuthProvider, signInWithPopup } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const provider = new GoogleAuthProvider();

(function() {
    const links = [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Share+Tech+Mono&display=swap' },
        { rel: 'script', src: 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit' }
    ];
    
    links.forEach(l => {
        const el = document.createElement(l.rel === 'stylesheet' ? 'link' : 'script');
        if (l.rel === 'stylesheet') { el.rel = l.rel; el.href = l.href; } 
        else { el.src = l.src; el.async = true; el.defer = true; }
        document.head.appendChild(el);
    });
    
    const style = document.createElement('style');
    style.id = 'emergent-ui-style';
    style.textContent = `
        :root {
            --bg-deep: #0a0a0a;
            --accent-primary: #3b82f6;
            --text-heading: #ffffff;
            --text-muted: #888888;
            --font-main: 'Plus Jakarta Sans', sans-serif;
            --font-mono: 'Share Tech Mono', monospace;
            --border-faint: rgba(255, 255, 255, 0.08);
        }

        body {
            background-color: var(--bg-deep) !important;
            font-family: var(--font-main) !important;
            margin: 0;
            overflow: hidden !important;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            color: #fff;
        }

        .auth-container {
            background: var(--bg-deep) !important;
            width: 100% !important;
            height: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            position: fixed !important;
            inset: 0 !important;
            z-index: 1 !important;
            background-image: 
                linear-gradient(var(--border-faint) 1px, transparent 1px),
                linear-gradient(90deg, var(--border-faint) 1px, transparent 1px) !important;
            background-size: 40px 40px, 40px 40px !important;
            background-position: center !important;
        }

        .auth-container::before, .auth-container::after, .glow-orb, .bg-mesh, .bg-grid, .custom-brand, .hero-section, .hero-card, .login-footer, .custom-footer, div[style*="border-top"], .step-list, .status-pill {
            display: none !important;
        }

        .form-section {
            width: 100% !important;
            max-width: 440px !important;
            text-align: center !important;
            z-index: 10 !important;
            padding: 40px !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            animation: emerge 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
        }

        @keyframes emerge {
            from { opacity: 0; transform: translateY(30px); filter: blur(8px); }
            to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }

        .form-wrapper {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            position: relative !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
        }

        /* --- Minimal Branding --- */
        .welcome-icon {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            margin-bottom: 48px !important;
            width: 80px !important;
            height: 80px !important;
            background: transparent !important;
            border-radius: 50% !important; 
            padding: 0 !important; 
            border: none !important;
            position: relative !important;
        }

        .welcome-icon img { 
            width: 100% !important; 
            height: 100% !important;
            border-radius: 50% !important; 
            /* No glow box-shadow */
            box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
        }

        #pageTitle {
            font-family: var(--font-main) !important;
            font-weight: 800 !important;
            font-size: 2.8rem !important;
            letter-spacing: -0.05em !important;
            color: #fff !important;
            margin: 0 0 16px 0 !important;
            background: none !important;
            -webkit-text-fill-color: initial !important;
        }

        .form-wrapper p {
            font-family: var(--font-main) !important;
            font-size: 1rem !important;
            font-weight: 500 !important;
            color: var(--text-muted) !important;
            margin: 0 0 40px 0 !important;
            line-height: 1.5 !important;
            max-width: 340px !important;
        }

        #turnstile-widget {
            margin-bottom: 24px !important;
            min-height: 65px;
            display: flex !important;
            justify-content: center !important;
            transform: scale(0.9);
        }

        .social-group {
            width: 100% !important;
            display: flex !important;
            justify-content: center !important;
        }

        #btnGoogle {
            background: #ffffff !important;
            color: #000000 !important;
            border: none !important;
            border-radius: 14px !important;
            padding: 18px 32px !important;
            font-size: 16px !important;
            font-weight: 700 !important;
            display: flex !important;
            align-items: center !important;
            gap: 14px !important;
            cursor: pointer !important;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
            width: 100% !important;
            justify-content: center !important;
            position: relative !important;
            /* Simple shadow, no glow */
            box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
            opacity: 0.5; /* Disabled by default until verified */
            pointer-events: none;
        }

        #btnGoogle.verified {
            opacity: 1;
            pointer-events: auto;
            box-shadow: 0 10px 20px rgba(0,0,0,0.2) !important;
        }

        #btnGoogle:hover {
            transform: translateY(-2px) !important;
            background: #f7f7f7 !important;
        }

        #btnGoogle:active { transform: translateY(0) scale(0.98) !important; }
        #btnGoogle img { width: 22px !important; height: 22px !important; }

        /* Error Box Refinement */
        .error-box {
            background: rgba(239, 68, 68, 0.1) !important;
            border: 1px solid rgba(239, 68, 68, 0.2) !important;
            color: #ef4444 !important;
            border-radius: 12px !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            margin-bottom: 24px !important;
            width: 100% !important;
        }
    `;
    document.head.appendChild(style);
    let turnstileInjected = false;
    function render() {
        const wrapper = document.querySelector('.form-wrapper');
        const container = document.getElementById('authContainer');
        if(!wrapper || !container) return;
        container.style.display = 'flex';
        
        const logo = wrapper.querySelector('.welcome-icon img');
        if(logo) logo.src = "/icon.png";
        const title = document.getElementById('pageTitle');
        if(title) title.textContent = "Welcome Back";
      
        const sub = wrapper.querySelector('p');
        if(sub) sub.textContent = "Please verify your session to continue.";

        const socialGroup = document.querySelector('.social-group');
        if(socialGroup && !document.getElementById('turnstile-widget')) {
            const turnstileDiv = document.createElement('div');
            turnstileDiv.id = 'turnstile-widget';
            socialGroup.parentNode.insertBefore(turnstileDiv, socialGroup);
            
            const checkTurnstile = setInterval(() => {
                if (window.turnstile) {
                    clearInterval(checkTurnstile);
                    window.turnstile.render('#turnstile-widget', {
                        sitekey: '0x4AAAAAADkSTSJOUh2xTwNm',
                        theme: 'dark',
                callback: function(token) {
                console.log("TURNSTILE OK:", token);
                   const btn = document.getElementById('btnGoogle');
                     if (btn) {
                        btn.classList.add('verified');
                        btn.disabled = false;
                      }
                      window.turnstileToken = token;
                     },
                    });
                }
            }, 100);
        }

        const btn = document.getElementById('btnGoogle');
        if(btn) {
            if(!btn.innerHTML.includes('svg')) {
                btn.innerHTML = `<img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google"> Continue with Google`;
            }
        }

        const btn = document.getElementById('btnGoogle');

         if (btn && !btn.dataset.bound) {
          btn.dataset.bound = "true";

         btn.addEventListener('click', async () => {
             try {
              const result = await signInWithPopup(auth, provider);
              console.log("LOGIN SUCCESS:", result.user);
              } catch (err) {
             console.error("LOGIN ERROR:", err);
           }
       });
     }
    }

    render();
})();
