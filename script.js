
document.addEventListener("DOMContentLoaded", () => {
  // All image paths use lowercase names without spaces.
  const imageFolder = "images/";

  // Background slideshow: only 6 images
  const backgrounds = Array.from(
    { length: 6 },
    (_, index) => `${imageFolder}background${index + 1}.png`
  );

  // Each wallpaper collection contains 8 images.
  const collections = {
    front: {
      title: "Front Wallpapers",
      files: Array.from({ length: 8 }, (_, i) => `front${i + 1}.png`)
    },
    nature: {
      title: "Nature Wallpapers",
      files: Array.from({ length: 8 }, (_, i) => `nature${i + 1}.png`)
    },
    alpha: {
      title: "Alpha Wallpapers",
      files: Array.from({ length: 8 }, (_, i) => `alpha${i + 1}.png`)
    },
    yellow: {
      title: "Yellow Wallpapers",
      files: Array.from({ length: 8 }, (_, i) => `yellow${i + 1}.png`)
    },
    black: {
      title: "Black Wallpapers",
      files: Array.from({ length: 8 }, (_, i) => `black${i + 1}.png`)
    },
    peach: {
      title: "Peach Wallpapers",
      files: Array.from({ length: 8 }, (_, i) => `peach${i + 1}.png`)
    },
    pink: {
      title: "Pink Wallpapers",
      files: Array.from({ length: 8 }, (_, i) => `pink${i + 1}.png`)
    },
    purple: {
      title: "Purple Wallpapers",
      files: Array.from({ length: 8 }, (_, i) => `purple${i + 1}.png`)
    },
    seagreen: {
      title: "Sea Green Wallpapers",
      files: Array.from({ length: 8 }, (_, i) => `sea green${i + 1}.png`)
    },
    white: {
      title: "White Wallpapers",
      files: Array.from({ length: 8 }, (_, i) => `white${i + 1}.png`)
    }
  };

  // Build a complete list for searching and favorites.
  const allWallpapers = [];

  Object.entries(collections).forEach(([category, collection]) => {
    collection.files.forEach((file, index) => {
      allWallpapers.push({
        id: `${category}-${index + 1}`,
        file,
        category,
        categoryTitle: collection.title,
        title: `${collection.title.replace(" Wallpapers", "")} ${index + 1}`,
        src: imageFolder + file
      });
    });
  });

  const frontWallpapers = allWallpapers.filter(
    wallpaper => wallpaper.category === "front"
  );

  const natureWallpapers = allWallpapers.filter(
    wallpaper => wallpaper.category === "nature"
  );

  // Elements
  const frontGrid = document.getElementById("frontGrid");
  const natureGrid = document.getElementById("natureGrid");
  const collectionGrid = document.getElementById("collectionGrid");
  const favoritesGrid = document.getElementById("favoritesGrid");
  const favoritesEmpty = document.getElementById("favoritesEmpty");
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const categoryButtons = document.getElementById("categoryButtons");
  const resultsHeading = document.getElementById("resultsHeading");
  const resultsTitle = document.getElementById("resultsTitle");
  const clearResults = document.getElementById("clearResults");
  const emptyMessage = document.getElementById("emptyMessage");

  const modal = document.getElementById("wallpaperModal");
  const modalImage = document.getElementById("modalImage");
  const modalTitle = document.getElementById("modalTitle");
  const modalCategory = document.getElementById("modalCategory");
  const modalClose = document.getElementById("modalClose");
  const modalFavorite = document.getElementById("modalFavorite");
  const modalDownload = document.getElementById("modalDownload");

  let selectedWallpaper = null;
  let currentCollection = null;
  let currentSearch = "";

  // Read saved favorites safely.
  function getSavedFavorites() {
    try {
      const saved = JSON.parse(localStorage.getItem("dreamwallFavorites"));
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  }

  let favorites = getSavedFavorites();

  function saveFavorites() {
    try {
      localStorage.setItem("dreamwallFavorites", JSON.stringify(favorites));
    } catch {
      // Favorites still work for the current page session.
    }
  }

  function isFavorite(id) {
    return favorites.includes(id);
  }

  // Background slideshow
  const backgroundElement = document.getElementById("backgroundSlideshow");
  let backgroundIndex = 0;

  function showBackground(index) {
    const image = new Image();

    image.onload = () => {
      backgroundElement.style.backgroundImage = `url("${backgrounds[index]}")`;
    };

    image.onerror = () => {
      console.warn(`Background image not found: ${backgrounds[index]}`);
    };

    image.src = backgrounds[index];
  }

  showBackground(backgroundIndex);

  window.setInterval(() => {
    backgroundIndex = (backgroundIndex + 1) % backgrounds.length;
    showBackground(backgroundIndex);
  }, 5000);

  // Create a wallpaper card.
  function createCard(wallpaper) {
    const card = document.createElement("article");
    card.className = "wallpaper-card";

    const imageWrap = document.createElement("div");
    imageWrap.className = "image-wrap";

    const image = document.createElement("img");
    image.className = "wallpaper-image";
    image.src = wallpaper.src;
    image.alt = wallpaper.title;
    image.loading = "lazy";

    image.addEventListener("error", () => {
      image.alt = `${wallpaper.file} could not be loaded`;
      imageWrap.classList.add("image-error");
      image.style.display = "none";

      const message = document.createElement("p");
      message.textContent = `Image not found: ${wallpaper.file}`;
      message.className = "image-error-message";
      imageWrap.appendChild(message);
    });

    image.addEventListener("click", () => openModal(wallpaper));

    const favoriteButton = document.createElement("button");
    favoriteButton.className = "favorite-btn";
    favoriteButton.type = "button";
    favoriteButton.setAttribute("aria-label", "Add to favorites");

    function updateFavoriteButton() {
      const active = isFavorite(wallpaper.id);
      favoriteButton.textContent = active ? "♥" : "♡";
      favoriteButton.classList.toggle("active", active);
      favoriteButton.setAttribute(
        "aria-label",
        active ? "Remove from favorites" : "Add to favorites"
      );
    }

    updateFavoriteButton();

    favoriteButton.addEventListener("click", () => {
      toggleFavorite(wallpaper.id);
      updateFavoriteButton();
      updateFavoritesGrid();

      if (selectedWallpaper?.id === wallpaper.id) {
        updateModalFavoriteButton();
      }
    });

    imageWrap.append(image, favoriteButton);

    const info = document.createElement("div");
    info.className = "card-info";

    const title = document.createElement("h3");
    title.textContent = wallpaper.title;

    const category = document.createElement("p");
    category.textContent = wallpaper.categoryTitle;

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const viewButton = document.createElement("button");
    viewButton.className = "view-button";
    viewButton.type = "button";
    viewButton.textContent = "View Details";
    viewButton.addEventListener("click", () => openModal(wallpaper));

    const downloadButton = document.createElement("a");
    downloadButton.className = "download-button";
    downloadButton.href = wallpaper.src;
    downloadButton.download = wallpaper.file;
    downloadButton.textContent = "Download";

    actions.append(viewButton, downloadButton);
    info.append(title, category, actions);
    card.append(imageWrap, info);

    return card;
  }

  // Render a group of wallpapers.
  function renderWallpapers(container, wallpapers) {
    container.replaceChildren();

    wallpapers.forEach(wallpaper => {
      container.appendChild(createCard(wallpaper));
    });
  }

  // Homepage only shows Front and Nature.
  renderWallpapers(frontGrid, frontWallpapers);
  renderWallpapers(natureGrid, natureWallpapers);

  // Favorite controls
  function toggleFavorite(id) {
    if (isFavorite(id)) {
      favorites = favorites.filter(favoriteId => favoriteId !== id);
    } else {
      favorites.push(id);
    }

    saveFavorites();
  }

  function updateFavoritesGrid() {
    const savedWallpapers = allWallpapers.filter(
      wallpaper => isFavorite(wallpaper.id)
    );

    renderWallpapers(favoritesGrid, savedWallpapers);
    favoritesEmpty.hidden = savedWallpapers.length > 0;
  }

  updateFavoritesGrid();

  // Collection display
  function setActiveCategory(category) {
    document.querySelectorAll(".category-btn").forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.category === category
      );
    });
  }

  function showCollection(category) {
    const collection = collections[category];
    if (!collection) return;

    currentCollection = category;
    currentSearch = "";
    searchInput.value = "";

    setActiveCategory(category);

    const wallpapers = allWallpapers.filter(
      wallpaper => wallpaper.category === category
    );

    resultsHeading.hidden = false;
    resultsTitle.textContent = collection.title;
    emptyMessage.hidden = wallpapers.length > 0;

    renderWallpapers(collectionGrid, wallpapers);

    document.getElementById("collections").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  categoryButtons.addEventListener("click", event => {
    const button = event.target.closest(".category-btn");
    if (!button) return;

    showCollection(button.dataset.category);
  });

  // Search wallpapers by collection name or wallpaper title.
  function performSearch() {
    const query = searchInput.value.trim().toLowerCase();

    currentSearch = query;
    currentCollection = null;

    setActiveCategory(null);

    if (!query) {
      resetCollections();
      return;
    }

    const results = allWallpapers.filter(wallpaper => {
      return (
        wallpaper.title.toLowerCase().includes(query) ||
        wallpaper.category.toLowerCase().includes(query) ||
        wallpaper.categoryTitle.toLowerCase().includes(query) ||
        wallpaper.file.toLowerCase().includes(query)
      );
    });

    resultsHeading.hidden = false;
    resultsTitle.textContent = `Search Results (${results.length})`;
    emptyMessage.hidden = results.length > 0;

    renderWallpapers(collectionGrid, results);

    document.getElementById("collections").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  searchButton.addEventListener("click", performSearch);

  searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      performSearch();
    }
  });

  // Reset the collection area without showing every color collection.
  function resetCollections() {
    currentCollection = null;
    currentSearch = "";
    searchInput.value = "";

    setActiveCategory(null);
    resultsHeading.hidden = true;
    emptyMessage.hidden = true;
    collectionGrid.replaceChildren();
  }

  clearResults.addEventListener("click", resetCollections);

  // Wallpaper details popup
  function openModal(wallpaper) {
    selectedWallpaper = wallpaper;

    modalImage.src = wallpaper.src;
    modalImage.alt = wallpaper.title;
    modalTitle.textContent = wallpaper.title;
    modalCategory.textContent = wallpaper.categoryTitle;

    modalDownload.href = wallpaper.src;
    modalDownload.download = wallpaper.file;

    updateModalFavoriteButton();

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modalClose.focus();
  }

  function closeModal() {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    selectedWallpaper = null;
  }

  function updateModalFavoriteButton() {
    if (!selectedWallpaper) return;

    const active = isFavorite(selectedWallpaper.id);
    modalFavorite.textContent = active ? "♥ Saved" : "♡ Favorite";
  }

  modalFavorite.addEventListener("click", () => {
    if (!selectedWallpaper) return;

    toggleFavorite(selectedWallpaper.id);
    updateModalFavoriteButton();
    updateFavoritesGrid();

    // Refresh the currently displayed collection.
    if (currentCollection) {
      const items = allWallpapers.filter(
        wallpaper => wallpaper.category === currentCollection
      );
      renderWallpapers(collectionGrid, items);
    } else if (currentSearch) {
      performSearch();
    }

    // Refresh homepage cards if a featured wallpaper was changed.
    renderWallpapers(frontGrid, frontWallpapers);
    renderWallpapers(natureGrid, natureWallpapers);
  });

  modalClose.addEventListener("click", closeModal);

  modal.addEventListener("click", event => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeModal();
    }
  });

  // Mobile navigation
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
    });
  });

  // Footer year
  document.getElementById("currentYear").textContent =
    new Date().getFullYear();
});
