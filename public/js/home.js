$(document).ready(function () {
  toggleInput();
});

function updateInput(event) {
  const id = event.target.id;
  let inputValue = null;
  if (event.target.type === "checkbox") inputValue = event.target.checked;
  else inputValue = event.target.value;

  // Send the input value to the server
  fetch("/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key: id, value: inputValue }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
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

  if (!selectElement) return;

  if (selectElement.value === "usb") {
    usbContainer.style.display = "";
    localContainer.style.display = "none";
  } else {
    localContainer.style.display = "";
    usbContainer.style.display = "none";
  }
}
