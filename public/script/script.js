// nav dongle
document.getElementById('menu-icon').onclick = function() {
    var nav = document.getElementById('nav-links');
    if (nav.classList.contains('show')) {
        nav.classList.remove('show');
    } else {
        nav.classList.add('show');
    }
}
