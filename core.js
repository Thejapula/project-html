/* ============================================================
   PRS Core — storage, seed data, auth, shared UI
   ============================================================ */
(function (global) {
  'use strict';

  var KEYS = {
    users: 'prs_users',
    session: 'prs_session',
    courses: 'prs_courses',
    enrollments: 'prs_enrollments',
    content: 'prs_content',
    submissions: 'prs_submissions',
    reviews: 'prs_reviews',
    notifications: 'prs_notifications',
    activities: 'prs_activities',
    completed: 'prs_completed'
  };

  /* ---------------- Storage ---------------- */
  function get(key, fallback) {
    try {
      var raw = localStorage.getItem(KEYS[key] || key);
      return raw ? JSON.parse(raw) : (fallback !== undefined ? fallback : []);
    } catch (e) { return fallback !== undefined ? fallback : []; }
  }
  function set(key, value) {
    localStorage.setItem(KEYS[key] || key, JSON.stringify(value));
  }
  function uid(prefix) {
    return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  function daysAgo(n) { return new Date(Date.now() - n * 86400000).toISOString(); }

  /* ---------------- Icons ---------------- */
  var PATHS = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/>',
    book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M4 17.5h16"/>',
    layers: '<path d="m12 2 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
    upload: '<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
    star: '<path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/>',
    chart: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-5 7-5s7 1.5 7 5"/><path d="M17 5.5a3.5 3.5 0 0 1 0 6"/><path d="M18 15c2.5.5 4 2 4 5"/>',
    shield: '<path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 15h10l1-15"/><path d="M10 10v7M14 10v7"/>',
    check: '<path d="m20 6-11 11-5-5"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
    play: '<path d="m8 5 11 7-11 7z"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h6"/>',
    note: '<path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    award: '<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 8 5-3 5 3-1.5-8"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7"/><circle cx="12" cy="12" r="3"/>',
    message: '<path d="M21 15a3 3 0 0 1-3 3H8l-5 3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    spark: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
    graduation: '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c0 2 3 3.5 6 3.5s6-1.5 6-3.5v-5"/><path d="M22 9v6"/>',
    code: '<path d="m8 8-4 4 4 4"/><path d="m16 8 4 4-4 4"/><path d="m14 5-4 14"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18h1.5a2.5 2.5 0 0 0 0-5H13a2 2 0 0 1 0-4h5a3 3 0 0 0 3-3c0-3.3-4-6-9-6"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7.5" r="1"/><circle cx="15" cy="8" r="1"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V4h8v3"/><path d="M3 12h18"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    checkcircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    alert: '<path d="M12 3 2 20h20z"/><path d="M12 9v5M12 17h.01"/>',
    refresh: '<path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M18.5 9A7 7 0 0 0 6 6.5L4 12"/><path d="m5.5 15A7 7 0 0 0 18 17.5L20 12"/>',
    external: '<path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    trophy: '<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3"/><path d="M12 14v4M8 21h8M9 18h6"/>'
  };

  function icon(name, size) {
    var s = size || 20;
    return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" ' +
      'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (PATHS[name] || PATHS.info) + '</svg>';
  }
  function starSvg(filled) {
    return '<svg viewBox="0 0 24 24" width="26" height="26" fill="' + (filled ? 'currentColor' : 'none') +
      '" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/></svg>';
  }

  /* ---------------- Seed data ---------------- */
  var SEED_COURSES = [
    { id: 'c1', code: 'CS201', title: 'Web Development Fundamentals', category: 'Development', emoji: '💻', instructor: 'Prof. Sophia Lee', credits: 3, students: 128, desc: 'Build responsive, accessible websites with HTML, CSS and JavaScript.' },
    { id: 'c2', code: 'CS305', title: 'Data Structures & Algorithms', category: 'Computer Science', emoji: '🧠', instructor: 'Daniel Kim', credits: 4, students: 96, desc: 'Master arrays, trees, graphs and the algorithms that power them.' },
    { id: 'c3', code: 'DES110', title: 'UI/UX Design Basics', category: 'Design', emoji: '🎨', instructor: 'Prof. Sophia Lee', credits: 3, students: 154, desc: 'Learn user research, wireframing and modern interface design.' },
    { id: 'c4', code: 'BUS220', title: 'Digital Marketing Essentials', category: 'Business', emoji: '📈', instructor: 'Dr. Admin', credits: 2, students: 87, desc: 'Understand SEO, social media and data-driven campaigns.' },
    { id: 'c5', code: 'AI401', title: 'Introduction to Machine Learning', category: 'Data Science', emoji: '🤖', instructor: 'Daniel Kim', credits: 4, students: 73, desc: 'Explore models, training data and real-world ML applications.' },
    { id: 'c6', code: 'CS330', title: 'Mobile App Development', category: 'Development', emoji: '📱', instructor: 'Prof. Sophia Lee', credits: 3, students: 64, desc: 'Design and build cross-platform mobile applications.' },
    { id: 'c7', code: 'SEC150', title: 'Cybersecurity Awareness', category: 'Security', emoji: '🔐', instructor: 'Dr. Admin', credits: 2, students: 112, desc: 'Protect accounts, data and systems with practical security habits.' },
    { id: 'c8', code: 'COM105', title: 'Business Communication', category: 'Business', emoji: '💬', instructor: 'Dr. Admin', credits: 2, students: 141, desc: 'Write and present with clarity in professional settings.' }
  ];

  function seed() {
    if (get('users', null) !== null) return; // already initialized

    var users = [
      { id: 'u_admin', name: 'Dr. Admin', email: 'admin@prs.edu', password: 'admin123', role: 'admin', joinedAt: daysAgo(120) },
      { id: 'u_sophia', name: 'Prof. Sophia Lee', email: 'reviewer@prs.edu', password: 'review123', role: 'reviewer', joinedAt: daysAgo(100) },
      { id: 'u_daniel', name: 'Daniel Kim', email: 'reviewer2@prs.edu', password: 'review123', role: 'reviewer', joinedAt: daysAgo(90) },
      { id: 'u_alex', name: 'Alex Johnson', email: 'student@prs.edu', password: 'student123', role: 'student', joinedAt: daysAgo(45) },
      { id: 'u_maya', name: 'Maya Chen', email: 'maya@prs.edu', password: 'student123', role: 'student', joinedAt: daysAgo(30) },
      { id: 'u_liam', name: 'Liam Brown', email: 'liam@prs.edu', password: 'student123', role: 'student', joinedAt: daysAgo(22) }
    ];
    set('users', users);

    set('courses', SEED_COURSES.map(function (c) { return Object.assign({}, c); }));

    var content = [];
    var contentTemplates = {
      c1: [
        ['video', 'Getting Started with HTML5', 'Learn the building blocks of the web.', 'https://www.youtube.com/watch?v=pQN-pnXPaVg'],
        ['document', 'CSS Layout Handbook', 'Flexbox, grid and responsive patterns.', 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout'],
        ['note', 'JavaScript Essentials Checklist', 'Variables, functions, DOM events and fetch.'],
        ['video', 'Build Your First Responsive Page', 'Hands-on walkthrough from blank file to finished page.', 'https://www.youtube.com/watch?v=srvUrASNj0s']
      ],
      c2: [
        ['video', 'Big-O Notation Explained', 'Understanding time and space complexity.', 'https://www.youtube.com/watch?v=v4cd1O4zkGw'],
        ['document', 'Trees & Graphs Reference', 'Traversals, BSTs and shortest paths.'],
        ['note', 'Algorithm Practice Problems', 'Ten problems with hints and solutions.']
      ],
      c3: [
        ['video', 'Design Thinking Process', 'Empathize, define, ideate, prototype, test.', 'https://www.youtube.com/watch?v=_7W9r8vFtO0'],
        ['document', 'Wireframing Guide', 'From sketch to low-fidelity mockup.'],
        ['note', 'Colour & Typography Notes', 'Contrast, hierarchy and readable type.']
      ]
    };
    SEED_COURSES.forEach(function (c) {
      var t = contentTemplates[c.id] || [
        ['video', 'Welcome to ' + c.title, 'Course orientation and key concepts.', 'https://www.youtube.com/results?search_query=' + encodeURIComponent(c.title)],
        ['document', c.code + ' Study Guide', 'Topics, readings and useful links.'],
        ['note', c.code + ' Quick Notes', 'Summary of the most important ideas.']
      ];
      t.forEach(function (row, i) {
        content.push({
          id: 'ct_' + c.id + '_' + i, courseId: c.id, type: row[0], title: row[1],
          description: row[2], url: row[3] || '', addedBy: 'u_admin', createdAt: daysAgo(20 - i)
        });
      });
    });
    set('content', content);

    var enrollments = [];
    [['u_alex', 'c1'], ['u_alex', 'c2'], ['u_alex', 'c3'], ['u_maya', 'c1'], ['u_maya', 'c5'], ['u_liam', 'c3'], ['u_liam', 'c1']].forEach(function (e, i) {
      enrollments.push({ id: 'en_' + i, userId: e[0], courseId: e[1], enrolledAt: daysAgo(18 - i) });
    });
    set('enrollments', enrollments);

    var completed = [];
    ['ct_c1_0', 'ct_c1_1', 'ct_c1_2', 'ct_c2_0', 'ct_c3_0', 'ct_c1_0', 'ct_c3_0', 'ct_c3_1'].forEach(function (cid, i) {
      var u = i < 5 ? 'u_alex' : (i < 7 ? 'u_maya' : 'u_liam');
      completed.push({ id: 'cp_' + i, userId: u, contentId: cid, completedAt: daysAgo(10 - i) });
    });
    set('completed', completed);

    var submissions = [
      { id: 's1', userId: 'u_alex', courseId: 'c1', title: 'Build a Responsive Portfolio', description: 'Create a personal portfolio page using semantic HTML, CSS Grid and a little JavaScript. It must work on mobile.', link: 'https://github.com/alexjohnson/portfolio-demo', fileName: '', status: 'reviewed', reviewerId: 'u_sophia', createdAt: daysAgo(9) },
      { id: 's2', userId: 'u_maya', courseId: 'c1', title: 'Build a Responsive Portfolio', description: 'A two-column responsive portfolio with an interactive project filter.', link: 'https://github.com/mayachen/portfolio', fileName: '', status: 'assigned', reviewerId: 'u_sophia', createdAt: daysAgo(4) },
      { id: 's3', userId: 'u_liam', courseId: 'c3', title: 'Design a Mobile Onboarding Flow', description: 'Three-screen onboarding flow with wireframes and a short rationale.', link: '', fileName: 'onboarding-flow.pdf', status: 'assigned', reviewerId: 'u_daniel', createdAt: daysAgo(3) },
      { id: 's4', userId: 'u_alex', courseId: 'c2', title: 'Implement a Binary Search Tree', description: 'Write insert, search and in-order traversal functions with tests.', link: 'https://github.com/alexjohnson/bst', fileName: '', status: 'pending', reviewerId: null, createdAt: daysAgo(2) },
      { id: 's5', userId: 'u_maya', courseId: 'c5', title: 'Explore a Dataset', description: 'Load a public dataset, clean it and describe three insights.', link: '', fileName: 'dataset-report.docx', status: 'reviewed', reviewerId: 'u_daniel', createdAt: daysAgo(12) }
    ];
    set('submissions', submissions);

    set('reviews', [
      { id: 'r1', submissionId: 's1', reviewerId: 'u_sophia', rating: 5, feedback: 'Excellent work! Your layout is clean, semantic and truly responsive. The small hover details make the page feel polished.', comments: 'Consider adding a short README with setup steps next time.', createdAt: daysAgo(5) },
      { id: 'r2', submissionId: 's5', reviewerId: 'u_daniel', rating: 4, feedback: 'Solid analysis and clear visuals. Your data cleaning steps were easy to follow.', comments: 'Add a citation for the dataset source to strengthen the report.', createdAt: daysAgo(7) }
    ]);

    var notifications = [
      { id: 'n1', userId: 'u_alex', type: 'feedback', title: 'Feedback received', message: 'Prof. Sophia Lee reviewed your submission “Build a Responsive Portfolio”.', read: false, createdAt: daysAgo(5) },
      { id: 'n2', userId: 'u_alex', type: 'enroll', title: 'Enrollment confirmed', message: 'You are now enrolled in UI/UX Design Basics.', read: true, createdAt: daysAgo(12) },
      { id: 'n3', userId: 'u_sophia', type: 'review', title: 'Review assigned', message: 'Maya Chen submitted “Build a Responsive Portfolio” for peer review.', read: false, createdAt: daysAgo(4) },
      { id: 'n4', userId: 'u_daniel', type: 'review', title: 'Review assigned', message: 'Liam Brown submitted “Design a Mobile Onboarding Flow”.', read: true, createdAt: daysAgo(3) },
      { id: 'n5', userId: 'u_maya', type: 'assignment', title: 'Assignment reminder', message: 'Web Development Fundamentals: portfolio submission is open.', read: false, createdAt: daysAgo(6) },
      { id: 'n6', userId: 'u_maya', type: 'feedback', title: 'Feedback received', message: 'Daniel Kim reviewed your “Explore a Dataset” submission.', read: true, createdAt: daysAgo(7) }
    ];
    set('notifications', notifications);

    set('activities', [
      { id: 'a1', userId: 'u_alex', text: 'Received feedback on “Build a Responsive Portfolio”', createdAt: daysAgo(5) },
      { id: 'a2', userId: 'u_alex', text: 'Submitted “Implement a Binary Search Tree”', createdAt: daysAgo(2) },
      { id: 'a3', userId: 'u_alex', text: 'Enrolled in UI/UX Design Basics', createdAt: daysAgo(12) },
      { id: 'a4', userId: 'u_sophia', text: 'Reviewed a submission from Alex Johnson', createdAt: daysAgo(5) },
      { id: 'a5', userId: 'u_maya', text: 'Submitted “Build a Responsive Portfolio”', createdAt: daysAgo(4) }
    ]);
    set('session', null);
  }

  /* ---------------- Auth ---------------- */
  function currentUser() { return get('session', null); }
  function findUserByEmail(email) {
    return get('users', []).filter(function (u) { return u.email.toLowerCase() === String(email).toLowerCase(); })[0] || null;
  }
  function login(email, password, remember) {
    var u = findUserByEmail(email);
    if (!u) return { ok: false, error: 'No account found with that email.' };
    if (u.password !== password) return { ok: false, error: 'Incorrect password. Please try again.' };
    set('session', { userId: u.id, remember: !!remember, at: new Date().toISOString() });
    return { ok: true, user: u };
  }
  function register(data) {
    var users = get('users', []);
    if (users.some(function (u) { return u.email.toLowerCase() === data.email.toLowerCase(); })) {
      return { ok: false, error: 'An account with that email already exists.' };
    }
    var u = {
      id: uid('u'), name: data.name.trim(), email: data.email.trim().toLowerCase(),
      password: data.password, role: data.role, joinedAt: new Date().toISOString()
    };
    users.push(u); set('users', users);
    set('session', { userId: u.id, remember: false, at: new Date().toISOString() });
    notify(u.id, 'enroll', 'Welcome to the platform!', 'Your account is ready. Browse courses and start learning.');
    activity(u.id, 'Created an account');
    return { ok: true, user: u };
  }
  function logout() { set('session', null); }
  function updateProfile(userId, changes) {
    var users = get('users', []);
    users = users.map(function (u) { return u.id === userId ? Object.assign({}, u, changes) : u; });
    set('users', users);
    if (currentUser() && currentUser().userId === userId) {
      var s = currentUser(); set('session', Object.assign({}, s, { at: new Date().toISOString() }));
    }
    return users.filter(function (u) { return u.id === userId; })[0];
  }
  function userById(id) {
    return get('users', []).filter(function (u) { return u.id === id; })[0] || { name: 'Unknown user', role: 'student' };
  }
  function requireAuth(role) {
    var s = currentUser();
    if (!s || !userById(s.userId).id || s.userId === 'Unknown user') {
      location.replace('login.html'); return null;
    }
    var u = userById(s.userId);
    if (role && u.role !== role && !(role === 'admin' && u.role === 'admin')) {
      location.replace('dashboard.html'); return null;
    }
    return u;
  }

  /* ---------------- Helpers ---------------- */
  function notify(userId, type, title, message) {
    var list = get('notifications', []);
    list.unshift({ id: uid('n'), userId: userId, type: type, title: title, message: message, read: false, createdAt: new Date().toISOString() });
    set('notifications', list);
  }
  function activity(userId, text) {
    var list = get('activities', []);
    list.unshift({ id: uid('a'), userId: userId, text: text, createdAt: new Date().toISOString() });
    set('activities', list);
  }
  function notifyAllReviewers(title, message, excludeId) {
    get('users', []).filter(function (u) {
      return (u.role === 'reviewer' || u.role === 'admin') && u.id !== excludeId;
    }).forEach(function (u) { notify(u.id, 'review', title, message); });
  }
  function timeAgo(iso) {
    var d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (isNaN(d)) return '';
    if (d < 60) return 'just now';
    if (d < 3600) return Math.floor(d / 60) + 'm ago';
    if (d < 86400) return Math.floor(d / 3600) + 'h ago';
    if (d < 604800) return Math.floor(d / 86400) + 'd ago';
    return new Date(iso).toLocaleDateString();
  }
  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
  function esc(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function initials(name) {
    return String(name || '?').trim().split(/\s+/).slice(0, 2).map(function (p) { return p[0]; }).join('').toUpperCase();
  }
  function courseById(id) {
    return get('courses', []).filter(function (c) { return c.id === id; })[0] || null;
  }
  function isEnrolled(userId, courseId) {
    return get('enrollments', []).some(function (e) { return e.userId === userId && e.courseId === courseId; });
  }
  function enrollmentList(userId) { return get('enrollments', []).filter(function (e) { return e.userId === userId; }); }
  function contentFor(courseId) { return get('content', []).filter(function (c) { return c.courseId === courseId; }); }
  function completedIds(userId) {
    return get('completed', []).filter(function (c) { return c.userId === userId; }).map(function (c) { return c.contentId; });
  }
  function courseProgress(userId, courseId) {
    var items = contentFor(courseId), done = completedIds(userId);
    var contentScore = items.length ? items.filter(function (c) { return done.indexOf(c.id) >= 0; }).length / items.length * 70 : 0;
    var subs = get('submissions', []).filter(function (s) { return s.userId === userId && s.courseId === courseId; });
    var subScore = subs.some(function (s) { return s.status === 'reviewed'; }) ? 30 : (subs.length ? 15 : 0);
    return Math.min(100, Math.round(contentScore + subScore));
  }
  function overallProgress(userId) {
    var ens = enrollmentList(userId);
    if (!ens.length) return 0;
    return Math.round(ens.reduce(function (sum, e) { return sum + courseProgress(userId, e.courseId); }, 0) / ens.length);
  }
  function reviewFor(submissionId) {
    return get('reviews', []).filter(function (r) { return r.submissionId === submissionId; })[0] || null;
  }
  function unreadCount(userId) {
    return get('notifications', []).filter(function (n) { return n.userId === userId && !n.read; }).length;
  }
  function submissionStatusBadge(s) {
    var map = {
      pending: ['gray', 'Awaiting assignment'],
      assigned: ['amber', 'Review assigned'],
      reviewed: ['green', 'Reviewed']
    };
    var m = map[s.status] || map.pending;
    return '<span class="badge ' + m[0] + '"><span class="dot"></span>' + m[1] + '</span>';
  }
  function roleBadge(role) {
    var cls = role === 'admin' ? 'purple' : (role === 'reviewer' ? 'amber' : '');
    return '<span class="badge ' + cls + '">' + esc(role.charAt(0).toUpperCase() + role.slice(1)) + '</span>';
  }

  /* ---------------- UI ---------------- */
  function toast(message, type) {
    var root = document.getElementById('toast-root');
    if (!root) return;
    var el = document.createElement('div');
    el.className = 'toast ' + (type || 'info');
    el.innerHTML = icon(type === 'error' ? 'alert' : (type === 'success' ? 'checkcircle' : 'info'), 18) + '<span>' + esc(message) + '</span>';
    root.appendChild(el);
    setTimeout(function () { el.style.opacity = '0'; el.style.transform = 'translateX(20px)'; }, 3200);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 3600);
  }
  function modal(opts) {
    var root = document.getElementById('modal-root');
    if (!root) return;
    root.innerHTML =
      '<div class="modal-overlay" id="modal-overlay">' +
        '<div class="modal" role="dialog" aria-modal="true">' +
          '<div class="between"><h3>' + esc(opts.title || '') + '</h3>' +
          '<button class="btn btn-icon btn-ghost" id="modal-x" aria-label="Close">' + icon('x', 18) + '</button></div>' +
          '<div class="modal-body">' + (opts.body || '') + '</div>' +
          '<div class="modal-foot">' +
            '<button class="btn btn-ghost" id="modal-cancel">' + esc(opts.cancelText || 'Cancel') + '</button>' +
            '<button class="btn ' + (opts.danger ? 'btn-danger' : 'btn-primary') + '" id="modal-ok">' + esc(opts.okText || 'Save') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    function close() { root.innerHTML = ''; }
    document.getElementById('modal-x').onclick = close;
    document.getElementById('modal-cancel').onclick = close;
    document.getElementById('modal-overlay').onclick = function (e) { if (e.target.id === 'modal-overlay') close(); };
    document.getElementById('modal-ok').onclick = function () {
      if (!opts.onOk || opts.onOk() !== false) close();
    };
    return close;
  }
  function confirmDialog(message, onYes) {
    modal({
      title: 'Please confirm', body: '<p class="muted">' + esc(message) + '</p>',
      okText: 'Confirm', danger: true, onOk: onYes
    });
  }

  var NAV = [
    { group: 'Overview', items: [
      { page: 'dashboard', label: 'Dashboard', icon: 'home' },
      { page: 'courses', label: 'Courses', icon: 'book' },
      { page: 'content', label: 'Learning Content', icon: 'layers' },
      { page: 'progress', label: 'My Progress', icon: 'chart' }
    ]},
    { group: 'Peer Review', items: [
      { page: 'submission', label: 'My Submissions', icon: 'upload' },
      { page: 'review', label: 'Peer Reviews', icon: 'star' }
    ]},
    { group: 'Account', items: [
      { page: 'notifications', label: 'Notifications', icon: 'bell', badge: true },
      { page: 'profile', label: 'Profile', icon: 'user' }
    ]}
  ];

  function renderShell(active) {
    var user = requireAuth();
    if (!user) return null;
    var unread = unreadCount(user.id);
    var topbar =
      '<div class="brand"><span class="brand-mark">' + icon('graduation', 21) + '</span> PeerReview<span style="color:var(--purple)">Hub</span></div>' +
      '<div class="topbar-right">' +
        '<button class="btn btn-icon btn-ghost menu-toggle" id="menu-toggle" aria-label="Menu">' + icon('menu', 20) + '</button>' +
        '<a href="notifications.html" class="btn btn-icon btn-ghost icon-btn" aria-label="Notifications">' + icon('bell', 19) +
          (unread ? '<span class="badge-count">' + unread + '</span>' : '') + '</a>' +
        '<div class="user-menu" id="user-menu">' +
          '<span class="avatar">' + esc(initials(user.name)) + '</span>' +
          '<span><span class="name">' + esc(user.name) + '</span><br><span class="role">' + esc(user.role) + '</span></span>' +
          icon('chevron', 15) +
        '</div>' +
      '</div>';
    document.getElementById('topbar').innerHTML = topbar;

    var html = '';
    NAV.forEach(function (g) {
      html += '<div class="nav-group-title">' + g.group + '</div>';
      g.items.forEach(function (it) {
        html += '<a href="' + it.page + '.html" class="nav-item' + (active === it.page ? ' active' : '') + '">' +
          icon(it.icon, 18) + '<span>' + it.label + '</span>' +
          (it.badge && unread ? '<span class="pill">' + unread + '</span>' : '') + '</a>';
      });
    });
    if (user.role === 'admin') {
      html += '<div class="nav-group-title">Administration</div>' +
        '<a href="admin.html" class="nav-item' + (active === 'admin' ? ' active' : '') + '">' + icon('shield', 18) + '<span>Admin Panel</span></a>';
    }
    html += '<div class="divider"></div>' +
      '<button class="nav-item" id="logout-btn" style="width:100%;border:0;background:transparent;cursor:pointer">' +
      icon('logout', 18) + '<span>Logout</span></button>';
    document.getElementById('sidebar').innerHTML = html;

    document.getElementById('menu-toggle').onclick = function () {
      document.getElementById('sidebar').classList.toggle('open');
    };
    document.getElementById('logout-btn').onclick = function () {
      confirmDialog('Are you sure you want to log out?', function () {
        logout(); location.href = 'login.html';
      });
    };
    document.getElementById('user-menu').onclick = function () { location.href = 'profile.html'; };
    return user;
  }

  function pageHeader(title, subtitle, actionHtml) {
    return '<div class="page-header between"><div><h1>' + esc(title) + '</h1><p>' + esc(subtitle) + '</p></div>' +
      (actionHtml ? '<div class="flex gap-1 wrap">' + actionHtml + '</div>' : '') + '</div>';
  }
  function empty(title, sub, iconName) {
    return '<div class="card empty"><div class="big">' + (iconName ? icon(iconName, 42) : '📭') + '</div>' +
      '<h3>' + esc(title) + '</h3><p class="muted">' + esc(sub || '') + '</p></div>';
  }
  function revealOnScroll() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(function (e) { e.classList.add('show'); }); return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('show'); obs.unobserve(e.target); } });
    }, { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(function (e) { obs.observe(e); });
  }

  /* ---------------- Public API ---------------- */
  global.PRS = {
    KEYS: KEYS, seed: seed, get: get, set: set, uid: uid, daysAgo: daysAgo,
    icon: icon, starSvg: starSvg,
    auth: { currentUser: currentUser, login: login, register: register, logout: logout, updateProfile: updateProfile, userById: userById, requireAuth: requireAuth, findUserByEmail: findUserByEmail },
    notify: notify, activity: activity, notifyAllReviewers: notifyAllReviewers,
    timeAgo: timeAgo, fmtDate: fmtDate, esc: esc, initials: initials,
    courseById: courseById, isEnrolled: isEnrolled, enrollmentList: enrollmentList,
    contentFor: contentFor, completedIds: completedIds, courseProgress: courseProgress,
    overallProgress: overallProgress, reviewFor: reviewFor, unreadCount: unreadCount,
    submissionStatusBadge: submissionStatusBadge, roleBadge: roleBadge,
    ui: { toast: toast, modal: modal, confirm: confirmDialog, renderShell: renderShell, pageHeader: pageHeader, empty: empty, revealOnScroll: revealOnScroll }
  };

  seed();
})(window);
