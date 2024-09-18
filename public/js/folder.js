$(document).ready(function () {
  // Close fullscreen when user presses "Escape"
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeFullscreenMode();
    }
  });
});

function loadFolder(name) {
  updateFolderSetting(name, "/folder");
}

function openAlbumMenu(id) {
  document.querySelectorAll(".album-container").forEach((container) => {
    if (container.id === id) {
      //   container.classList.add("selected");
      const name = container.getAttribute("data-name");
      const show =
        container.getAttribute("data-show") === "true" ? true : false;
      toggleAlbumSelect(container);
      updateFolderSetting(name, "");
      toggleShowIcon(show);
    } else {
      container.classList.remove("selected");
    }
  });
}

function toggleShowIcon(show) {
  // Update eye icon
  const iconEye = document.getElementById("iconEye");

  // Toggle between 'bi-eye' and 'bi-eye-slash'
  if (iconEye.classList.contains("bi-eye-slash") && !show) {
    iconEye.classList.remove("bi-eye-slash");
    iconEye.classList.add("bi-eye");
  } else {
    iconEye.classList.remove("bi-eye");
    iconEye.classList.add("bi-eye-slash");
  }
}

function updateFolderSetting(value, route) {
  executeApi(
    "/update",
    "POST",
    { key: "selectedFolder", value: value },
    false,
    route
  );
}

function updateSubDirSetting(id) {
  executeApi("/updateFolder", "POST", {
    id: id,
    value: inputValue,
    isLocal: isLocal,
  });
}

function getSelectedAlbums() {
  const selectedAlbums = [];
  document
    .querySelectorAll(".album-container.selected")
    .forEach((container) => {
      const id = container.id;
      const name = container.getAttribute("data-name");
      const show = container.getAttribute("data-show");
      selectedAlbums.push({ id, name, show });
    });
  return selectedAlbums;
}

function deleteAlbum() {
  // Implement for future if handle for all selected Albums
  const selectedAlbums = getSelectedAlbums();

  if (selectedAlbums.length > 0) {
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

    // Show the modal
    const confirmDeleteModal = new bootstrap.Modal(
      document.getElementById("confirmDeleteModal")
    );
    confirmDeleteModal.show();

    // Attach event listener to the confirm delete button
    confirmDeleteBtn.onclick = function () {
      fetch("/delete-folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ folders: selectedAlbums }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            console.log("Deleted Folders:", selectedAlbums);
            confirmDeleteModal.hide(); // Hide the modal after deletion
            window.location.reload();
          } else {
            console.log("Failed to delete folders");
          }
        });
    };
  } else {
    console.log("No albums selected for deletion");
  }
}

function updateShowAlbum() {
  const albumNames = getSelectedAlbums();

  albumNames.forEach((folder) => {
    const newShow = folder.show === "true" ? false : true;
    toggleShowIcon(newShow);

    const container = document.getElementById(folder.id);
    container.setAttribute("data-show", newShow.toString());

    // Update settings
    executeApi("/updateFolder", "POST", {
      id: folder.id,
      value: newShow,
    });
  });
}

function toggleAlbumSelect(container) {
  container.classList.toggle("selected");
  updateFooter("album-container");
}

function toggleSelect(container) {
  container.classList.toggle("selected");
  allSelected = false;
  updateFooter("image-container");
}

function toggleSelectAll() {
  allSelected = !allSelected; // Toggle the selection state
  // Upldate lable here if needed

  document.querySelectorAll(".image-container").forEach((container) => {
    if (allSelected) {
      container.classList.add("selected");
    } else {
      container.classList.remove("selected");
    }
  });
  updateFooter("image-container");
}

function updateFooter(containerName) {
  const selectedContainers = document.querySelectorAll(
    `.${containerName}.selected`
  );
  const footer = document.getElementById("popupFooter");

  if (selectedContainers.length > 0) {
    footer.style.display = "flex";
  } else {
    footer.style.display = "none";
  }
}

function getSelectedImages() {
  let images = [];
  document
    .querySelectorAll(".image-container.selected")
    .forEach((container) => {
      const img = container.querySelector("img");
      images.push(img);
    });
  return images;
}

function deleteSelected() {
  const selectedContainers = document.querySelectorAll(
    ".image-container.selected"
  );
  const selectedImages = [];

  if (selectedContainers.length > 0) {
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

    // Show the modal
    const confirmDeleteModal = new bootstrap.Modal(
      document.getElementById("confirmDeleteModal")
    );
    confirmDeleteModal.show();

    // Attach event listener to the confirm delete button
    confirmDeleteBtn.onclick = function () {
      selectedContainers.forEach((container) => {
        const img = container.querySelector("img");
        const folder = img.getAttribute("data-folder");
        const imageName = img.getAttribute("data-image");
        selectedImages.push(`${folder}/${imageName}`);
        container.remove(); // Remove the image from the DOM
      });

      // Handle deletion on the server side via an AJAX request
      if (selectedImages.length > 0) {
        fetch("/delete-images", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ images: selectedImages }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              console.log("Deleted Images:", selectedImages);
              updateFooter("image-container"); // Update footer visibility
              confirmDeleteModal.hide(); // Hide the modal after deletion
            } else {
              console.log("Failed to delete images");
            }
          });
      }
    };
  } else {
    console.log("No images selected for deletion");
  }
}

