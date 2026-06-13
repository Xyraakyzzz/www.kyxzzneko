  const VIDEO_DARK = "https://kappa.lol/2HLn5j";
  const VIDEO_LIGHT = "https://kappa.lol/uJWEb9";
  const vidLoader = document.getElementById('vid-loader');
  const video = document.getElementById('hero-vid');

  function updateVideo(n) {
      if (!video) return;
      const src = n === 'light' ? VIDEO_LIGHT : VIDEO_DARK;
      const source = video.querySelector('source');
      if (source && source.getAttribute('src') !== src) {
          source.setAttribute('src', src);
          vidLoader.classList.add('active');
          video.load();
      }
  }

  video.addEventListener('loadstart', () => vidLoader.classList.add('active'));
  video.addEventListener('canplay', () => vidLoader.classList.remove('active'));
  video.addEventListener('waiting', () => vidLoader.classList.add('active'));
  video.addEventListener('playing', () => vidLoader.classList.remove('active'));

  function setTheme(n) {
      document.documentElement.setAttribute('data-theme', n);
      localStorage.setItem('T', n);
      document.querySelectorAll('.to').forEach(e => e.classList.toggle('active', e.dataset.theme === n));
      document.getElementById('td').classList.remove('open');
      updateVideo(n);
      showToast('Tema: ' + n);
  }

  function toggleTD() {
      document.getElementById('td').classList.toggle('open');
  }
  document.addEventListener('click', e => {
      const d = document.getElementById('td'),
          b = document.getElementById('tb');
      if (!d.contains(e.target) && !b.contains(e.target)) d.classList.remove('open');
  });
  (() => {
      const s = localStorage.getItem('T') || 'dark';
      document.documentElement.setAttribute('data-theme', s);
      document.addEventListener('DOMContentLoaded', () => {
          document.querySelectorAll('.to').forEach(e => e.classList.toggle('active', e.dataset.theme === s));
          updateVideo(s);
      });
  })();

  function createParticles() {
      const container = document.getElementById('particles-container');
      if (!container) return;
      for (let i = 0; i < 12; i++) {
          const particle = document.createElement('div');
          particle.classList.add('particle');
          particle.style.cssText = `
      width:${Math.random()*80+30}px;height:${Math.random()*80+30}px;
      left:${Math.random()*100}%;bottom:-40px;
      animation-duration:${Math.random()*12+8}s;
      animation-delay:${Math.random()*8}s;
    `;
          container.appendChild(particle);
      }
  }
  document.addEventListener('DOMContentLoaded', createParticles);

  let apiTree = null,
      responseCache = {},
      activeChipId = null;

  function showToast(msg, type = 'ok') {
      const t = document.getElementById('toast');
      t.innerHTML = `<i class="fas fa-${type==='ok'?'check-circle':'exclamation-triangle'}"></i> ${msg}`;
      t.classList.add('show');
      clearTimeout(t._t);
      t._t = setTimeout(() => t.classList.remove('show'), 2400);
  }

  function hl(s) {
      if (!s) return '';
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/"([^"]+)"(\s*:)/g, '<span class="jk">"$1"</span>$2')
          .replace(/:\s*"([^"]*)"/g, ': <span class="js">"$1"</span>')
          .replace(/:\s*(-?\d+\.?\d*)/g, ': <span class="jn">$1</span>')
          .replace(/:\s*(true|false)/g, ': <span class="jb">$1</span>')
          .replace(/:\s*(null)/g, ': <span class="jnl">$1</span>');
  }

  function c(str) {
      return str.replace(/[^\w-]/g, "_");
  }

  const FI = {
      ai: 'fa-robot',
      admin: 'fa-shield-halved',
      cache: 'fa-database',
      download: 'fa-download',
      fun: 'fa-gamepad',
      leaderboard: 'fa-trophy',
      library: 'fa-book',
      maker: 'fa-palette',
      news: 'fa-newspaper',
      random: 'fa-shuffle',
      search: 'fa-magnifying-glass',
      stalk: 'fa-eye',
      tools: 'fa-wrench',
      image: 'fa-image',
      video: 'fa-film',
      audio: 'fa-music',
      text: 'fa-file-lines',
      user: 'fa-user',
      data: 'fa-chart-bar',
      media: 'fa-photo-film',
      social: 'fa-share-nodes',
      convert: 'fa-arrows-rotate',
      qris: 'fa-qrcode',
      payment: 'fa-credit-card',
      link: 'fa-link',
      generator: 'fa-bolt',
      weather: 'fa-cloud-sun',
      game: 'fa-dice',
      anime: 'fa-star',
      quote: 'fa-quote-left',
      sticker: 'fa-face-smile'
  };

  function getFI(n) {
      const k = n.toLowerCase();
      for (const [a, b] of Object.entries(FI))
          if (k.includes(a)) return b;
      return 'fa-folder';
  }

  async function fetchData() {
      try {
          const r = await fetch("https://kyzznekoo.zone.id/base/config.json");
          if (!r.ok) throw new Error('HTTP ' + r.status);

          apiTree = await r.json(); // <-- langsung JSON kamu

          buildChips();
      } catch (e) {
          document.getElementById('chips-wrap').innerHTML =
              `<div class="empty" style="color:var(--red)">
            <i class="fas fa-triangle-exclamation"></i>Error: ${e.message}
        </div>`;
      }
  }

  function buildChips() {
      const w = document.getElementById('chips-wrap');
      if (!apiTree?.tags) return;

      const folders = Object.keys(apiTree.tags);

      w.innerHTML = folders.map((name, i) => {
          const count = apiTree.tags[name]?.length || 0;

          return `
        <div class="chip"
            data-id="${name}"
            onclick="selectChip('${name}')"
            style="animation:fadeUp .3s ${i * .04}s ease both">
            <i class="fas ${getFI(name)}"></i>
            ${name}
            <span style="opacity:.55;font-size:.52rem">${count}</span>
        </div>`;
      }).join('');
  }

  function selectChip(id) {
      const p = document.getElementById('ep-panel'),
          sp = document.getElementById('search-panel');

      sp.classList.add('hidden');

      if (activeChipId === id) {
          activeChipId = null;
          document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
          p.classList.add('hidden');
          p.innerHTML = '';
          return;
      }

      activeChipId = id;

      document.querySelectorAll('.chip')
          .forEach(c => c.classList.toggle('active', c.dataset.id === id));

      const list = apiTree.tags?.[id];
      if (!list) return;

      p.innerHTML = renderCatContent(list);
      p.classList.remove('hidden');
  }

  function renderCatContent(list) {
      let h = '';

      list.forEach((x, i) => {
          h += renderEP(x, i * 0.03);
      });

      return h || `<div class="empty"><i class="fas fa-inbox"></i>Tidak ada endpoint</div>`;
  }

  function onSearch() {
      const q = document.getElementById('srch-inp').value.toLowerCase().trim(),
          p = document.getElementById('ep-panel'),
          sp = document.getElementById('search-panel');
      if (!q) {
          sp.classList.add('hidden');
          sp.innerHTML = '';
          if (activeChipId) p.classList.remove('hidden');
          return;
      }
      p.classList.add('hidden');
      const a = [];
      collectAll(apiTree, a);
      const r = a.filter(x => x.name.toLowerCase().includes(q));
      sp.innerHTML = r.length ? r.map((x, i) => renderEP(x, i * .02)).join('') : `<div class="empty"><i class="fas fa-search"></i>Tidak ada hasil untuk "${q}"</div>`;
      sp.classList.remove('hidden');
  }

  function collectAll(data, arr) {
      if (!data?.tags) return;

      for (const list of Object.values(data.tags)) {
          list.forEach(x => arr.push(x));
      }
  }

  function renderEP(ep, d = 0) {
      const mc = ep.method === 'GET' ? 'g' : ep.method === 'POST' ? 'po' : 'd';
      const params = (ep.params || []).map(p => {
          if (p.type === 'file') return ` <div class="fg">
  <div class="fl">
    <span class="fn">${p.name}</span>
    <span class="ft">file</span>
    <span class="fr">*</span>
    <span class="fh">${p.description||'Upload'}</span>
  </div>
  <input type="file" class="fi" id="i-${c(ep.endpoint)}-${p.name}">
</div>`;
          if (p.type === 'select') {
              const o = p.options.map(x => ` <option value="${x}">${x}</option>`).join('');
              return ` <div class="fg">
  <div class="fl">
    <span class="fn">${p.name}</span>
    <span class="ft">select</span>
    <span class="fr">*</span>
    <span class="fh">${p.description||"X"}</span>
  </div>
  <select class="fi" id="i-${c(ep.endpoint)}-${p.name}" onchange="upUrl('${ep.endpoint}')">
    <option value="" disabled selected>-- Pilih --</option>${o}
  </select>
</div>`;
          }
          return ` <div class="fg">
  <div class="fl">
    <span class="fn">${p.name}</span>
    <span class="ft">${p.type}</span>
    <span class="fr">*</span>
    <span class="fh">${p.description||''}</span>
  </div>
  <input type="text" class="fi" id="i-${c(ep.endpoint)}-${p.name}" value="${p.default_value||''}" placeholder="${p.placeholder||p.name}" oninput="upUrl('${ep.endpoint}')">
</div>`;
      }).join('');

      return ` <div class="ep-item" id="ep-${c(ep.endpoint)}" style="animation-delay:${d}s">
  <div class="ep-hdr" onclick="toggleEP('ep-${c(ep.endpoint)}')">
    <span class="mb ${mc}">${ep.method}</span>
    <span class="ep-name">${ep.name}</span>
    <i class="fas fa-chevron-down ep-chv"></i>
  </div>
  <div class="ep-bw">
    <div class="ep-b">
      <div class="ep-bi">
        <div class="ep-info">
          <i class="fas fa-circle-info"></i>
          <span>${ep.filename}</span>
        </div>${params} <span class="ul">Request URL</span>
        <div class="ub">
          <span class="ut" id="u-${c(ep.endpoint)}">${buildURL(ep)}</span>
          <button class="icb" onclick="cpy(document.getElementById('u-${ep.endpoint}').textContent)">
            <i class="fas fa-copy"></i>
          </button>
        </div>
        <button class="xbtn" id="x-${c(ep.endpoint)}" onclick="execAPI('${ep.endpoint}')">
          <i class="fas fa-bolt"></i> Execute </button>
        <div class="rw" id="rw-${c(ep.endpoint)}">
          <div class="rh">
            <div class="rd" id="rd-${c(ep.endpoint)}"></div>
            <span class="rs" id="rs-${c(ep.endpoint)}">IDLE</span>
            <div class="rhr">
              <button class="icb" id="ra-${c(ep.endpoint)}" onclick="cpyR('${ep.endpoint}')">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>
          <div class="rb" id="rb-${c(ep.endpoint)}">
            <pre class="rp">// Awaiting...</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;
  }

  window.toggleEP = id => {
      document.getElementById(id)?.classList.toggle('open');
  };

  function buildURL(ep, vals = {}) {
      if (!ep) return '';
      let u = ep.url || ep.endpoint || '';
      if (!u) return '';

      if (typeof u !== 'string') u = String(u);

      if (!u.startsWith('http')) {
          u = "https://kyzznekoo.zone.id" + ep.endpoint
      }

      if (ep.method === 'GET' && ep.params?.length) {
          const p = ep.params
              .filter(x => x.type !== 'file')
              .map(x => {
                  const v = vals[x.name] ?? x.default_value;
                  return v ? `${x.name}=${encodeURIComponent(v)}` : null;
              })
              .filter(Boolean);

          if (p.length) {
              u += (u.includes('?') ? '&' : '?') + p.join('&');
          }
      }

      return u;
  }

  function findEP(endpoint) {
      if (!apiTree?.tags) return null;
      for (const list of Object.values(apiTree.tags)) {
          const found = list.find(item => item.endpoint === endpoint);
          if (found) return found;
      }
      return null;
  }

  function findNode(n, id) {
      if (!n) return null;
      if (n.type === 'file' && n.id === id) return n;
      for (const c of (n.children || [])) {
          const f = findNode(c, id);
          if (f) return f;
      }
      return null;
  }

  function countFiles(n) {
      return n.type === 'file' ? 1 : (n.children || []).reduce((s, c) => s + countFiles(c), 0);
  }
  window.upUrl = id => {
      const ep = findEP(id);
      if (!ep) return;
      const v = {};
      (ep.params || []).forEach(p => {
          if (p.type !== 'file') {
              const e = document.getElementById(`i-${c(ep.endpoint)}-${p.name}`);
              if (e?.value.trim()) v[p.name] = e.value.trim();
          }
      });
      const b = document.getElementById('u-' + c(id));
      if (b) b.textContent = buildURL(ep, v);
  };

  window.execAPI = async function(X) {
      const eid = c(X);
      console.log("Klick : " + eid);
      const ep = findEP(X);
      console.log("endpoint : " + ep);
      if (!ep) {
          console.error("Endpoint tidak ditemukan:", eid);
          showToast("Endpoint tidak ditemukan", "err");
          return;
      }

      const btn = document.getElementById('x-' + eid),
          rs = document.getElementById('rs-' + eid),
          rd = document.getElementById('rd-' + eid),
          rb = document.getElementById('rb-' + eid),
          ra = document.getElementById('ra-' + eid);
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Executing...';
      rs.className = 'rs';
      rs.textContent = 'FETCHING';
      rd.className = 'rd ld';
      rb.innerHTML = '<pre class="rp">// Sending...</pre>';
      if (responseCache[eid]?.url) URL.revokeObjectURL(responseCache[eid].url);
      delete responseCache[eid];
      const fd = new FormData(),
          qp = [];
      let cu = eid;
      if (!cu.startsWith('http')) cu = "https://kyzznekoo.zone.id" + X;
      let hb = false;
      (ep.params || []).forEach(p => {
          const el = document.getElementById(`i-${eid}-${p.name}`);
          if (!el) return;
          if (p.type === 'file') {
              if (el.files?.length) {
                  fd.append(p.name, el.files[0]);
                  hb = true;
              }
          } else {
              const v = el.value.trim();
              if (v) {
                  if (ep.method === 'GET') qp.push(`${p.name}=${encodeURIComponent(v)}`);
                  else {
                      fd.append(p.name, v);
                      hb = true;
                  }
              }
          }
      });
      let url = cu;
      if (ep.method === 'GET' && qp.length) url += (url.includes('?') ? '&' : '?') + qp.join('&');
      const opts = {
          method: ep.method
      };
      if (ep.method === 'POST' && hb) opts.body = fd;
      try {
          const resp = await fetch(url, opts),
              ct = (resp.headers.get('content-type') || '').toLowerCase(),
              isJson = ct.includes('application/json'),
              isMedia = ct.includes('image/') || ct.includes('video/') || ct.includes('audio/') || ct.includes('application/pdf') || ct.includes('application/zip') || ct.includes('application/octet-stream');
          if (isMedia) {
              const blob = await resp.blob(),
                  ou = URL.createObjectURL(blob);
              responseCache[eid] = {
                  type: 'media',
                  url: ou,
                  mime: ct
              };
              rs.textContent = resp.status + ' ' + resp.statusText;
              rs.className = 'rs ok';
              rd.className = 'rd ok';
              ra.innerHTML = '<i class="fas fa-download"></i>';
              ra.setAttribute('onclick', `dlMedia('${eid}')`);
              rb.style.textAlign = 'center';
              if (ct.includes('image/')) rb.innerHTML = `<img src="${ou}" style="max-width:100%;border-radius:6px;" alt="img"/>`;
              else if (ct.includes('video/')) rb.innerHTML = `<video src="${ou}" controls autoplay style="max-width:100%;border-radius:6px;"></video>`;
              else if (ct.includes('audio/')) rb.innerHTML = `<audio src="${ou}" controls style="width:100%;margin-top:6px;"></audio>`;
              else if (ct.includes('application/pdf')) rb.innerHTML = `<iframe src="${ou}" style="width:100%;height:280px;border:none;border-radius:6px;"></iframe>`;
              else rb.innerHTML = `<div style="padding:12px;text-align:left;font-family:var(--mono);font-size:.62rem;color:var(--mu2);">Binary (${ct})<br><a href="${ou}" download="response" class="bdl"><i class="fas fa-download"></i> Download</a></div>`;
          } else if (isJson) {
              const data = await resp.json(),
                  apiStatus = data.hasOwnProperty('status') ? Boolean(data.status) : true,
                  sc = apiStatus ? 200 : 500,
                  st = `${sc} ${apiStatus?'OK':'Internal Server Error (status: false)'}`;
              rs.textContent = st;
              rs.className = 'rs ' + (apiStatus ? 'ok' : 'err');
              rd.className = 'rd ' + (apiStatus ? 'ok' : 'err');
              let formatted = JSON.stringify(data, null, 2);
              rb.innerHTML = `<pre class="rp" id="rp-${eid}">${hl(formatted)}</pre>`;
              ra.innerHTML = '<i class="fas fa-copy"></i>';
              ra.setAttribute('onclick', `cpyR('${eid}')`);
              responseCache[eid] = {
                  type: 'text',
                  data: formatted
              };
          } else {
              const raw = await resp.text();
              rs.textContent = resp.status + ' ' + resp.statusText;
              rs.className = 'rs ' + (resp.ok ? 'ok' : 'err');
              rd.className = 'rd ' + (resp.ok ? 'ok' : 'err');
              rb.innerHTML = `<pre class="rp" id="rp-${eid}">${hl(raw)}</pre>`;
              ra.innerHTML = '<i class="fas fa-copy"></i>';
              ra.setAttribute('onclick', `cpyR('${eid}')`);
              responseCache[eid] = {
                  type: 'text',
                  data: raw
              };
          }
      } catch (e) {
          rs.textContent = 'Network Error';
          rs.className = 'rs err';
          rd.className = 'rd err';
          rb.innerHTML = `<pre class="rp" style="color:var(--red)">// ${e.message}</pre>`;
      }
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-bolt"></i> Execute';
  };

  window.cpy = t => navigator.clipboard?.writeText(t).then(() => showToast('Copied!')).catch(() => showToast('Gagal', 'err'));
  window.cpyR = id => {
      const el = document.getElementById('rp-' + id);
      if (el) cpy(el.innerText);
      else showToast('Nothing to copy', 'err');
  };
  window.dlMedia = function(id) {
      const c = responseCache[id];
      if (!c?.url) return;
      const ext = {};
      'image/jpeg,jpg;image/png,png;image/gif,gif;image/webp,webp;video/mp4,mp4;audio/mpeg,mp3;application/pdf,pdf;application/zip,zip'.split(';').forEach(s => {
          const [k, v] = s.split(',');
          ext[k] = v;
      });
      const a = document.createElement('a');
      a.href = c.url;
      a.download = `Kyxzz.${ext[c.mime.split(';')[0].trim()]||'bin'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Download started!');
  };

  document.addEventListener('DOMContentLoaded', fetchData);
