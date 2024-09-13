function loadFolder(name) {
  executeApi(
    "/update",
    "POST",
    { key: "selectedFolder", value: name },
    false,
    "/folder"
  );
}

function toggleSelect(container) {
  container.classList.toggle("selected");
  updateFooter();
}

function updateFooter() {
  const selectedContainers = document.querySelectorAll(
    ".image-container.selected"
  );
  const footer = document.getElementById("popupFooter");

  if (selectedContainers.length > 0) {
    footer.style.display = "flex";
  } else {
    footer.style.display = "none";
  }
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
        selectedImages.push(img.getAttribute("data-path"));
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
              updateFooter(); // Update footer visibility
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
