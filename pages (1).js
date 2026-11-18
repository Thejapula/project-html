/* ============================================================
   PRS Pages — all interactive page logic
   ============================================================ */
(function () {
  'use strict';
  var P = window.PRS;
  var esc = P.esc, icon = P.icon, $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var page = document.body.dataset.page || '';
  var user = null;

  function mount(name) {
    user = P.ui.renderShell(name);
    if (!user) return false;
    return true;
  }

  /* =========================================================
     REGISTER
     ========================================================= */
  function initRegister() {
    var role = 'student';
    $$('.radio-card').forEach(function (card) {
      card.addEventListener('click', function () {
        role = card.dataset.role;
        $$('.radio-card').forEach(function (c) { c.classList.toggle('active', c === card); });
        $$('.radio-card input').forEach(function (i) { i.checked = (i.value === role); });
      });
    });
    var form = $('#register-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors(form);
      var data = {
        name: $('#reg-name').value.trim(),
        email: $('#reg-email').value.trim(),
        password: $('#reg-password').value,
        confirm: $('#reg-confirm').value,
        role: role
      };
      var ok = true;
      if (data.name.length < 2) { fail('#reg-name', 'Please enter your full name.'); ok = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { fail('#reg-email', 'Enter a valid email address.'); ok = false; }
      if (data.password.length < 6) { fail('#reg-password', 'Password must be at least 6 characters.'); ok = false; }
      if (data.confirm !== data.password) { fail('#reg-confirm', 'Passwords do not match.'); ok = false; }
      if (!ok) return;

      var res = P.auth.register(data);
      if (!res.ok) { fail('#reg-email', res.error); return; }
      P.ui.toast('Account created! Welcome to PeerReviewHub.', 'success');
      location.href = res.user.role === 'admin' ? 'admin.html' : 'dashboard.html';
    });
  }
  function fail(sel, msg) {
    var el = $(sel); if (!el) return;
    el.classList.add('error');
    var t = el.parentNode.querySelector('.error-text');
    if (t) t.textContent = msg;
  }
  function clearErrors(form) {
    $$('.input', form).forEach(function (i) { i.classList.remove('error'); });
    $$('.error-text', form).forEach(function (t) { t.textContent = ''; });
  }

  /* =========================================================
     LOGIN
     ========================================================= */
  function initLogin() {
    var auto = P.auth.currentUser();
    if (auto && auto.remember) { location.replace('dashboard.html'); return; }
    $$('.demo-fill').forEach(function (b) {
      b.addEventListener('click', function () {
        $('#login-email').value = b.dataset.email;
        $('#login-password').value = b.dataset.pass;
        $('#login-email').focus();
      });
    });
    $('#login-form').addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors($('#login-form'));
      var email = $('#login-email').value.trim(), pass = $('#login-password').value;
      if (!email) { fail('#login-email', 'Email is required.'); return; }
      if (!pass) { fail('#login-password', 'Password is required.'); return; }
      var res = P.auth.login(email, pass, $('#login-remember').checked);
      if (!res.ok) { fail('#login-password', res.error); P.ui.toast(res.error, 'error'); return; }
      P.ui.toast('Welcome back, ' + res.user.name.split(' ')[0] + '!', 'success');
      location.href = res.user.role === 'admin' ? 'admin.html' : 'dashboard.html';
    });
  }

  /* =========================================================
     DASHBOARD
     ========================================================= */
  function initDashboard() {
    if (!mount('dashboard')) return;
    var ens = P.enrollmentList(user.id);
    var courses = P.get('courses', []);
    var subs = P.get('submissions', []).filter(function (s) { return s.userId === user.id; });
    var pendingReviews = P.get('submissions', []).filter(function (s) { return s.reviewerId === user.id && s.status === 'assigned'; }).length;
    var completedReviews = P.get('reviews', []).filter(function (r) { return r.reviewerId === user.id; }).length;
    var progress = P.overallProgress(user.id);
    var notes = P.get('notifications', []).filter(function (n) { return n.userId === user.id; }).slice(0, 4);
    var acts = P.get('activities', []).filter(function (a) { return a.userId === user.id; }).slice(0, 5);
    var hour = new Date().getHours();
    var greet = hour < 12 ? 'Good morning' : (hour < 18 ? 'Good afternoon' : 'Good evening');

    var stat = function (ic, n, label, cls) {
      return '<div class="card hoverable"><div class="stat"><span class="tile ' + (cls || '') + '">' + icon(ic, 22) + '</span>' +
        '<div><div class="num">' + n + '</div><div class="label">' + label + '</div></div></div></div>';
    };
    var html =
      '<div class="page-header"><div><h1>' + greet + ', ' + esc(user.name.split(' ')[0]) + ' 👋</h1>' +
      '<p>Here is what is happening in your learning space today.</p></div>' +
      '<a href="courses.html" class="btn btn-primary">' + icon('plus', 17) + ' Browse Courses</a></div>' +

      '<div class="grid grid-4">' +
        stat('book', courses.length, 'Total courses') +
        stat('graduation', ens.length, 'Enrolled courses', 'purple') +
        stat('clock', pendingReviews, 'Pending reviews', 'amber') +
        stat('checkcircle', completedReviews, 'Reviews completed', 'green') +
      '</div>' +

      '<div class="grid grid-3 mt-2" style="grid-template-columns:1.5fr 1fr">' +
        '<div class="card">' +
          '<div class="card-head"><div><div class="card-title">Your learning progress</div><div class="small muted">Across all enrolled courses</div></div>' +
          '<span class="badge purple">' + progress + '% complete</span></div>' +
          '<div class="progress-label"><span>Overall progress</span><span>' + progress + '%</span></div>' +
          '<div class="progress"><span style="width:' + progress + '%"></span></div>' +
          '<div class="divider"></div>' +
          '<div class="between"><div><strong>' + subs.length + '</strong> <span class="muted small">submissions made</span></div>' +
          '<a href="progress.html" class="btn btn-soft btn-sm">View details ' + icon('chevron', 14) + '</a></div>' +
        '</div>' +
        '<div class="card">' +
          '<div class="card-head"><div class="card-title">Quick actions</div>' + icon('spark', 18) + '</div>' +
          '<div class="list">' +
            '<a class="list-item" href="content.html"><span class="tile">' + icon('layers', 18) + '</span><div class="li-body"><div class="li-title">Study materials</div><div class="li-meta">Videos, docs & notes</div></div>' + icon('chevron', 16) + '</a>' +
            '<a class="list-item" href="submission.html"><span class="tile purple">' + icon('upload', 18) + '</span><div class="li-body"><div class="li-title">Submit assignment</div><div class="li-meta">Share your work</div></div>' + icon('chevron', 16) + '</a>' +
            '<a class="list-item" href="review.html"><span class="tile amber">' + icon('star', 18) + '</span><div class="li-body"><div class="li-title">Peer reviews</div><div class="li-meta">Give helpful feedback</div></div>' + icon('chevron', 16) + '</a>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="grid grid-2 mt-2">' +
        '<div class="card"><div class="card-head"><div class="card-title">Recent activity</div><a href="progress.html" class="small">See all</a></div>' +
          '<div class="list">' + (acts.length ? acts.map(function (a) {
            return '<div class="list-item"><span class="tile">' + icon('check', 16) + '</span><div class="li-body">' +
              '<div class="li-title">' + esc(a.text) + '</div><div class="li-meta">' + P.timeAgo(a.createdAt) + '</div></div></div>';
          }).join('') : P.ui.empty('No activity yet', 'Start by enrolling in a course.', 'clock')) + '</div>' +
        '</div>' +
        '<div class="card"><div class="card-head"><div class="card-title">Notifications</div><a href="notifications.html" class="small">View all</a></div>' +
          '<div class="list">' + (notes.length ? notes.map(function (n) {
            return '<a href="notifications.html" class="list-item' + (n.read ? '' : ' unread') + '"><span class="tile ' + (n.type === 'feedback' ? 'green' : (n.type === 'review' ? 'purple' : '')) + '">' +
              icon(n.type === 'feedback' ? 'message' : (n.type === 'review' ? 'star' : 'bell'), 17) + '</span>' +
              '<div class="li-body"><div class="li-title">' + esc(n.title) + '</div><div class="li-meta">' + esc(n.message) + ' · ' + P.timeAgo(n.createdAt) + '</div></div></a>';
          }).join('') : P.ui.empty('All caught up', 'No notifications yet.', 'bell')) + '</div>' +
        '</div>' +
      '</div>';
    $('#page-content').innerHTML = html;
  }

  /* =========================================================
     COURSES
     ========================================================= */
  function initCourses() {
    if (!mount('courses')) return;
    var search = '', category = 'All';
    function render() {
      var all = P.get('courses', []);
      var cats = ['All'].concat(all.map(function (c) { return c.category; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort());
      var list = all.filter(function (c) {
        var m = category === 'All' || c.category === category;
        var q = search.toLowerCase();
        return m && (!q || (c.title + ' ' + c.code + ' ' + c.desc + ' ' + c.instructor).toLowerCase().indexOf(q) >= 0);
      });
      var cards = list.map(function (c) {
        var enrolled = P.isEnrolled(user.id, c.id);
        var prog = enrolled ? P.courseProgress(user.id, c.id) : 0;
        return '<article class="card course-card hoverable reveal">' +
          '<div class="course-cover"><span class="emoji">' + esc(c.emoji) + '</span><span class="cat">' + esc(c.category) + '</span></div>' +
          '<div class="course-body"><h3>' + esc(c.title) + '</h3>' +
            '<div class="small muted">' + esc(c.code) + ' · ' + esc(c.instructor) + '</div>' +
            '<div class="course-meta"><span>' + icon('users', 13) + c.students + ' students</span><span>' + icon('award', 13) + c.credits + ' credits</span></div>' +
            '<p class="small muted">' + esc(c.desc) + '</p>' +
            (enrolled ? '<div class="progress-label"><span>Progress</span><span>' + prog + '%</span></div><div class="progress"><span style="width:' + prog + '%"></span></div>' : '') +
            '<div class="course-foot">' +
              (enrolled
                ? '<span class="badge green">' + icon('check', 13) + ' Enrolled</span><a class="btn btn-soft btn-sm" href="content.html?course=' + c.id + '">Continue</a>'
                : '<span class="badge">' + esc(c.category) + '</span><button class="btn btn-primary btn-sm" data-enroll="' + c.id + '">' + icon('plus', 14) + ' Enroll</button>') +
            '</div>' +
          '</div></article>';
      }).join('');

      $('#page-content').innerHTML =
        P.ui.pageHeader('Explore Courses', 'Find a course, enroll and start learning with peer feedback.') +
        '<div class="card">' +
          '<div class="search-row">' +
            '<div class="search-box">' + icon('search', 18) + '<input class="input" id="course-search" placeholder="Search courses by title, code or instructor…" value="' + esc(search) + '"></div>' +
            '<span class="small muted">' + list.length + ' course' + (list.length === 1 ? '' : 's') + '</span>' +
          '</div>' +
          '<div class="chips mt-2">' + cats.map(function (cat) {
            return '<button class="chip' + (cat === category ? ' active' : '') + '" data-cat="' + esc(cat) + '">' + esc(cat) + '</button>';
          }).join('') + '</div>' +
        '</div>' +
        '<div class="grid grid-3 mt-2">' + (cards || P.ui.empty('No courses found', 'Try a different search or category.', 'search')) + '</div>';

      $('#course-search').addEventListener('input', function (e) { search = e.target.value; render(); $('#course-search').focus(); });
      $$('[data-cat]').forEach(function (b) {
        b.addEventListener('click', function () { category = b.dataset.cat; render(); });
      });
      $$('[data-enroll]').forEach(function (b) {
        b.addEventListener('click', function () {
          var c = P.courseById(b.dataset.enroll);
          var ens = P.get('enrollments', []);
          ens.push({ id: P.uid('en'), userId: user.id, courseId: c.id, enrolledAt: new Date().toISOString() });
          P.set('enrollments', ens);
          P.notify(user.id, 'enroll', 'Enrollment confirmed', 'You are now enrolled in ' + c.title + '.');
          P.activity(user.id, 'Enrolled in ' + c.title);
          P.ui.toast('Enrolled in ' + c.title + '!', 'success');
          render();
        });
      });
      P.ui.revealOnScroll();
    }
    render();
  }

  /* =========================================================
     CONTENT
     ========================================================= */
  function initContent() {
    if (!mount('content')) return;
    var courses = P.get('courses', []);
    var params = new URLSearchParams(location.search);
    var courseId = params.get('course') || (P.enrollmentList(user.id)[0] || {}).courseId || courses[0].id;
    var search = '', type = 'All';
    var editingId = null;

    function render() {
      var items = P.contentFor(courseId).filter(function (c) {
        return (type === 'All' || c.type === type) && (!search || (c.title + ' ' + c.description).toLowerCase().indexOf(search.toLowerCase()) >= 0);
      });
      var done = P.completedIds(user.id);
      var eta = P.courseProgress(user.id, courseId);
      var cards = items.map(function (c) {
        var complete = done.indexOf(c.id) >= 0;
        var label = c.type === 'video' ? 'Video' : (c.type === 'document' ? 'Document' : 'Note');
        return '<article class="card content-card hoverable reveal">' +
          '<span class="tile ' + (c.type === 'video' ? '' : (c.type === 'document' ? 'purple' : 'green')) + '">' + icon(c.type === 'video' ? 'play' : (c.type === 'document' ? 'file' : 'note'), 20) + '</span>' +
          '<div style="flex:1;min-width:0">' +
            '<div class="between"><h3 style="font-size:1rem">' + esc(c.title) + '</h3><span class="type-pill type-' + c.type + '">' + label + '</span></div>' +
            '<p class="small muted" style="margin:.3rem 0">' + esc(c.description) + '</p>' +
            '<div class="meta">' + P.fmtDate(c.createdAt) + (c.url ? ' · <a href="' + esc(c.url) + '" target="_blank" rel="noopener">' + (c.type === 'video' ? 'Watch video' : 'Open resource') + ' ' + icon('external', 12) + '</a>' : '') + '</div>' +
          '</div>' +
          '<div class="flex gap-1" style="flex-direction:column">' +
            '<button class="btn btn-sm ' + (complete ? 'btn-ghost' : 'btn-soft') + '" data-complete="' + c.id + '">' + icon(complete ? 'checkcircle' : 'check', 14) + ' ' + (complete ? 'Done' : 'Mark complete') + '</button>' +
            '<button class="btn btn-icon btn-sm btn-ghost" data-edit="' + c.id + '" aria-label="Edit">' + icon('edit', 15) + '</button>' +
            '<button class="btn btn-icon btn-sm btn-ghost" data-del="' + c.id + '" aria-label="Delete">' + icon('trash', 15) + '</button>' +
          '</div>' +
        '</article>';
      }).join('');

      $('#page-content').innerHTML =
        P.ui.pageHeader('Learning Content', 'Study materials, videos, documents and notes — all in one place.',
          '<button class="btn btn-purple" id="add-content">' + icon('plus', 17) + ' Add Content</button>') +
        '<div class="card">' +
          '<div class="search-row">' +
            '<select class="input" id="course-select" style="max-width:280px">' + courses.map(function (c) {
              return '<option value="' + c.id + '"' + (c.id === courseId ? ' selected' : '') + '>' + esc(c.title) + '</option>';
            }).join('') + '</select>' +
            '<div class="search-box">' + icon('search', 18) + '<input class="input" id="content-search" placeholder="Search materials…" value="' + esc(search) + '"></div>' +
          '</div>' +
          '<div class="between mt-2 wrap"><div class="chips">' +
            ['All', 'video', 'document', 'note'].map(function (t) {
              return '<button class="chip' + (t === type ? ' active' : '') + '" data-type="' + t + '">' + (t === 'All' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1) + 's') + '</button>';
            }).join('') + '</div>' +
            '<span class="small muted">Course progress: <strong>' + eta + '%</strong></span></div>' +
        '</div>' +
        '<div class="grid mt-2">' + (cards || P.ui.empty('No materials found', 'Add content or try another filter.', 'layers')) + '</div>';

      $('#course-select').onchange = function (e) { courseId = e.target.value; render(); };
      $('#content-search').oninput = function (e) { search = e.target.value; render(); $('#content-search').focus(); };
      $$('[data-type]').forEach(function (b) { b.onclick = function () { type = b.dataset.type; render(); }; });
      $('#add-content').onclick = function () { openContentModal(null); };
      $$('[data-edit]').forEach(function (b) {
        b.onclick = function () {
          var item = P.get('content', []).filter(function (c) { return c.id === b.dataset.edit; })[0];
          openContentModal(item);
        };
      });
      $$('[data-del]').forEach(function (b) {
        b.onclick = function () {
          P.ui.confirm('Delete this material? This cannot be undone.', function () {
            P.set('content', P.get('content', []).filter(function (c) { return c.id !== b.dataset.del; }));
            P.ui.toast('Material deleted.', 'success'); render();
          });
        };
      });
      $$('[data-complete]').forEach(function (b) {
        b.onclick = function () {
          var list = P.get('completed', []), id = b.dataset.complete;
          var idx = -1;
          list.forEach(function (x, i) { if (x.userId === user.id && x.contentId === id) idx = i; });
          if (idx >= 0) { list.splice(idx, 1); P.ui.toast('Marked as not complete.'); }
          else { list.push({ id: P.uid('cp'), userId: user.id, contentId: id, completedAt: new Date().toISOString() }); P.ui.toast('Material completed! +progress', 'success'); P.activity(user.id, 'Completed a learning material'); }
          P.set('completed', list); render();
        };
      });
      P.ui.revealOnScroll();
    }

    function openContentModal(item) {
      editingId = item ? item.id : null;
      P.ui.modal({
        title: item ? 'Edit material' : 'Add new material',
        body:
          '<div class="field"><label>Title</label><input class="input" id="cm-title" value="' + esc(item ? item.title : '') + '" placeholder="e.g. Video: Intro to Flexbox"></div>' +
          '<div class="grid grid-2">' +
            '<div class="field"><label>Type</label><select class="input" id="cm-type">' +
              ['video', 'document', 'note'].map(function (t) { return '<option value="' + t + '"' + (item && item.type === t ? ' selected' : '') + '>' + t.toUpperCase() + '</option>'; }).join('') +
            '</select></div>' +
            '<div class="field"><label>Course</label><select class="input" id="cm-course">' + courses.map(function (c) {
              return '<option value="' + c.id + '"' + (c.id === courseId ? ' selected' : '') + '>' + esc(c.title) + '</option>';
            }).join('') + '</select></div>' +
          '</div>' +
          '<div class="field"><label>Description</label><textarea class="input" id="cm-desc" placeholder="What will students learn?">' + esc(item ? item.description : '') + '</textarea></div>' +
          '<div class="field"><label>Link (optional)</label><input class="input" id="cm-url" value="' + esc(item ? item.url : '') + '" placeholder="https://…"></div>',
        okText: item ? 'Save changes' : 'Add material',
        onOk: function () {
          var title = $('#cm-title').value.trim();
          if (!title) { P.ui.toast('Please enter a title.', 'error'); return false; }
          var list = P.get('content', []);
          var record = {
            courseId: $('#cm-course').value,
            type: $('#cm-type').value,
            title: title,
            description: $('#cm-desc').value.trim(),
            url: $('#cm-url').value.trim()
          };
          if (editingId) {
            list = list.map(function (c) { return c.id === editingId ? Object.assign({}, c, record) : c; });
            P.ui.toast('Material updated.', 'success');
          } else {
            list.push(Object.assign({ id: P.uid('ct'), addedBy: user.id, createdAt: new Date().toISOString() }, record));
            P.ui.toast('Material added.', 'success');
          }
          P.set('content', list);
          courseId = record.courseId;
          render();
        }
      });
    }
    render();
  }

  /* =========================================================
     SUBMISSION
     ========================================================= */
  function initSubmission() {
    if (!mount('submission')) return;
    var ens = P.enrollmentList(user.id);
    var fileMeta = { name: '', dataUrl: '' };

    function render() {
      var mine = P.get('submissions', []).filter(function (s) { return s.userId === user.id; }).sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
      var cards = mine.map(function (s) {
        var rv = P.reviewFor(s.id);
        var c = P.courseById(s.courseId);
        return '<div class="card hoverable">' +
          '<div class="between wrap"><div><h3 style="font-size:1.05rem">' + esc(s.title) + '</h3>' +
          '<div class="small muted">' + esc(c ? c.title : 'Course') + ' · submitted ' + P.timeAgo(s.createdAt) + '</div></div>' +
          P.submissionStatusBadge(s) + '</div>' +
          '<p class="small mt-1">' + esc(s.description) + '</p>' +
          (s.link ? '<a class="small" href="' + esc(s.link) + '" target="_blank" rel="noopener">' + icon('external', 13) + ' ' + esc(s.link) + '</a>' : '') +
          (s.fileName ? '<div class="small mt-1">' + icon('file', 13) + ' ' + esc(s.fileName) + (s.fileData ? ' <a href="' + s.fileData + '" download="' + esc(s.fileName) + '">Download</a>' : '') + '</div>' : '') +
          (rv ? '<div class="divider"></div><div class="card" style="background:#f7f9ff;box-shadow:none">' +
            '<div class="between"><strong>Feedback received</strong><span class="stars-display">' + '★'.repeat(rv.rating) + '<span style="color:#d6dbe9">' + '★'.repeat(5 - rv.rating) + '</span></span></div>' +
            '<div class="small muted">from ' + esc(P.auth.userById(rv.reviewerId).name) + ' · ' + P.timeAgo(rv.createdAt) + '</div>' +
            '<p class="small mt-1">' + esc(rv.feedback) + '</p>' +
            (rv.comments ? '<div class="small"><strong>Comments:</strong> ' + esc(rv.comments) + '</div>' : '') +
            '</div>' : (s.status === 'pending' ? '<div class="divider"></div><div class="small muted">' + icon('info', 14) + ' Waiting for a peer reviewer to claim this submission.</div>' :
              (s.status === 'assigned' ? '<div class="divider"></div><div class="small muted">' + icon('clock', 14) + ' Assigned to ' + esc(P.auth.userById(s.reviewerId).name) + ' — feedback coming soon.</div>' : ''))) +
        '</div>';
      }).join('');

      $('#page-content').innerHTML =
        P.ui.pageHeader('Assignment Submission', 'Submit your work and receive constructive peer feedback.',
          '<a href="review.html" class="btn btn-ghost">' + icon('star', 16) + ' Peer Reviews</a>') +
        '<div class="grid" style="grid-template-columns:1fr 1fr">' +
          '<div class="card"><div class="card-head"><div class="card-title">Submit new assignment</div>' + icon('upload', 18) + '</div>' +
            '<form id="submit-form" novalidate>' +
              '<div class="field"><label>Course</label><select class="input" id="sub-course">' +
                (ens.length ? ens.map(function (e) { var c = P.courseById(e.courseId); return c ? '<option value="' + c.id + '">' + esc(c.title) + '</option>' : ''; }).join('') : '<option value="">No enrolled courses</option>') +
              '</select></div>' +
              '<div class="field"><label>Assignment title</label><input class="input" id="sub-title" placeholder="e.g. Build a Responsive Portfolio">' +
                '<div class="error-text"></div></div>' +
              '<div class="field"><label>Description</label><textarea class="input" id="sub-desc" placeholder="Describe what you built and anything your reviewer should know."></textarea>' +
                '<div class="error-text"></div></div>' +
              '<div class="field"><label>Submission link <span class="muted">(optional)</span></label><input class="input" id="sub-link" placeholder="https://github.com/… or a shared document link"></div>' +
              '<div class="field"><label>Or upload a file <span class="muted">(optional)</span></label>' +
                '<input class="input" type="file" id="sub-file"><div class="hint" id="file-hint">No file selected</div></div>' +
              '<div id="sub-error" class="error-text"></div>' +
              '<button class="btn btn-primary btn-block" type="submit">' + icon('send', 17) + ' Submit Assignment</button>' +
            '</form>' +
          '</div>' +
          '<div><div class="card" style="margin-bottom:1.25rem"><div class="card-head"><div class="card-title">How it works</div></div>' +
            '<div class="list">' +
              '<div class="list-item"><span class="tile">' + icon('upload', 17) + '</span><div class="li-body"><div class="li-title">1. Submit your work</div><div class="li-meta">Add a link or file and a short description.</div></div></div>' +
              '<div class="list-item"><span class="tile purple">' + icon('users', 17) + '</span><div class="li-body"><div class="li-title">2. A peer claims it</div><div class="li-meta">Another student or reviewer is notified.</div></div></div>' +
              '<div class="list-item"><span class="tile amber">' + icon('star', 17) + '</span><div class="li-body"><div class="li-title">3. Receive feedback</div><div class="li-meta">Rating, written feedback and comments.</div></div></div>' +
            '</div></div>' +
            '<h3 class="section-title mb-1">My submissions (' + mine.length + ')</h3>' +
            '<div class="list">' + (cards || P.ui.empty('No submissions yet', 'Your submitted work will appear here.', 'upload')) + '</div>' +
          '</div>' +
        '</div>';

      $('#sub-file').onchange = function (e) {
        var f = e.target.files[0];
        if (!f) { fileMeta = { name: '', dataUrl: '' }; $('#file-hint').textContent = 'No file selected'; return; }
        fileMeta.name = f.name;
        $('#file-hint').textContent = 'Selected: ' + f.name;
        if (f.size < 700000) {
          var reader = new FileReader();
          reader.onload = function () { fileMeta.dataUrl = reader.result; };
          reader.readAsDataURL(f);
        }
      };
      $('#submit-form').onsubmit = function (e) {
        e.preventDefault();
        var title = $('#sub-title').value.trim();
        var desc = $('#sub-desc').value.trim();
        var link = $('#sub-link').value.trim();
        var course = $('#sub-course').value;
        $$('#submit-form .input').forEach(function (i) { i.classList.remove('error'); });
        $('#sub-error').textContent = '';
        var ok = true;
        if (!course) { $('#sub-error').textContent = 'Enroll in a course first.'; ok = false; }
        if (title.length < 4) { $('#sub-title').classList.add('error'); ok = false; }
        if (desc.length < 10) { $('#sub-desc').classList.add('error'); ok = false; }
        if (!link && !fileMeta.name) { $('#sub-error').textContent = 'Add a submission link or upload a file.'; ok = false; }
        if (!ok) { P.ui.toast('Please check the highlighted fields.', 'error'); return; }

        var subs = P.get('submissions', []);
        subs.push({
          id: P.uid('s'), userId: user.id, courseId: course, title: title, description: desc,
          link: link, fileName: fileMeta.name, fileData: fileMeta.dataUrl || '',
          status: 'pending', reviewerId: null, createdAt: new Date().toISOString()
        });
        P.set('submissions', subs);
        P.notifyAllReviewers('New submission to review', user.name + ' submitted “' + title + '” and needs a peer reviewer.', user.id);
        P.notify(user.id, 'assignment', 'Submission received', 'Your assignment “' + title + '” was submitted successfully.');
        P.activity(user.id, 'Submitted “' + title + '”');
        P.ui.toast('Assignment submitted! A reviewer will pick it up soon.', 'success');
        fileMeta = { name: '', dataUrl: '' };
        render();
      };
    }
    render();
  }

  /* =========================================================
     REVIEW
     ========================================================= */
  function initReview() {
    if (!mount('review')) return;
    var ratings = {};

    function render() {
      var subs = P.get('submissions', []);
      var assigned = subs.filter(function (s) { return s.reviewerId === user.id && s.status === 'assigned'; });
      var available = subs.filter(function (s) { return s.status === 'pending' && s.userId !== user.id; });
      var done = P.get('reviews', []).filter(function (r) { return r.reviewerId === user.id; }).sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });

      function subCard(s, mode) {
        var c = P.courseById(s.courseId), author = P.auth.userById(s.userId);
        return '<div class="card hoverable">' +
          '<div class="between wrap"><div><h3 style="font-size:1.05rem">' + esc(s.title) + '</h3>' +
          '<div class="small muted">' + esc(c ? c.title : '') + ' · by ' + esc(author.name) + ' · ' + P.timeAgo(s.createdAt) + '</div></div>' +
          (mode === 'available' ? '<span class="badge gray">Needs reviewer</span>' : '<span class="badge amber">' + icon('clock', 12) + ' In progress</span>') + '</div>' +
          '<p class="small mt-1">' + esc(s.description) + '</p>' +
          (s.link ? '<a class="small" href="' + esc(s.link) + '" target="_blank" rel="noopener">' + icon('external', 13) + ' View submitted work</a>' : '') +
          (s.fileName ? '<div class="small mt-1">' + icon('file', 13) + ' ' + esc(s.fileName) + (s.fileData ? ' <a href="' + s.fileData + '" target="_blank">Open file</a>' : '') + '</div>' : '') +
          '<div class="divider"></div>' +
          (mode === 'available'
            ? '<button class="btn btn-primary btn-sm" data-claim="' + s.id + '">' + icon('check', 15) + ' Claim this review</button>'
            : '<div class="field"><label>Your rating</label><div class="stars" data-stars="' + s.id + '">' +
              [1, 2, 3, 4, 5].map(function (n) { return '<button class="star' + ((ratings[s.id] || 0) >= n ? ' on' : '') + '" data-val="' + n + '" data-for="' + s.id + '" type="button" aria-label="' + n + ' stars">' + P.starSvg((ratings[s.id] || 0) >= n) + '</button>'; }).join('') +
              '</div><div class="hint" id="star-hint-' + s.id + '">' + (ratings[s.id] ? ratings[s.id] + ' out of 5' : 'Click a star to rate from 1 to 5') + '</div></div>' +
              '<div class="field"><label>Feedback</label><textarea class="input" id="fb-' + s.id + '" placeholder="What did they do well? What could improve?"></textarea><div class="error-text"></div></div>' +
              '<div class="field"><label>Additional comments <span class="muted">(optional)</span></label><textarea class="input" id="cm-' + s.id + '" style="min-height:70px" placeholder="Any extra notes for the student."></textarea></div>' +
              '<button class="btn btn-purple" data-submit-review="' + s.id + '">' + icon('send', 16) + ' Submit Review</button>') +
        '</div>';
      }

      $('#page-content').innerHTML =
        P.ui.pageHeader('Peer Reviews', 'Help classmates improve by giving thoughtful, constructive feedback.') +
        '<div class="grid" style="grid-template-columns:1fr 1fr">' +
          '<div><h3 class="section-title mb-1">Assigned to you (' + assigned.length + ')</h3>' +
            '<div class="list">' + (assigned.length ? assigned.map(function (s) { return subCard(s, 'assigned'); }).join('') : P.ui.empty('No reviews assigned', 'Claim a submission from the queue on the right.', 'star')) + '</div>' +
            '<h3 class="section-title mt-3 mb-1">Review queue (' + available.length + ')</h3>' +
            '<div class="list">' + (available.length ? available.map(function (s) { return subCard(s, 'available'); }).join('') : P.ui.empty('Queue is empty', 'No submissions are waiting right now.', 'checkcircle')) + '</div>' +
          '</div>' +
          '<div><div class="card"><div class="card-head"><div class="card-title">Your completed reviews (' + done.length + ')</div>' + icon('trophy', 18) + '</div>' +
            '<div class="list">' + (done.length ? done.map(function (r) {
              var s = P.get('submissions', []).filter(function (x) { return x.id === r.submissionId; })[0] || {};
              var st = P.auth.userById(s.userId);
              return '<div class="list-item"><span class="tile green">' + icon('check', 17) + '</span><div class="li-body">' +
                '<div class="li-title">' + esc(s.title || 'Submission') + '</div>' +
                '<div class="li-meta">' + esc(st.name) + ' · ' + P.timeAgo(r.createdAt) + ' · <span class="stars-display">' + '★'.repeat(r.rating) + '</span></div>' +
                '<div class="small mt-1">' + esc(r.feedback) + '</div></div></div>';
            }).join('') : P.ui.empty('No reviews yet', 'Claim a submission to get started.', 'trophy')) + '</div>' +
          '</div></div>' +
        '</div>';

      $$('.star').forEach(function (b) {
        b.onclick = function () {
          var id = b.dataset.for, val = +b.dataset.val;
          ratings[id] = val;
          $$('.star[data-for="' + id + '"]').forEach(function (x) {
            x.classList.toggle('on', +x.dataset.val <= val);
            x.innerHTML = P.starSvg(+x.dataset.val <= val);
          });
          var h = $('#star-hint-' + id); if (h) h.textContent = val + ' out of 5';
        };
      });
      $$('[data-claim]').forEach(function (b) {
        b.onclick = function () {
          var subs2 = P.get('submissions', []);
          subs2 = subs2.map(function (s) { return s.id === b.dataset.claim ? Object.assign({}, s, { status: 'assigned', reviewerId: user.id }) : s; });
          P.set('submissions', subs2);
          var s = subs2.filter(function (x) { return x.id === b.dataset.claim; })[0];
          P.notify(s.userId, 'review', 'Review assigned', user.name + ' is now reviewing your submission “' + s.title + '”.');
          P.activity(user.id, 'Claimed a peer review');
          P.ui.toast('Review claimed. You can now give feedback.', 'success');
          render();
        };
      });
      $$('[data-submit-review]').forEach(function (b) {
        b.onclick = function () {
          var id = b.dataset.submitReview;
          var rating = ratings[id] || 0;
          var feedback = $('#fb-' + id).value.trim();
          var comments = $('#cm-' + id).value.trim();
          if (!rating) { P.ui.toast('Please choose a star rating.', 'error'); return; }
          if (feedback.length < 10) { P.ui.toast('Please write at least a short feedback message.', 'error'); $('#fb-' + id).classList.add('error'); return; }
          var reviews = P.get('reviews', []);
          reviews.push({ id: P.uid('r'), submissionId: id, reviewerId: user.id, rating: rating, feedback: feedback, comments: comments, createdAt: new Date().toISOString() });
          P.set('reviews', reviews);
          var subs2 = P.get('submissions', []).map(function (s) { return s.id === id ? Object.assign({}, s, { status: 'reviewed' }) : s; });
          P.set('submissions', subs2);
          var sub = subs2.filter(function (s) { return s.id === id; })[0];
          P.notify(sub.userId, 'feedback', 'Feedback received', user.name + ' gave you feedback on “' + sub.title + '”.');
          P.activity(user.id, 'Reviewed ' + P.auth.userById(sub.userId).name + '’s submission');
          P.activity(sub.userId, 'Received peer feedback');
          P.ui.toast('Review submitted. The student has been notified!', 'success');
          delete ratings[id];
          render();
        };
      });
    }
    render();
  }

  /* =========================================================
     PROGRESS
     ========================================================= */
  function initProgress() {
    if (!mount('progress')) return;
    var ens = P.enrollmentList(user.id);
    var done = P.completedIds(user.id);
    var completedItems = P.get('content', []).filter(function (c) { return done.indexOf(c.id) >= 0; });
    var completedIdsSet = done;
    var pendingItems = [];
    ens.forEach(function (e) {
      P.contentFor(e.courseId).forEach(function (c) { if (completedIdsSet.indexOf(c.id) < 0) pendingItems.push(c); });
    });
    var reviewsGiven = P.get('reviews', []).filter(function (r) { return r.reviewerId === user.id; });
    var reviewsReceived = P.get('reviews', []).filter(function (r) {
      return P.get('submissions', []).some(function (s) { return s.id === r.submissionId && s.userId === user.id; });
    });
    var overall = P.overallProgress(user.id);

    var courseBars = ens.map(function (e) {
      var c = P.courseById(e.courseId); if (!c) return '';
      var p = P.courseProgress(user.id, c.id);
      return '<div class="mb-2"><div class="progress-label"><span>' + esc(c.title) + '</span><span>' + p + '%</span></div>' +
        '<div class="progress ' + (p === 100 ? 'green' : '') + '"><span style="width:' + p + '%"></span></div></div>';
    }).join('');

    $('#page-content').innerHTML =
      P.ui.pageHeader('Learning Progress', 'See how far you have come and what is left to do.') +
      '<div class="grid grid-4">' +
        '<div class="card"><div class="stat"><span class="tile">' + icon('chart', 22) + '</span><div><div class="num">' + overall + '%</div><div class="label">Overall progress</div></div></div></div>' +
        '<div class="card"><div class="stat"><span class="tile green">' + icon('checkcircle', 22) + '</span><div><div class="num">' + completedItems.length + '</div><div class="label">Activities completed</div></div></div></div>' +
        '<div class="card"><div class="stat"><span class="tile amber">' + icon('clock', 22) + '</span><div><div class="num">' + pendingItems.length + '</div><div class="label">Pending activities</div></div></div></div>' +
        '<div class="card"><div class="stat"><span class="tile purple">' + icon('star', 22) + '</span><div><div class="num">' + (user.role === 'student' ? reviewsReceived.length : reviewsGiven.length) + '</div><div class="label">' + (user.role === 'student' ? 'Feedback received' : 'Reviews completed') + '</div></div></div></div>' +
      '</div>' +
      '<div class="grid grid-2 mt-2">' +
        '<div class="card"><div class="card-head"><div class="card-title">Course progress</div>' + icon('layers', 18) + '</div>' +
          (courseBars || P.ui.empty('No courses yet', 'Enroll in a course to track progress.', 'book')) +
          '<div class="divider"></div><div class="progress-label"><span><strong>Overall learning progress</strong></span><span>' + overall + '%</span></div>' +
          '<div class="progress green"><span style="width:' + overall + '%"></span></div>' +
        '</div>' +
        '<div class="card"><div class="card-head"><div class="card-title">Completed activities</div>' + icon('checkcircle', 18) + '</div>' +
          '<div class="list">' + (completedItems.length ? completedItems.slice(0, 8).map(function (c) {
            return '<div class="list-item"><span class="tile green">' + icon('check', 16) + '</span><div class="li-body"><div class="li-title">' + esc(c.title) + '</div>' +
              '<div class="li-meta">' + esc((P.courseById(c.courseId) || {}).title || '') + '</div></div></div>';
          }).join('') : P.ui.empty('Nothing completed yet', 'Mark materials as complete in the Content page.', 'check')) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="grid grid-2 mt-2">' +
        '<div class="card"><div class="card-head"><div class="card-title">Pending activities</div>' + icon('clock', 18) + '</div>' +
          '<div class="list">' + (pendingItems.length ? pendingItems.slice(0, 8).map(function (c) {
            return '<div class="list-item"><span class="tile amber">' + icon('play', 16) + '</span><div class="li-body"><div class="li-title">' + esc(c.title) + '</div>' +
              '<div class="li-meta">' + esc((P.courseById(c.courseId) || {}).title || '') + '</div></div><a href="content.html?course=' + c.courseId + '" class="btn btn-soft btn-sm">Study</a></div>';
          }).join('') : P.ui.empty('All done!', 'You have completed every activity.', 'trophy')) + '</div>' +
        '</div>' +
        '<div class="card"><div class="card-head"><div class="card-title">Peer review activity</div>' + icon('star', 18) + '</div>' +
          '<div class="list">' +
            '<div class="list-item"><span class="tile purple">' + icon('star', 17) + '</span><div class="li-body"><div class="li-title">Reviews you completed</div><div class="li-meta">' + reviewsGiven.length + ' review' + (reviewsGiven.length === 1 ? '' : 's') + ' submitted</div></div></div>' +
            '<div class="list-item"><span class="tile green">' + icon('message', 17) + '</span><div class="li-body"><div class="li-title">Feedback you received</div><div class="li-meta">' + reviewsReceived.length + ' piece' + (reviewsReceived.length === 1 ? '' : 's') + ' of feedback</div></div></div>' +
          '</div>' +
          (reviewsReceived.length ? '<div class="divider"></div><div class="small muted">Latest feedback</div>' + reviewsReceived.slice(-1).map(function (r) {
            return '<div class="mt-1"><span class="stars-display">' + '★'.repeat(r.rating) + '</span><p class="small mt-1">' + esc(r.feedback) + '</p></div>';
          }).join('') : '') +
        '</div>' +
      '</div>';
  }

  /* =========================================================
     NOTIFICATIONS
     ========================================================= */
  function initNotifications() {
    if (!mount('notifications')) return;
    var filter = 'All';
    function render() {
      var all = P.get('notifications', []).filter(function (n) { return n.userId === user.id; })
        .sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
      var list = all.filter(function (n) { return filter === 'All' || (filter === 'Unread' && !n.read); });
      var iconFor = { feedback: 'message', review: 'star', enroll: 'graduation', assignment: 'upload' };
      var clsFor = { feedback: 'green', review: 'purple', enroll: '', assignment: 'amber' };

      $('#page-content').innerHTML =
        P.ui.pageHeader('Notifications', 'Stay up to date with reviews, feedback and course activity.',
          '<button class="btn btn-ghost" id="mark-all">' + icon('check', 16) + ' Mark all as read</button>') +
        '<div class="card">' +
          '<div class="chips mb-2">' + ['All', 'Unread'].map(function (f) {
            return '<button class="chip' + (f === filter ? ' active' : '') + '" data-filter="' + f + '">' + f + '</button>';
          }).join('') + '</div>' +
          '<div class="list">' + (list.length ? list.map(function (n) {
            return '<div class="list-item' + (n.read ? '' : ' unread') + '">' +
              '<span class="tile ' + (clsFor[n.type] || '') + '">' + icon(iconFor[n.type] || 'bell', 18) + '</span>' +
              '<div class="li-body"><div class="li-title">' + esc(n.title) + '</div>' +
                '<div class="small">' + esc(n.message) + '</div>' +
                '<div class="li-meta mt-1">' + icon('clock', 12) + ' ' + P.timeAgo(n.createdAt) + '</div></div>' +
              (n.read ? '<span class="badge green">Read</span>' : '<button class="btn btn-soft btn-sm" data-read="' + n.id + '">Mark as read</button>') +
            '</div>';
          }).join('') : P.ui.empty('Nothing here', 'No notifications match this filter.', 'bell')) + '</div>' +
        '</div>';

      $$('[data-filter]').forEach(function (b) { b.onclick = function () { filter = b.dataset.filter; render(); }; });
      $$('[data-read]').forEach(function (b) {
        b.onclick = function () {
          P.set('notifications', P.get('notifications', []).map(function (n) { return n.id === b.dataset.read ? Object.assign({}, n, { read: true }) : n; }));
          P.ui.toast('Marked as read.', 'success'); render();
        };
      });
      $('#mark-all').onclick = function () {
        P.set('notifications', P.get('notifications', []).map(function (n) { return n.userId === user.id ? Object.assign({}, n, { read: true }) : n; }));
        P.ui.toast('All notifications marked as read.', 'success'); render();
      };
    }
    render();
  }

  /* =========================================================
     PROFILE
     ========================================================= */
  function initProfile() {
    if (!mount('profile')) return;
    function render() {
      var ens = P.enrollmentList(user.id);
      var reviewsGiven = P.get('reviews', []).filter(function (r) { return r.reviewerId === user.id; }).length;
      var subs = P.get('submissions', []).filter(function (s) { return s.userId === user.id; }).length;
      var prog = P.overallProgress(user.id);
      var fresh = P.auth.userById(user.id);

      $('#page-content').innerHTML =
        P.ui.pageHeader('My Profile', 'Manage your account details and see your learning summary.',
          '<button class="btn btn-primary" id="edit-profile">' + icon('edit', 16) + ' Edit Profile</button>') +
        '<div class="grid" style="grid-template-columns:320px 1fr">' +
          '<div class="card center"><div class="avatar" style="width:90px;height:90px;border-radius:26px;font-size:2rem;margin:0 auto 1rem">' + esc(P.initials(fresh.name)) + '</div>' +
            '<h2 style="font-size:1.3rem">' + esc(fresh.name) + '</h2>' +
            '<div class="muted small">' + esc(fresh.email) + '</div>' +
            '<div class="mt-1">' + P.roleBadge(fresh.role) + '</div>' +
            '<div class="divider"></div>' +
            '<div class="small muted">' + icon('calendar', 14) + ' Joined ' + P.fmtDate(fresh.joinedAt) + '</div>' +
          '</div>' +
          '<div>' +
            '<div class="grid grid-4">' +
              '<div class="card"><div class="stat"><span class="tile">' + icon('book', 20) + '</span><div><div class="num">' + ens.length + '</div><div class="label">Courses</div></div></div></div>' +
              '<div class="card"><div class="stat"><span class="tile purple">' + icon('star', 20) + '</span><div><div class="num">' + reviewsGiven + '</div><div class="label">Reviews</div></div></div></div>' +
              '<div class="card"><div class="stat"><span class="tile amber">' + icon('upload', 20) + '</span><div><div class="num">' + subs + '</div><div class="label">Submissions</div></div></div></div>' +
              '<div class="card"><div class="stat"><span class="tile green">' + icon('chart', 20) + '</span><div><div class="num">' + prog + '%</div><div class="label">Progress</div></div></div></div>' +
            '</div>' +
            '<div class="card mt-2"><div class="card-head"><div class="card-title">Account details</div></div>' +
              '<div class="grid grid-2">' +
                '<div><div class="small muted">Full name</div><strong>' + esc(fresh.name) + '</strong></div>' +
                '<div><div class="small muted">Email address</div><strong>' + esc(fresh.email) + '</strong></div>' +
                '<div><div class="small muted">Role</div><strong>' + esc(fresh.role) + '</strong></div>' +
                '<div><div class="small muted">Member since</div><strong>' + P.fmtDate(fresh.joinedAt) + '</strong></div>' +
              '</div>' +
            '</div>' +
            '<div class="card mt-2"><div class="card-head"><div class="card-title">Enrolled courses</div><a href="courses.html" class="small">Browse more</a></div>' +
              '<div class="list">' + (ens.length ? ens.map(function (e) {
                var c = P.courseById(e.courseId); if (!c) return '';
                var p = P.courseProgress(user.id, c.id);
                return '<div class="list-item"><span class="tile">' + icon('book', 17) + '</span><div class="li-body"><div class="li-title">' + esc(c.title) + '</div>' +
                  '<div class="progress mt-1"><span style="width:' + p + '%"></span></div></div><span class="badge">' + p + '%</span></div>';
              }).join('') : P.ui.empty('No courses yet', 'Enroll in a course to get started.', 'book')) + '</div>' +
            '</div>' +
          '</div>' +
        '</div>';

      $('#edit-profile').onclick = function () {
        P.ui.modal({
          title: 'Edit profile',
          body:
            '<div class="field"><label>Full name</label><input class="input" id="ep-name" value="' + esc(fresh.name) + '"></div>' +
            '<div class="field"><label>Email</label><input class="input" id="ep-email" value="' + esc(fresh.email) + '"></div>' +
            '<div class="field"><label>New password <span class="muted">(leave blank to keep current)</span></label><input class="input" type="password" id="ep-pass" placeholder="••••••"></div>',
          okText: 'Save changes',
          onOk: function () {
            var name = $('#ep-name').value.trim(), email = $('#ep-email').value.trim(), pass = $('#ep-pass').value;
            if (name.length < 2) { P.ui.toast('Enter a valid name.', 'error'); return false; }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { P.ui.toast('Enter a valid email.', 'error'); return false; }
            var other = P.auth.findUserByEmail(email);
            if (other && other.id !== user.id) { P.ui.toast('That email is already in use.', 'error'); return false; }
            if (pass && pass.length < 6) { P.ui.toast('Password must be at least 6 characters.', 'error'); return false; }
            var changes = { name: name, email: email.toLowerCase() };
            if (pass) changes.password = pass;
            P.auth.updateProfile(user.id, changes);
            user = P.auth.currentUser() ? P.auth.userById(user.id) : user;
            P.ui.toast('Profile updated!', 'success'); render();
          }
        });
      };
    }
    render();
  }

  /* =========================================================
     ADMIN
     ========================================================= */
  function initAdmin() {
    if (!mount('admin')) return;
    if (user.role !== 'admin') { location.replace('dashboard.html'); return; }
    var tab = 'users';

    function render() {
      var users = P.get('users', []), courses = P.get('courses', []), subs = P.get('submissions', []),
        reviews = P.get('reviews', []), content = P.get('content', []), ens = P.get('enrollments', []);

      var stat = function (ic, n, label, cls) {
        return '<div class="card hoverable"><div class="stat"><span class="tile ' + (cls || '') + '">' + icon(ic, 22) + '</span>' +
          '<div><div class="num">' + n + '</div><div class="label">' + label + '</div></div></div></div>';
      };
      var tabs = ['users', 'courses', 'content', 'submissions'].map(function (t) {
        return '<button class="chip' + (t === tab ? ' active' : '') + '" data-tab="' + t + '">' + t.charAt(0).toUpperCase() + t.slice(1) + '</button>';
      }).join('');
      var table = '';

      if (tab === 'users') {
        table = '<table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Courses</th><th>Joined</th><th>Action</th></tr></thead><tbody>' +
          users.map(function (u) {
            var cnt = ens.filter(function (e) { return e.userId === u.id; }).length;
            return '<tr><td><strong>' + esc(u.name) + '</strong></td><td>' + esc(u.email) + '</td>' +
              '<td><select class="input" style="padding:.35rem .5rem;width:auto" data-role="' + u.id + '">' +
              ['student', 'reviewer', 'admin'].map(function (r) { return '<option value="' + r + '"' + (u.role === r ? ' selected' : '') + '>' + r + '</option>'; }).join('') + '</select></td>' +
              '<td>' + cnt + '</td><td>' + P.fmtDate(u.joinedAt) + '</td>' +
              '<td>' + (u.id === user.id ? '<span class="badge green">You</span>' :
                '<button class="btn btn-icon btn-sm btn-ghost" data-del-user="' + u.id + '" aria-label="Delete">' + icon('trash', 15) + '</button>') + '</td></tr>';
          }).join('') + '</tbody></table>';
      } else if (tab === 'courses') {
        table = '<table><thead><tr><th>Course</th><th>Code</th><th>Category</th><th>Instructor</th><th>Enrolled</th><th>Action</th></tr></thead><tbody>' +
          courses.map(function (c) {
            return '<tr><td><strong>' + esc(c.emoji) + ' ' + esc(c.title) + '</strong></td><td>' + esc(c.code) + '</td>' +
              '<td>' + esc(c.category) + '</td><td>' + esc(c.instructor) + '</td>' +
              '<td>' + ens.filter(function (e) { return e.courseId === c.id; }).length + '</td>' +
              '<td><button class="btn btn-icon btn-sm btn-ghost" data-del-course="' + c.id + '" aria-label="Delete">' + icon('trash', 15) + '</button></td></tr>';
          }).join('') + '</tbody></table>';
      } else if (tab === 'content') {
        table = '<table><thead><tr><th>Title</th><th>Type</th><th>Course</th><th>Added</th><th>Action</th></tr></thead><tbody>' +
          content.map(function (c) {
            return '<tr><td><strong>' + esc(c.title) + '</strong></td><td><span class="type-pill type-' + c.type + '">' + c.type + '</span></td>' +
              '<td>' + esc((P.courseById(c.courseId) || {}).title || '—') + '</td><td>' + P.fmtDate(c.createdAt) + '</td>' +
              '<td><button class="btn btn-icon btn-sm btn-ghost" data-del-content="' + c.id + '" aria-label="Delete">' + icon('trash', 15) + '</button></td></tr>';
          }).join('') + '</tbody></table>';
      } else {
        table = '<table><thead><tr><th>Assignment</th><th>Student</th><th>Course</th><th>Status</th><th>Submitted</th><th>Action</th></tr></thead><tbody>' +
          subs.map(function (s) {
            return '<tr><td><strong>' + esc(s.title) + '</strong></td><td>' + esc(P.auth.userById(s.userId).name) + '</td>' +
              '<td>' + esc((P.courseById(s.courseId) || {}).title || '—') + '</td><td>' + P.submissionStatusBadge(s) + '</td>' +
              '<td>' + P.timeAgo(s.createdAt) + '</td>' +
              '<td><button class="btn btn-icon btn-sm btn-ghost" data-del-sub="' + s.id + '" aria-label="Delete">' + icon('trash', 15) + '</button></td></tr>';
          }).join('') + '</tbody></table>';
      }

      $('#page-content').innerHTML =
        P.ui.pageHeader('Admin Dashboard', 'System overview and management tools.',
          '<button class="btn btn-ghost" id="reset-demo">' + icon('refresh', 16) + ' Reset demo data</button>' +
          '<button class="btn btn-purple" id="add-course">' + icon('plus', 16) + ' Add Course</button>') +
        '<div class="grid grid-4">' +
          stat('users', users.length, 'Total users') +
          stat('book', courses.length, 'Total courses', 'purple') +
          stat('upload', subs.length, 'Total submissions', 'amber') +
          stat('star', reviews.length, 'Total reviews', 'green') +
        '</div>' +
        '<div class="card mt-2"><div class="card-head"><div><div class="card-title">Management</div>' +
          '<div class="small muted">' + content.length + ' materials · ' + ens.length + ' enrollments</div></div></div>' +
          '<div class="chips mb-2">' + tabs + '</div>' +
          '<div class="table-wrap">' + table + '</div>' +
        '</div>';

      $$('[data-tab]').forEach(function (b) { b.onclick = function () { tab = b.dataset.tab; render(); }; });
      $$('[data-role]').forEach(function (s) {
        s.onchange = function () {
          P.set('users', P.get('users', []).map(function (u) { return u.id === s.dataset.role ? Object.assign({}, u, { role: s.value }) : u; }));
          P.ui.toast('Role updated.', 'success'); render();
        };
      });
      function deleteFrom(key, id, msg) {
        P.ui.confirm(msg, function () {
          P.set(key, P.get(key, []).filter(function (x) { return x.id !== id; }));
          P.ui.toast('Record deleted.', 'success'); render();
        });
      }
      $$('[data-del-user]').forEach(function (b) {
        b.onclick = function () {
          deleteFrom('users', b.dataset.delUser, 'Delete this user and their data?');
          P.set('submissions', P.get('submissions', []).filter(function (s) { return s.userId !== b.dataset.delUser; }));
        };
      });
      $$('[data-del-course]').forEach(function (b) { b.onclick = function () { deleteFrom('courses', b.dataset.delCourse, 'Delete this course?'); }; });
      $$('[data-del-content]').forEach(function (b) { b.onclick = function () { deleteFrom('content', b.dataset.delContent, 'Delete this material?'); }; });
      $$('[data-del-sub]').forEach(function (b) { b.onclick = function () { deleteFrom('submissions', b.dataset.delSub, 'Delete this submission?'); }; });

      $('#reset-demo').onclick = function () {
        P.ui.confirm('Reset all demo data? Your test accounts and activity will be removed.', function () {
          Object.keys(P.KEYS).forEach(function (k) { localStorage.removeItem(P.KEYS[k]); });
          P.seed();
          location.href = 'login.html';
        });
      };
      $('#add-course').onclick = function () {
        P.ui.modal({
          title: 'Add a new course',
          body:
            '<div class="grid grid-2">' +
              '<div class="field"><label>Course title</label><input class="input" id="ac-title" placeholder="e.g. Cloud Computing"></div>' +
              '<div class="field"><label>Code</label><input class="input" id="ac-code" placeholder="CS410"></div>' +
            '</div>' +
            '<div class="grid grid-2">' +
              '<div class="field"><label>Category</label><input class="input" id="ac-cat" placeholder="Development"></div>' +
              '<div class="field"><label>Instructor</label><input class="input" id="ac-inst" placeholder="Prof. Name"></div>' +
            '</div>' +
            '<div class="grid grid-2">' +
              '<div class="field"><label>Emoji / icon</label><input class="input" id="ac-emoji" value="📘"></div>' +
              '<div class="field"><label>Credits</label><input class="input" type="number" id="ac-credits" value="3" min="1" max="6"></div>' +
            '</div>' +
            '<div class="field"><label>Description</label><textarea class="input" id="ac-desc"></textarea></div>',
          okText: 'Create course',
          onOk: function () {
            var title = $('#ac-title').value.trim(), code = $('#ac-code').value.trim();
            if (!title || !code) { P.ui.toast('Title and code are required.', 'error'); return false; }
            var list = P.get('courses', []);
            list.push({
              id: P.uid('c'), title: title, code: code,
              category: $('#ac-cat').value.trim() || 'General',
              instructor: $('#ac-inst').value.trim() || 'TBA',
              emoji: $('#ac-emoji').value.trim() || '📘',
              credits: +$('#ac-credits').value || 3, students: 0,
              desc: $('#ac-desc').value.trim() || 'A new course for peer learning.'
            });
            P.set('courses', list);
            P.ui.toast('Course created!', 'success'); render();
          }
        });
      };
    }
    render();
  }

  /* =========================================================
     LANDING (small enhancements only)
     ========================================================= */
  function initLanding() {
    P.ui.revealOnScroll();
    var logged = P.auth.currentUser();
    if (logged) {
      var a = $('#hero-dashboard'), b = $('#hero-login');
      if (a && b) { a.textContent = 'Go to Dashboard'; a.href = logged.role === 'admin' ? 'admin.html' : 'dashboard.html'; b.classList.add('hidden'); }
    }
  }

  /* =========================================================
     BOOTSTRAP
     ========================================================= */
  var inits = {
    index: initLanding,
    register: initRegister,
    login: initLogin,
    dashboard: initDashboard,
    courses: initCourses,
    content: initContent,
    submission: initSubmission,
    review: initReview,
    progress: initProgress,
    notifications: initNotifications,
    profile: initProfile,
    admin: initAdmin
  };
  document.addEventListener('DOMContentLoaded', function () {
    if (inits[page]) inits[page]();
  });
})();
