(function () {
  const PW = 'CHANGE_ME';
  const STORAGE_KEY = 'portfolio_projects';

  // ── Storage ────────────────────────────────────────────

  function getProjects() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  }

  function saveProjects(projects) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }

  // ── Build a project card DOM element ──────────────────

  function buildCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';

    if (project.imageUrl) {
      const img = document.createElement('img');
      img.src = project.imageUrl;
      img.alt = project.title + ' preview';
      card.appendChild(img);
    } else {
      const ph = document.createElement('div');
      ph.className = 'project-img-placeholder';
      ph.setAttribute('role', 'img');
      ph.setAttribute('aria-label', project.title + ' placeholder');
      ph.innerHTML = '<span>' + project.title + '</span>';
      card.appendChild(ph);
    }

    const body = document.createElement('div');
    body.className = 'project-card-body';

    const h3 = document.createElement('h3');
    h3.textContent = project.title;

    const desc = document.createElement('p');
    desc.textContent = project.description;

    const tags = document.createElement('div');
    tags.className = 'skills-used';
    (project.tags || []).forEach(function (t) {
      const span = document.createElement('span');
      span.className = 'skill-tag';
      span.textContent = t.trim();
      tags.appendChild(span);
    });

    body.appendChild(h3);
    body.appendChild(desc);
    body.appendChild(tags);

    if (project.liveUrl || project.githubUrl) {
      const links = document.createElement('div');
      links.className = 'project-links';
      if (project.liveUrl) {
        const a = document.createElement('a');
        a.href = project.liveUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = 'Live Site';
        links.appendChild(a);
      }
      if (project.githubUrl) {
        const a = document.createElement('a');
        a.href = project.githubUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = 'GitHub';
        links.appendChild(a);
      }
      body.appendChild(links);
    }

    card.appendChild(body);
    return card;
  }

  // ── Render all stored projects (visible to everyone) ──

  function renderStoredProjects() {
    const container = document.querySelector('.projects-container');
    getProjects().forEach(function (p) {
      container.appendChild(buildCard(p));
    });
  }

  // ── Dev "+" card ───────────────────────────────────────

  let devCard = null;

  function showDevCard() {
    if (devCard) return;
    const container = document.querySelector('.projects-container');
    devCard = document.createElement('div');
    devCard.className = 'add-project-card';

    const btn = document.createElement('button');
    btn.className = 'plus-btn';
    btn.setAttribute('aria-label', 'Add new project');
    btn.textContent = '+';
    btn.addEventListener('click', showAddModal);

    devCard.appendChild(btn);
    container.appendChild(devCard);
  }

  // ── Password modal ─────────────────────────────────────

  function showPasswordModal() {
    const overlay = makeOverlay();
    const box = document.createElement('div');
    box.className = 'modal-box';

    const heading = document.createElement('h2');
    heading.textContent = 'Developer Access';

    const pwLabel = makeLabel('Password');
    const pwInput = document.createElement('input');
    pwInput.type = 'password';
    pwInput.placeholder = 'Enter password';
    pwInput.autocomplete = 'off';
    pwLabel.appendChild(pwInput);

    const err = document.createElement('p');
    err.className = 'modal-error';
    err.textContent = 'Incorrect password.';
    err.style.display = 'none';

    const actions = document.createElement('div');
    actions.className = 'modal-actions';

    const cancelBtn = makeBtn('Cancel', 'secondary');
    const submitBtn = makeBtn('Sign In', 'primary');

    function close() { overlay.remove(); }

    function attempt() {
      if (pwInput.value === PW) {
        sessionStorage.setItem('dev', '1');
        close();
        showDevCard();
      } else {
        err.style.display = 'block';
        pwInput.value = '';
        pwInput.focus();
      }
    }

    cancelBtn.addEventListener('click', close);
    submitBtn.addEventListener('click', attempt);
    pwInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') attempt();
      if (e.key === 'Escape') close();
    });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    actions.appendChild(cancelBtn);
    actions.appendChild(submitBtn);
    box.appendChild(heading);
    box.appendChild(pwLabel);
    box.appendChild(err);
    box.appendChild(actions);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    setTimeout(function () { pwInput.focus(); }, 40);
  }

  // ── Add project modal ──────────────────────────────────

  function showAddModal() {
    const overlay = makeOverlay();
    const box = document.createElement('div');
    box.className = 'modal-box modal-box--wide';

    const heading = document.createElement('h2');
    heading.textContent = 'Add Project';

    const titleLabel   = makeLabel('Title *');
    const titleInput   = makeInput('text', 'Project title');
    titleLabel.appendChild(titleInput);

    const descLabel    = makeLabel('Description *');
    const descInput    = document.createElement('textarea');
    descInput.placeholder = 'Short description';
    descLabel.appendChild(descInput);

    const imgLabel     = makeLabel('Image URL (optional)');
    const imgInput     = makeInput('text', 'https://...');
    imgLabel.appendChild(imgInput);

    const tagsLabel    = makeLabel('Tech Tags (comma-separated)');
    const tagsInput    = makeInput('text', 'JavaScript, React, Node.js');
    tagsLabel.appendChild(tagsInput);

    const liveLabel    = makeLabel('Live Site URL (optional)');
    const liveInput    = makeInput('text', 'https://...');
    liveLabel.appendChild(liveInput);

    const ghLabel      = makeLabel('GitHub URL (optional)');
    const ghInput      = makeInput('text', 'https://github.com/...');
    ghLabel.appendChild(ghInput);

    const actions = document.createElement('div');
    actions.className = 'modal-actions';
    const cancelBtn = makeBtn('Cancel', 'secondary');
    const addBtn    = makeBtn('Add Project', 'primary');

    function close() { overlay.remove(); }

    function submit() {
      const title = titleInput.value.trim();
      const description = descInput.value.trim();
      titleInput.style.borderColor = title ? '' : 'var(--accent)';
      descInput.style.borderColor  = description ? '' : 'var(--accent)';
      if (!title || !description) return;

      const project = {
        title:      title,
        description: description,
        imageUrl:   imgInput.value.trim(),
        tags:       tagsInput.value.split(',').map(function (t) { return t.trim(); }).filter(Boolean),
        liveUrl:    liveInput.value.trim(),
        githubUrl:  ghInput.value.trim(),
      };

      const projects = getProjects();
      projects.push(project);
      saveProjects(projects);

      const container = document.querySelector('.projects-container');
      container.insertBefore(buildCard(project), devCard);
      close();
    }

    cancelBtn.addEventListener('click', close);
    addBtn.addEventListener('click', submit);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    const escHandler = function (e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); }
    };
    document.addEventListener('keydown', escHandler);

    [heading, titleLabel, descLabel, imgLabel, tagsLabel, liveLabel, ghLabel].forEach(function (el) {
      box.appendChild(el);
    });
    actions.appendChild(cancelBtn);
    actions.appendChild(addBtn);
    box.appendChild(actions);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    setTimeout(function () { titleInput.focus(); }, 40);
  }

  // ── Exit dev mode ──────────────────────────────────────

  function exitDevMode() {
    sessionStorage.removeItem('dev');
    if (devCard) {
      devCard.remove();
      devCard = null;
    }
  }

  // ── Key sequence: p → w  /  Esc to exit dev mode ──────

  var lastKey = '';
  var lastKeyTime = 0;

  document.addEventListener('keydown', function (e) {
    const tag = document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    if (e.key === 'Escape') {
      // Only exit dev mode when no modal is open (modals handle Esc themselves)
      if (devCard && !document.querySelector('.modal-overlay')) {
        exitDevMode();
      }
      return;
    }

    const now = Date.now();
    if (e.key === 'p') {
      lastKey = 'p';
      lastKeyTime = now;
    } else if (e.key === 'w' && lastKey === 'p' && now - lastKeyTime < 600) {
      lastKey = '';
      showPasswordModal();
    } else {
      lastKey = e.key;
      lastKeyTime = now;
    }
  });

  // ── Helpers ────────────────────────────────────────────

  function makeOverlay() {
    const el = document.createElement('div');
    el.className = 'modal-overlay';
    return el;
  }

  function makeLabel(text) {
    const el = document.createElement('label');
    el.className = 'modal-label';
    el.textContent = text;
    return el;
  }

  function makeInput(type, placeholder) {
    const el = document.createElement('input');
    el.type = type;
    el.placeholder = placeholder;
    return el;
  }

  function makeBtn(text, variant) {
    const el = document.createElement('button');
    el.textContent = text;
    el.className = variant;
    el.type = 'button';
    return el;
  }

  // ── Init ───────────────────────────────────────────────

  renderStoredProjects();
  if (sessionStorage.getItem('dev') === '1') showDevCard();

})();
