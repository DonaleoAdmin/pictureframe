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
  console.log("loading folders...");
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

// uri: /updateFolder, method: POST, data: { id: id, value: someValue }
function executeApi(uri, method, data, isLoadFdr = false) {
  fetch(uri, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : "",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      if (isLoadFdr) loadFolders(data.id);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function reload(id) {
  window.location.href = "/";
}
