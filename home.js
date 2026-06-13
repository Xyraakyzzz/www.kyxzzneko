const THEMES = ['dark','light'];
        function setTheme(name) {
            if (!THEMES.includes(name)) name = 'dark';
            document.documentElement.setAttribute('data-theme', name);
            localStorage.setItem('kyxzzapi_theme', name);
            document.querySelectorAll('.theme-option').forEach(el => {
                el.classList.toggle('active', el.dataset.theme === name);
            });
            document.getElementById('theme-drawer').classList.remove('open');
        }
        function toggleThemeDrawer() {
            document.getElementById('theme-drawer').classList.toggle('open');
        }
        document.addEventListener('click', e => {
            const drawer = document.getElementById('theme-drawer');
            const btn    = document.getElementById('theme-btn');
            if (!drawer.contains(e.target) && !btn.contains(e.target)) {
                drawer.classList.remove('open');
            }
        });
        (function() {
            const saved = localStorage.getItem('kyxzz_theme') || 'dark';
            document.documentElement.setAttribute('data-theme', saved);
            document.addEventListener('DOMContentLoaded', () => {
                document.querySelectorAll('.theme-option').forEach(el => {
                    el.classList.toggle('active', el.dataset.theme === saved);
                });
            });
        })();

        lucide.createIcons();
        AOS.init({ once: true, offset: 50, easing: 'ease-out-cubic' });

        const navbar = document.getElementById('navbar');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) navbar.classList.add('shadow-md');
            else navbar.classList.remove('shadow-md');
        });

        const counters = document.querySelectorAll('.counter');
        const speed = 200;
        const animateCounters = () => {
            counters.forEach(counter => {
                const updateCount = () => {
                    const target = +counter.getAttribute('data-target');
                    const count = +counter.innerText;
                    const inc = target / speed;
                    if (count < target) {
                        counter.innerText = Math.ceil(count + inc);
                        setTimeout(updateCount, 15);
                    } else counter.innerText = target;
                };
                updateCount();
            });
        };
        const observerOptions = { threshold: 0.5 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        const statsSection = document.querySelector('.grid.lg\\:grid-cols-4');
        if(statsSection) observer.observe(statsSection);

        function copyText(text, btnElement) {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "absolute";
            textArea.style.left = "-999999px";
            document.body.prepend(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                const icon = btnElement.querySelector('i');
                const originalIcon = icon.getAttribute('data-lucide');
                btnElement.style.color = 'var(--accent)';
                btnElement.style.borderColor = 'var(--accent)';
                icon.setAttribute('data-lucide', 'check');
                lucide.createIcons();
                setTimeout(() => {
                    btnElement.style.color = '';
                    btnElement.style.borderColor = '';
                    icon.setAttribute('data-lucide', originalIcon);
                    lucide.createIcons();
                }, 2000);
            } catch (error) {
                console.error('Gagal menyalin teks', error);
            } finally {
                textArea.remove();
            }
        }

let map;
let marker;

function initMap(lat, lon) {
  map = L.map('visitorMap').setView([lat, lon], 11);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: ''
  }).addTo(map);

  marker = L.marker([lat, lon])
    .addTo(map)
    .bindPopup("Location Server")
    .openPopup();
}

function updateMap(lat, lon) {
  if (!map) return initMap(lat, lon);

  map.setView([lat, lon], 11);

  if (marker) map.removeLayer(marker);

  marker = L.marker([lat, lon])
    .addTo(map)
    .bindPopup("Your Location (IP Based)")
    .openPopup();
}

function fillVisitor(res) {
  const d = res.data;

  document.getElementById("visitorCity").textContent = d.city || "-";
  document.getElementById("visitorRegion").textContent = `${d.regionName || "-"}, ${d.country || "-"}`;
  document.getElementById("visitorTimezone").textContent = d.timezone || "-";
  document.getElementById("visitorLat").textContent = d.lat ?? "-";
  document.getElementById("visitorLon").textContent = d.lon ?? "-";
  
  if (d.lat && d.lon) {
    updateMap(parseFloat(d.lat), parseFloat(d.lon));
  }
}

async function loadVisitor() {
  try {
    const res = await fetch("https://kyzznekoo.zone.id/api/about");
    const json = await res.json();

    fillVisitor(json);
  } catch (err) {
    console.error("Failed load visitor:", err);
  }
}

async function loadIP() {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();

    document.getElementById("visitorIp").textContent = data.ip || "-";
  } catch (e) {
    document.getElementById("visitorIp").textContent = "-";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadVisitor();
  loadIP();
});
       
