let allMovies = [];
let currentPage = 1;
const moviesPerPage = 30;
let activeFilters = {};

window.addEventListener("DOMContentLoaded", () => {
  fetch("/movies")
    .then(res => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    })
    .then(data => {
      if (!Array.isArray(data)) {
        console.error("Expected array but got:", data);
        throw new Error("Invalid data format from server");
      }
      allMovies = data;
      renderMovies(allMovies);
      renderPagination(allMovies);
    })
    .catch(error => {
      console.error("Error fetching movies:", error);
      document.getElementById("moviesContainer").innerHTML = `
        <div class="error-message">
          Failed to load movies. Please try again later.
        </div>
      `;
    });

  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = filterMovies(allMovies);
    currentPage = 1;
    renderMovies(filtered.filter(m => m?.title?.toLowerCase().includes(term)));
    renderPagination(filtered.filter(m => m?.title?.toLowerCase().includes(term)));
  });

  
  document.querySelectorAll(".filter-dropdown > span").forEach(el => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      const dropdown = el.parentElement;
      
      
      document.querySelectorAll(".filter-dropdown").forEach(dd => {
        if (dd !== dropdown) dd.classList.remove("active");
      });
      dropdown.classList.toggle("active");
    });
  });

  
  document.querySelectorAll('.has-submenu').forEach(item => {
    const toggle = item.querySelector('.submenu-toggle');
    
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      
      
      const parentList = item.parentElement;
      parentList.querySelectorAll('.has-submenu').forEach(sub => {
        if (sub !== item) sub.classList.remove("active");
      });
      
      
      item.classList.toggle("active");
    });
  });

  
  document.querySelectorAll(".dropdown li:not(.has-submenu)").forEach(item => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      
      const filterType = item.closest(".filter-dropdown").querySelector("span").textContent.trim().toLowerCase();
      const value = item.dataset.year || item.dataset.genre || item.dataset.runtime || item.dataset.lang;
      
      
      if (activeFilters[filterType] === value) {
        delete activeFilters[filterType];
        item.classList.remove("selected");
      } else {
        activeFilters[filterType] = value;
        
        
        const dropdown = item.closest(".dropdown");
        dropdown.querySelectorAll("li").forEach(li => {
          li.classList.remove("selected");
        });
        
        item.classList.add("selected");
      }
      
      currentPage = 1;
      const filtered = filterMovies(allMovies);
      renderMovies(filtered);
      renderPagination(filtered);
    });
  });

  
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.filter-dropdown')) {
      document.querySelectorAll('.filter-dropdown, .has-submenu').forEach(el => {
        el.classList.remove('active');
      });
    }
  });
});

function filterMovies(movies = []) {
  const moviesArray = Array.isArray(movies) ? movies : [];
  let filtered = [...moviesArray];
  
  if (activeFilters.year) {
    filtered = filtered.filter(m => m?.release_year == activeFilters.year);
  }
  
  if (activeFilters.genre) {
    filtered = filtered.filter(m => {
      const genres = m?.genres?.toLowerCase().split(',').map(g => g.trim());
      return genres?.includes(activeFilters.genre.toLowerCase());
    });
  }
  
  if (activeFilters.language) {
    filtered = filtered.filter(m => 
      m?.spoken_languages?.toLowerCase().includes(activeFilters.language.toLowerCase())
    );
  }
  
  if (activeFilters.runtime) {
    const value = activeFilters.runtime;
    filtered = filtered.filter(m => {
      const r = parseInt(m?.runtime);
      if (isNaN(r)) return false;
      if (value === "under30") return r < 30;
      if (value === "30") return r >= 30 && r <= 60;
      if (value === "60") return r > 60 && r <= 120;
      if (value === "120") return r > 120 && r <= 180;
      if (value === "180") return r > 180;
      return false;
    });
  }
  
  return filtered;
}

function renderMovies(movies = []) {
  const container = document.getElementById("moviesContainer");
  container.innerHTML = "";
  
  const moviesArray = Array.isArray(movies) ? movies : [];
  
  
  const moviesToShow = currentPage === 1 
    ? moviesArray.filter(m => m?.poster_path).slice(0, moviesPerPage)
    : moviesArray.slice((currentPage - 1) * moviesPerPage, currentPage * moviesPerPage);

  if (moviesToShow.length === 0) {
    container.innerHTML = `<div class="no-results">No movies found</div>`;
    return;
  }

  moviesToShow.forEach(m => {
    if (!m) return; 
    
    const poster = m.poster_path
      ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
      : "https://via.placeholder.com/200x300?text=No+Poster";

    const block = document.createElement("div");
    block.className = "block";
    block.innerHTML = `
      <img src="${poster}" alt="${m.title || 'Untitled'}" />
      <div class="block-content">
        <h3 class="block-title">${m.title || 'Untitled'}</h3>
        <a href="movie.html?id=${m.id || ''}" target="_blank">Watch Now</a>
      </div>
    `;
    container.appendChild(block);
  });
}

function renderPagination(movies = []) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";
  
  const moviesArray = Array.isArray(movies) ? movies : [];
  
  
  const totalItems = currentPage === 1 
    ? moviesArray.filter(m => m?.poster_path).length
    : moviesArray.length;
  
  const totalPages = Math.ceil(totalItems / moviesPerPage);
  
  if (totalPages <= 1) return;

  function createPageButton(page) {
    const btn = document.createElement("button");
    btn.textContent = page;
    if (page === currentPage) btn.classList.add("active");
    btn.addEventListener("click", () => {
      currentPage = page;
      renderMovies(moviesArray);
      renderPagination(moviesArray);
    });
    pagination.appendChild(btn);
  }

  function addDots() {
    const span = document.createElement("span");
    span.textContent = "...";
    span.className = "dots";
    pagination.appendChild(span);
  }

  createPageButton(1);
  if (currentPage > 4) addDots();
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    createPageButton(i);
  }
  if (currentPage < totalPages - 3) addDots();
  if (totalPages > 1) createPageButton(totalPages);
}