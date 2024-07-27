function toggleMobileMenu(icon) {
  const mobileMenu = document.querySelector('.mobile-menu');
  icon.classList.toggle('open'); // Dodaj lub usuń klasę 'open' dla ikony hamburgera
  mobileMenu.classList.toggle('open'); // Dodaj lub usuń klasę 'open' dla menu mobilnego
}

// Funkcja do obsługi zmiany rozmiaru ekranu
function handleResize() {
  const mobileMenu = document.querySelector('.mobile-menu');
  const icon = document.querySelector('#hamburger-icon');
  const screenWidth = window.innerWidth;

  // Jeśli szerokość ekranu jest większa niż 1400 pikseli i menu mobilne jest otwarte, zamknij je
  if (screenWidth > 1400 && mobileMenu.classList.contains('open')) {
    mobileMenu.classList.remove('open'); // Usuń klasę 'open' z menu mobilnego
    icon.classList.remove('open'); // Usuń klasę 'open' z ikony hamburgera
  }
}

// Nasłuchuj zmiany rozmiaru ekranu i wywołaj funkcję handleResize
window.addEventListener('resize', handleResize);
