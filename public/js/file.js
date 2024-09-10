$(document).ready(function () {
  $("input[type=file]").on("change", function () {
    var num = $(this)[0].files.length;
    var val = num == 1 ? $(this).val() : num + " files selected";
    $(this).siblings("span").text(val);
  });
});

function uploadImages() {
  const form = document.getElementById("uploadForm");
  const formData = new FormData(form);

  // Manually append the directory field to the request header
  const directory = document.getElementById("directory").value;
  const uploadStatus = document.getElementById("uploadStatus");
  //   formData.append("directory", directory);

  fetch("/uploadFiles", {
    method: "POST",
    headers: {
      "X-Upload-Directory": directory,
    },
    body: formData,
  })
    .then((response) => response.text())
    .then((data) => {
      //   document.getElementById("uploadStatus").innerHTML = data;
      uploadStatus.className = "alert alert-info";
      uploadStatus.innerHTML = data;
    })
    .catch((error) => {
      console.error("Error:", error);
      uploadStatus.className = "alert alert-danger";
      uploadStatus.innerHTML = "Upload failed!";
    });
}