function viewSelected() {
  const mainNavbar = document.getElementById("mainNavbar");
  const folderContainer = document.getElementById("folderContainer");
  const fullscreenContainer = document.getElementById("fullscreenContainer");
  const fullscreenImage = document.getElementById("fullscreenImage");
  const prevArrow = document.getElementById("prevArrow");
  const nextArrow = document.getElementById("nextArrow");
  const closeFullscreen = document.getElementById("closeFullscreen");

  let selectedImages = getSelectedImages();
  currentIndex = 0;

  //   selectedContainers.forEach((container) => {
  //     const img = container.querySelector("img");
  //     selectedImages.push(img);
  //     // selectedImages.push(img.getAttribute("data-path"));

  //     // if (img.requestFullscreen) {
  //     //   img.requestFullscreen();
  //     // } else if (img.mozRequestFullScreen) {
  //     //   // Firefox
  //     //   img.mozRequestFullScreen();
  //     // } else if (img.webkitRequestFullscreen) {
  //     //   // Chrome, Safari, Opera
  //     //   img.webkitRequestFullscreen();
  //     // } else if (img.msRequestFullscreen) {
  //     //   // IE/Edge
  //     //   img.msRequestFullscreen();
  //     // }
  //   });

  mainNavbar.style.display = "none";
  folderContainer.style.display = "none";
  fullscreenImage.src = selectedImages[currentIndex].src;
  fullscreenContainer.classList.add("show");

  if (selectedImages.length > 1) {
    nextArrow.style.display = "block";
    prevArrow.style.display = "block";

    prevArrow.removeEventListener("click", showPrevImage);
    prevArrow.addEventListener("click", showPrevImage);

    nextArrow.removeEventListener("click", showNextImage);
    nextArrow.addEventListener("click", showNextImage);
  } else {
    nextArrow.style.display = "none";
    prevArrow.style.display = "none";
  }
  closeFullscreen.addEventListener("click", closeFullscreenMode);
}

// Function to close fullscreen
function closeFullscreenMode() {
  const mainNavbar = document.getElementById("mainNavbar");
  const folderContainer = document.getElementById("folderContainer");
  const fullscreenContainer = document.getElementById("fullscreenContainer");

  currentIndex = 0;
  fullscreenContainer.classList.remove("show");
  mainNavbar.style.display = "block";
  folderContainer.style.display = "block";

  // Check if the document is in fullscreen mode before attempting to exit
  if (
    document.fullscreenElement ||
    document.mozFullScreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  ) {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      // Firefox
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      // Chrome, Safari, Opera
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      // IE/Edge
      document.msExitFullscreen();
    }
  }
}

// Show previous image
function showPrevImage() {
  const images = getSelectedImages();
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  fullscreenImage.src = images[currentIndex].src;
}

// Show next image
function showNextImage() {
  const images = getSelectedImages();
  currentIndex = (currentIndex + 1) % images.length;
  fullscreenImage.src = images[currentIndex].src;
}

async function downloadSelected() {
  //   console.log("Sorry, it will be comming soon...");
  const selectedImages = getSelectedImages();
  for (let img of selectedImages) {
    const folder = img.getAttribute("data-folder");
    const imageName = img.getAttribute("data-image");
    await downloadImage(folder, imageName);
  }
}

// Function to download an image
async function downloadImage(folder, imageName) {
  const url = `/download-image/${folder}/${imageName}`;
  const a = document.createElement("a");
  a.href = url;
  a.download = imageName; // Trigger download
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function shareSelected() {
  const selectedImages = getSelectedImages();
  if (navigator.share) {
    navigator
      .share({
        title: "Shared Images",
        text: "Check out these images:",
        url: selectedImages.join(", "), // Share a specific link or the images as individual URLs
      })
      .then(() => console.log("Sharing was successful."))
      .catch((error) => console.log("Error sharing:", error));
  } else {
    alert(
      "Web Share API is not supported in your browser. Please try to download the image(s) first."
    );
  }
}

// Function to make the folder name editable
function editFolderName() {
  const display = document.getElementById("folderNameDisplay");
  const input = document.getElementById("folderNameInput");
  const icon = document.getElementById("editIcon");

  // Hide the display and show the input field
  display.style.display = "none";
  input.style.display = "inline-block";
  icon.style.display = "none";
  input.focus(); // Automatically focus on the input
}

// Function to save the folder name (when focus is lost or Enter key is pressed)
function saveFolderName() {
  const display = document.getElementById("folderNameDisplay");
  const input = document.getElementById("folderNameInput");
  const icon = document.getElementById("editIcon");

  const oldFolderName = display.textContent;
  const newFolderName = input.value;
  display.textContent = newFolderName;

  // Hide the input and show the display
  input.style.display = "none";
  display.style.display = "inline-block";
  icon.style.display = "inline-block";

  // Don't do anything if the album name hasn't changed
  if (oldFolderName === newFolderName) return;

  // Send the new folder name to the server
  fetch("/update-folder-name", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ oldFolderName, newFolderName }),
  }).then((response) => {
    if (response.ok) {
      console.log("Folder name updated successfully");
    } else {
      console.error("Error updating folder name");
    }
  });
}

// Function to handle keypress (Enter key)
function handleKeyPress(event) {
  if (event.key === "Enter") {
    saveFolderName();
  }
}
