(function () {
  var POSTS_KEY = 'cch_think_posts_v1';
  var ADMIN_SESSION_KEY = 'cch_think_admin_ok';
  var OWNER_PASSWORD = '0314';

  var defaultPosts = [
    {
      id: 'welcome-think',
      title: 'Welcome to Think',
      summary: '이 공간은 작업 기록, 메모, 아이디어를 정리하는 개인 블로그 섹션입니다.',
      content:
        'Think 페이지는 목록과 상세 화면으로 구성되어 있습니다. 새로운 글은 Write 페이지에서 관리자 인증 후 작성할 수 있습니다.',
      createdAt: '2026-02-13'
    }
  ];

  function loadPosts() {
    var raw = localStorage.getItem(POSTS_KEY);
    if (!raw) {
      localStorage.setItem(POSTS_KEY, JSON.stringify(defaultPosts));
      return defaultPosts.slice();
    }
    try {
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : defaultPosts.slice();
    } catch (err) {
      return defaultPosts.slice();
    }
  }

  function savePosts(posts) {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  }

  function esc(text) {
    return String(text)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function fmtDate(iso) {
    var d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function buildId(title) {
    return (
      title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 40) +
      '-' +
      Date.now()
    );
  }

  function renderList() {
    var root = document.getElementById('think-list');
    if (!root) return;

    var posts = loadPosts();
    root.innerHTML = posts
      .map(function (post) {
        return (
          '<article class="post-item">' +
          '<h3><a href="think-post.html?id=' +
          encodeURIComponent(post.id) +
          '">' +
          esc(post.title) +
          '</a></h3>' +
          '<p>' +
          esc(post.summary || '') +
          '</p>' +
          '<p class="muted">' +
          esc(fmtDate(post.createdAt)) +
          '</p>' +
          '</article>'
        );
      })
      .join('');
  }

  function renderPost() {
    var root = document.getElementById('think-post-detail');
    if (!root) return;

    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    var posts = loadPosts();
    var post = posts.find(function (item) {
      return item.id === id;
    });

    if (!post) {
      root.innerHTML = '<p class="muted">글을 찾을 수 없습니다.</p>';
      return;
    }

    root.innerHTML =
      '<h1 class="page-title" style="font-size:clamp(1.8rem,4vw,3.2rem)">' +
      esc(post.title) +
      '</h1>' +
      '<p class="muted">' +
      esc(fmtDate(post.createdAt)) +
      '</p>' +
      '<article class="panel" style="margin-top:0.8rem; white-space:pre-wrap">' +
      esc(post.content || '') +
      '</article>';
  }

  function setupWrite() {
    var authWrap = document.getElementById('write-auth');
    var formWrap = document.getElementById('write-form-wrap');
    if (!authWrap || !formWrap) return;

    function setUnlocked(unlocked) {
      authWrap.style.display = unlocked ? 'none' : 'block';
      formWrap.style.display = unlocked ? 'block' : 'none';
    }

    setUnlocked(sessionStorage.getItem(ADMIN_SESSION_KEY) === '1');

    var authForm = document.getElementById('auth-form');
    authForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var pwd = document.getElementById('admin-password').value;
      if (pwd === OWNER_PASSWORD) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
        setUnlocked(true);
      } else {
        alert('비밀번호가 올바르지 않습니다.');
      }
    });

    var writeForm = document.getElementById('write-form');
    writeForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var title = document.getElementById('post-title').value.trim();
      var summary = document.getElementById('post-summary').value.trim();
      var content = document.getElementById('post-content').value.trim();

      if (!title || !content) {
        alert('제목과 본문을 입력해주세요.');
        return;
      }

      var posts = loadPosts();
      posts.unshift({
        id: buildId(title),
        title: title,
        summary: summary,
        content: content,
        createdAt: new Date().toISOString().slice(0, 10)
      });
      savePosts(posts);
      window.location.href = 'think.html';
    });
  }

  renderList();
  renderPost();
  setupWrite();
})();
