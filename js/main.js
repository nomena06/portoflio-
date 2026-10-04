/* ============================================================
   Nomena Ramananarivo — portfolio behaviour
   Theme, language (EN/FR), navigation, reveal, contact form.
   ============================================================ */
(() => {
  'use strict';

  /* ---------- 1. Theme ---------- */
  const html = document.documentElement;
  const THEME_KEY = 'nr-theme';
  const stored = localStorage.getItem(THEME_KEY);
  if (stored) {
    html.dataset.theme = stored;
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    html.dataset.theme = 'light';
  }
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, html.dataset.theme);
  });

  /* ---------- 2. Translations ---------- */
  const FR = {
    'skip': 'Aller au contenu',
    'nav.services': 'Services', 'nav.work': 'Réalisations', 'nav.process': 'Méthode',
    'nav.about': 'À propos', 'nav.contact': 'Contact',

    'hero.badge': 'Disponible pour de nouveaux projets',
    'hero.title1': "J'automatise la moitié ennuyeuse",
    'hero.title2': 'de votre journée de travail.',
    'hero.lead': "Odoo, automatisation Excel VBA et outils .NET sur mesure pour les équipes qui grandissent. Montrez-moi le processus que vous redoutez chaque matin : vous le récupérez sous forme de système qui tourne tout seul.",
    'hero.cta1': 'Demander un devis gratuit',
    'hero.cta2': 'Voir les réalisations',
    'hero.stat1': "années sur Excel & VBA",
    'hero.stat2': 'de temps de reporting en moins',
    'hero.stat3': 'pour une première livraison',

    'strip.label': 'Technologies',

    'value.kicker': 'Le problème',
    'value.title': 'Les tableaux manuels coûtent plus cher qu’ils n’en ont l’air',
    'value.sub': "Trois heures de copier-coller par jour, c'est un demi-salaire dépensé pour un travail qu'une macro fait en quatre secondes.",
    'value.p1.t': 'Des heures perdues chaque semaine',
    'value.p1.d': "Resaisir, reformater, renvoyer le même fichier. L'automatisation vous rend ce temps définitivement.",
    'value.p2.t': 'Des erreurs que personne ne voit',
    'value.p2.d': "Une seule référence de cellule erronée arrive sur une facture client. Des règles de contrôle l'arrêtent avant l'envoi.",
    'value.p3.t': 'Un savoir-faire dans une seule tête',
    'value.p3.d': "Quand « la personne qui maîtrise Excel » est en congé, tout s'arrête. Un outil documenté fait tourner l'équipe.",

    'services.kicker': 'Services',
    'services.title': 'Ce que je construis pour vous',
    'services.sub': 'Périmètre fixe, prix fixe, code source et documentation inclus.',
    'services.s0.pill': 'Le plus demandé',
    'services.s0.t': 'Odoo ERP — mise en place, personnalisation, intégration',
    'services.s0.d': "Je configure Odoo autour de votre façon de travailler, puis je l'étends là où les modules standards s'arrêtent : champs et vues personnalisés, nouveaux modules en Python, documents imprimables (QWeb) et migration de vos tableaux actuels.",
    'services.s0.l1': 'Paramétrage Ventes, Stock, Facturation, Achats, RH',
    'services.s0.l2': 'Modules sur mesure & automatisations (Python)',
    'services.s0.l3': 'Modèles de factures et rapports QWeb',
    'services.s0.l4': 'Import, export et synchronisation Excel ↔ Odoo',
    'services.s0.l5': "Migration depuis Excel ou un ancien ERP",
    'services.s0.l6': 'Formation des utilisateurs et reprise documentée',
    'services.s1.t': 'Automatisation Excel & VBA',
    'services.s1.d': 'Macros, formulaires et boutons qui remplacent des routines manuelles entières : imports, fusions, nettoyage, envois.',
    'services.s1.l1': 'Imports et fusions multi-fichiers',
    'services.s1.l2': 'Formulaires de saisie avec contrôles',
    'services.s1.l3': 'Exécution planifiée ou en un clic',
    'services.s2.t': 'Tableaux de bord & reporting',
    'services.s2.d': 'Tableaux de bord KPI construits sur Power Query et les TCD, exportés en PDF ou envoyés automatiquement.',
    'services.s2.l1': 'Tableaux de bord KPI et commerciaux',
    'services.s2.l2': 'Envoi automatique par PDF / e-mail',
    'services.s2.l3': "Power BI quand Excel ne suffit plus",
    'services.s3.t': 'Applications métier .NET',
    'services.s3.d': "Quand un classeur devient trop petit : une vraie application avec base de données, rôles et traçabilité.",
    'services.s3.l1': 'Applications web ASP.NET Core',
    'services.s3.l2': 'Outils bureau Windows (C#)',
    'services.s3.l3': 'Modèle de données SQL Server & migration',
    'services.s4.t': 'Nettoyage & sauvetage de données',
    'services.s4.d': "Formules cassées, doublons, un fichier qui met deux minutes à s'ouvrir : je corrige et je documente.",
    'services.s4.l1': 'Dédoublonnage et normalisation',
    'services.s4.l2': 'Optimisation des fichiers lourds',
    'services.s4.l3': 'Documentation de reprise',

    'work.kicker': 'Réalisations',
    'work.title': 'Des projets et ce qu’ils ont changé',
    'work.sub': "Chaque projet ci-dessous a remplacé une routine manuelle quotidienne ou hebdomadaire.",
    'work.result': 'Résultat',
    'work.p0.t': 'ERP Odoo pour une société de distribution',
    'work.p0.d': "Ventes, stock et facturation sortis de cinq classeurs partagés vers Odoo, avec un module sur mesure pour les tournées de livraison et une facture QWeb à leur charte. Trois ans d'historique migrés et rapprochés.",
    'work.p0.r': "Une seule source de vérité au lieu de cinq fichiers ; factures émises le jour même au lieu de la semaine suivante.",
    'work.p1.t': 'Système de gestion de stock',
    'work.p1.d': "Classeur suivant les mouvements de trois dépôts, avec alertes de stock bas et liste d'achats automatique.",
    'work.p1.r': '2 heures de comptage quotidien supprimées, ruptures de stock quasi éliminées.',
    'work.p2.t': 'Rapports mensuels en un clic',
    'work.p2.d': 'Exports bruts actualisés, nettoyés, analysés puis publiés en PDF à la charte et envoyés à la direction.',
    'work.p2.r': 'Temps de reporting réduit de 80 %, de deux jours à une demi-heure.',
    'work.p3.t': 'Outil de facturation & devis',
    'work.p3.d': "Application bureau remplaçant un classeur partagé : clients, factures numérotées, TVA, sortie PDF et historique SQL.",
    'work.p3.r': 'Plus de numéros de facture en double, et des devis émis en quelques minutes.',
    'work.p4.t': 'Pointage & préparation de la paie',
    'work.p4.d': 'Exports de badgeuse transformés en heures mensuelles, heures supplémentaires et soldes de congés, prêts pour le prestataire de paie.',
    'work.p4.r': 'Préparation de la paie ramenée de trois jours à un après-midi.',

    'process.kicker': 'Comment on travaille',
    'process.title': 'Quatre étapes, aucune surprise',
    'process.s1.t': 'Envoyez le fichier',
    'process.s1.d': "Vous me montrez la tâche telle qu'elle est aujourd'hui. Je demande à quoi doit ressembler le résultat.",
    'process.s2.t': 'Devis fixe',
    'process.s2.d': 'Périmètre, prix et date de livraison écrits sous 24 heures. Pas de facturation horaire surprise.',
    'process.s3.t': 'Développement & retours',
    'process.s3.d': "Vous testez une version fonctionnelle tôt et demandez des changements quand ils coûtent encore peu.",
    'process.s4.t': 'Livraison',
    'process.s4.d': 'Code source, guide court et 30 jours de corrections inclus après la livraison.',

    'about.kicker': 'À propos',
    'about.title': 'Bonjour, je suis Nomena',
    'about.p1': "Je suis développeur basé à Madagascar et je travaille à distance avec des équipes en Europe et en Afrique. J'ai commencé par automatiser mon propre reporting, et j'ai constaté que la plupart des bureaux perdent les mêmes heures sur les mêmes tâches.",
    'about.p2': "Aujourd'hui je travaille sur trois terrains — Odoo, Excel VBA et .NET — ce qui me permet de vous dire honnêtement si votre problème demande une macro, un module Odoo ou une application complète, au lieu de vous vendre la plus grosse solution.",
    'about.f1.t': 'Langues', 'about.f1.d': 'Français, anglais, malgache',
    'about.f2.t': 'Fuseau horaire', 'about.f2.d': 'UTC+3 — en phase avec les matinées européennes',
    'about.f3.t': 'Façon de travailler', 'about.f3.d': 'Prix fixe, point hebdomadaire, code qui vous appartient',
    'about.quote': '« Si un humain le fait deux fois par semaine, c’est à une machine de le faire. »',
    'about.quoteby': '— ma façon de choisir les projets',

    'contact.kicker': 'Contact',
    'contact.title': 'Parlez-moi de la tâche dont vous voulez vous débarrasser',
    'contact.sub': "Joignez le fichier ou décrivez-le simplement. Réponse sous un jour ouvré, devis sous 24 heures.",
    'form.name': 'Votre nom', 'form.email': 'E-mail', 'form.need': 'De quoi avez-vous besoin ?',
    'form.need0': 'Odoo (mise en place, module, migration)',
    'form.need1': 'Automatisation Excel / VBA',
    'form.need2': 'Tableau de bord ou reporting',
    'form.need3': 'Application .NET',
    'form.need4': 'Corriger un fichier existant',
    'form.need5': 'Autre chose',
    'form.msg': 'Décrivez la tâche', 'form.send': 'Envoyer le message',
    'form.note': "Cela ouvre votre application e-mail avec le message prêt — rien n'est stocké sur ce site.",

    'footer.role': 'développeur Odoo, Excel VBA & .NET',
    'footer.mail': 'E-mail', 'footer.top': 'Haut de page'
  };

  const MESSAGES = {
    en: { required: 'This field is required.', email: 'Enter a valid email address.',
          ok: 'Your email app is opening with the message ready. If nothing happens, write to nomenaramananarivo2@gmail.com.' },
    fr: { required: 'Ce champ est obligatoire.', email: 'Saisissez une adresse e-mail valide.',
          ok: "Votre application e-mail s'ouvre avec le message prêt. Si rien ne se passe, écrivez à nomenaramananarivo2@gmail.com." }
  };

  /* keep the original English strings so FR -> EN works without a reload */
  const nodes = document.querySelectorAll('[data-i18n]');
  const EN = {};
  nodes.forEach(n => { EN[n.dataset.i18n] = n.innerHTML; });

  const LANG_KEY = 'nr-lang';
  const browserFr = (navigator.language || 'en').toLowerCase().startsWith('fr');
  let lang = localStorage.getItem(LANG_KEY) || (browserFr ? 'fr' : 'en');

  function applyLang(next) {
    lang = next;
    const dict = next === 'fr' ? FR : EN;
    nodes.forEach(n => {
      const key = n.dataset.i18n;
      const value = dict[key] ?? EN[key];
      if (value != null) n.innerHTML = value;
    });
    document.documentElement.lang = next;
    localStorage.setItem(LANG_KEY, next);
    document.querySelectorAll('.lang-switch button').forEach(b => {
      const on = b.dataset.lang === next;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }
  document.querySelectorAll('.lang-switch button').forEach(b => {
    b.addEventListener('click', () => applyLang(b.dataset.lang));
  });
  applyLang(lang);

  /* ---------- 3. Header state + mobile nav ---------- */
  const header = document.getElementById('header');
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');

  burger?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    burger?.setAttribute('aria-expanded', 'false');
  }));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav?.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      burger?.setAttribute('aria-expanded', 'false');
      burger?.focus();
    }
  });

  const onScroll = () => header?.classList.toggle('is-stuck', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- 4. Reveal on scroll ---------- */
  const revealables = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    revealables.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 4, 3) * 70}ms`;
      io.observe(el);
    });
  } else {
    revealables.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- 5. Active nav link ---------- */
  const sections = [...document.querySelectorAll('main section[id]')];
  const links = new Map([...document.querySelectorAll('.nav a[href^="#"]')]
    .map(a => [a.getAttribute('href').slice(1), a]));
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const link = links.get(entry.target.id);
        if (link && entry.isIntersecting) {
          links.forEach(l => l.classList.remove('is-active'));
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  /* ---------- 6. Contact form -> mailto ---------- */
  const form = document.getElementById('contact-form');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const t = MESSAGES[lang] || MESSAGES.en;

    form.querySelectorAll('.err').forEach(n => n.remove());
    form.querySelectorAll('.has-error').forEach(n => n.classList.remove('has-error'));
    form.querySelector('.form-ok')?.remove();

    const fail = (input, msg) => {
      const field = input.closest('.field');
      field.classList.add('has-error');
      const p = document.createElement('p');
      p.className = 'err';
      p.textContent = msg;
      field.appendChild(p);
    };

    const name = form.elements.name, email = form.elements.email, message = form.elements.message;
    let ok = true;
    if (!name.value.trim())    { fail(name, t.required); ok = false; }
    if (!email.value.trim())   { fail(email, t.required); ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) { fail(email, t.email); ok = false; }
    if (!message.value.trim()) { fail(message, t.required); ok = false; }
    if (!ok) { form.querySelector('.has-error input, .has-error textarea')?.focus(); return; }

    const need = form.elements.need.value;
    const subject = `[Portfolio] ${need} — ${name.value.trim()}`;
    const body = [
      `Name: ${name.value.trim()}`,
      `Email: ${email.value.trim()}`,
      `Need: ${need}`,
      '',
      message.value.trim()
    ].join('\n');

    window.location.href = 'mailto:nomenaramananarivo2@gmail.com'
      + `?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const note = document.createElement('p');
    note.className = 'form-ok';
    note.textContent = t.ok;
    form.appendChild(note);
  });

  /* ---------- 7. Footer year ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
