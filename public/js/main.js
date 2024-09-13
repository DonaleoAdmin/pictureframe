$(document).ready(function () {
  toggleInput();
});

function updateInput(event, loadFdr = false) {
  const id = event.target.id;
  let inputValue = null;
  if (event.target.type === "checkbox") inputValue = event.target.checked;
  else inputValue = event.target.value;

  // Send the input value to the server
  executeApi("/update", "POST", { key: id, value: inputValue }, loadFdr);
}

function updateFolder(event, id, isLocal) {
  const inputValue = event.target.checked;
  console.log("Calling updateFolder");
  executeApi("/updateFolder", "POST", {
    id: id,
    value: inputValue,
    isLocal: isLocal,
  });
}

function updateFileType(event, id) {
  const inputValue = event.target.checked;
  console.log("Calling updateFileType");
  executeApi("/updateFileType", "POST", { id: id, value: inputValue });
}

function loadFolders(id) {
  fetch("/syncFolders", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log("data", data);
      let subdirsContainer = "localSubdirsContainer";
      let subdirsName = "localSubdirs";
      let inputId = "localFolder_";
      if (data.mediaSource === "usb") {
        subdirsContainer = "usbSubdirsContainer";
        subdirsName = "usbSubdirs";
        inputId = "usbFolder_";
      }

      const container = document.getElementById(subdirsContainer);
      container.innerHTML = ""; // Clear existing content

      data[subdirsName].forEach((subdir) => {
        const subdirElement = document.createElement("div");
        subdirElement.className = "form-check form-switch";
        subdirElement.innerHTML = `
          <input class="form-check-input" type="checkbox" role="switch" id="${inputId}${
          subdir.id
        }" ${subdir.show ? "checked" : ""} oninput="updateFolder(event, ${
          subdir.id
        }, true)">
          <label class="form-check-label" for="${inputId}${
          subdir.id
        }"><i class="bi bi-folder-plus"></i> ${subdir.name}</label>
        `;
        container.appendChild(subdirElement);
      });

      if (data[subdirsName].length < 1) {
        const emptyElement = document.createElement("div");
        emptyElement.className = "alert alert-danger";
        emptyElement.innerHTML = "No Folders Found...";
        container.appendChild(emptyElement);
      }

      console.log("Successfully synced up folders");
      //data.mediaSource
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function loadFolder(name) {
  executeApi(
    "/update",
    "POST",
    { key: "selectedFolder", value: name },
    false,
    "/folder"
  );
}

function reloadImage(img) {
  if (!img.retryCount) {
    img.retryCount = 1;
  }

  // Maximum retries before giving up
  if (img.retryCount > 3) {
    console.error(`Failed to load image: ${img.src}`);
    return;
  }

  console.log(`Retrying to load image: ${img.src}, Attempt: ${img.retryCount}`);
  img.src = img.src + "?" + new Date().getTime(); // Force reload by appending a timestamp
  img.retryCount++;
}

function rebootDevice(event) {
  executeApi("/reboot", "POST", "");
}

function stopSlideshow(event) {
  executeApi("/stop", "POST", "");
}

function restartSlideshow(event) {
  executeApi("/restart", "POST", "");
}

function toggleInput() {
  const selectElement = document.getElementById("mediaSource");
  const usbContainer = document.getElementById("usbContainer");
  const localContainer = document.getElementById("localContainer");
  let subdirsContainer = "localSubdirsContainer";
  let subdir = "localSubdirs";

  if (!selectElement) return;

  if (selectElement.value === "usb") {
    usbContainer.style.display = "block";
    localContainer.style.display = "none";
    subdirsContainer = "usbSubdirsContainer";
    subdir = "usbSubdirs";
  } else {
    localContainer.style.display = "block";
    usbContainer.style.display = "none";
  }

  const container = document.getElementById(subdirsContainer);
  const formCheckElem = container.querySelector(".form-check");

  if (formCheckElem === null) {
    const emptyElement = document.createElement("div");
    emptyElement.className = "alert alert-danger";
    emptyElement.innerHTML = "No Folders Found...";
    container.appendChild(emptyElement);
  }
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

// uri: /updateFolder, method: POST, data: { id: id, value: someValue }
function executeApi(
  uri,
  method,
  body,
  isLoadFdr = false,
  redirectRoute = null
) {
  fetch(uri, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : "",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      if (isLoadFdr) loadFolders(data.id);
      if (redirectRoute) window.location.href = redirectRoute;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function reload(id) {
  window.location.href = "/";
}
