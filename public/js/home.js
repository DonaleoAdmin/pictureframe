$(document).ready(function () {
  toggleInput();
});

async function updateInput(event, loadFdr = false) {
  const id = event.target.id;
  let inputValue = null;
  if (event.target.type === "checkbox") inputValue = event.target.checked;
  else inputValue = event.target.value;

  // Send the input value to the server
  await fetch("/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key: id, value: inputValue }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      if (loadFdr) loadFolders(id);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function updateFolder(event, id, isLocal) {
  const inputValue = event.target.checked;

  // Send the input value to the server
  fetch("/updateFolder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: id, value: inputValue, isLocal: isLocal }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function loadFolders(id) {
  console.log("loading folders...");
  // reload();
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
  fetch("/reboot", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: "",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function stopSlideshow(event) {
  fetch("/stop", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: "",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function restartSlideshow(event) {
  fetch("/restart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: "",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
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
  container.innerHTML = ""; // Clear existing content
  const formCheckElem = container.querySelector(".form-check");

  if (!formCheckElem) {
    const emptyElement = document.createElement("div");
    emptyElement.className = "alert alert-danger";
    emptyElement.innerHTML = "No Folders Found...";
    container.appendChild(emptyElement);
  }
}

function reload(id) {
  window.location.href = "/";
}
