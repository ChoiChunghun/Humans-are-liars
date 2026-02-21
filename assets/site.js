(function () {
  var page = document.body.getAttribute('data-page');
  if (!page) return;

  var links = document.querySelectorAll('.menu a[data-nav]');
  links.forEach(function (link) {
    link.classList.toggle('active', link.getAttribute('data-nav') === page);
  });
})();
