document.addEventListener("DOMContentLoaded", async function () {
  const app = new Realm.App({ id: "application-1-oftmq" });
  const credentials = Realm.Credentials.anonymous();
  try {
    const user = await app.logIn(credentials);
    const mongodb = app.currentUser.mongoClient("mongodb-atlas");
    const collection = mongodb.db("rating-data").collection("data");
    document
      .querySelector(".picture-form")
      .addEventListener("submit", async function (e) {
        e.preventDefault();
        const personName = document.getElementById("person-name").value;
        const pictureFile = document.getElementById("picture-file").files[0];
        const pictureRating = document.getElementById("picture-rating").value;
        const pictureDescription = document.getElementById(
          "picture-description"
        ).value;
        const pictureData = {
          personName: personName,
          pictureRating: pictureRating,
          pictureDescription: pictureDescription,
        };
        if (pictureFile) {
          const reader = new FileReader();
          reader.readAsDataURL(pictureFile);
          reader.onload = async function () {
            pictureData.pictureFile = reader.result;
            await collection.insertOne(pictureData);
            refreshPictureFeed();
            removePreview();
          };
        } else {
          await collection.insertOne(pictureData);
          refreshPictureFeed();
        }
        document.querySelector(".picture-form").reset();
      });
    async function refreshPictureFeed() {
      const pictures = await collection.find(
        {},
        {
          projection: {
            _id: 1,
            personName: 1,
            pictureRating: 1,
            pictureDescription: 1,
            pictureFile: 1,
            pictureUrl: 1,
          },
        }
      );
      const pictureFeed = document.querySelector("#picture-feed");
      pictureFeed.innerHTML = "";
      pictures.forEach((picture) => {
        const pictureDiv = document.createElement("div");
        pictureDiv.classList.add("picture-item");
        pictureDiv.setAttribute(
          "data-src",
          picture.pictureFile || picture.pictureUrl
        );
        pictureDiv.innerHTML = `
  <div class="placeholder-image"></div>
  <div class="rating">${picture.pictureRating}</div>
  <div class="content">
    <div class="details">
      <h3>${picture.personName}</h3>
      <p class="description">${picture.pictureDescription}</p>
    </div>
  </div>
  <button class="delete-button" data-id="${picture._id}">
    <img src="./trash.svg" alt="delete" id="delete-img" />
  </button>
`;
        pictureFeed.appendChild(pictureDiv);
      });
      const lazyLoadImages = document.querySelectorAll(".picture-item");
      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pictureDiv = entry.target;
            const imageSrc = pictureDiv.getAttribute("data-src");
            const placeholderImage =
              pictureDiv.querySelector(".placeholder-image");
            const lowResImage = new Image();
            lowResImage.src = `${imageSrc}?quality=10`; // Adjust the quality parameter as needed
            lowResImage.onload = () => {
              placeholderImage.style.backgroundImage = `url(${lowResImage.src})`;
            };
            const highResImage = new Image();
            highResImage.src = imageSrc;
            highResImage.onload = () => {
              pictureDiv.style.backgroundImage = `url(${highResImage.src})`;
              placeholderImage.style.display = "none";
            };
            highResImage.onerror = () => {
              placeholderImage.style.backgroundImage =
                "url(path/to/fallback-image.jpg)";
            };
            observer.unobserve(pictureDiv);
          }
        });
      });
      lazyLoadImages.forEach((image) => {
        observer.observe(image);
      });
      pictureFeed.addEventListener("click", async function (e) {
        if (e.target.closest(".delete-button")) {
          const deleteButton = e.target.closest(".delete-button");
          const pictureId = deleteButton.getAttribute("data-id");
          await collection.deleteOne({
            _id: new Realm.BSON.ObjectId(pictureId),
          });
          refreshPictureFeed();
        }
      });
    }
    refreshPictureFeed();
  } catch (error) {
    console.error("Error:", error);
  }
});
document.getElementById("search-input").addEventListener("input", function () {
  var searchValue = this.value.toLowerCase();
  var pictureItems = document.querySelectorAll("#picture-feed .picture-item");
  pictureItems.forEach(function (pictureItem) {
    var personName = pictureItem.querySelector("h3").textContent.toLowerCase();
    if (personName.includes(searchValue)) {
      pictureItem.style.display = "";
    } else {
      pictureItem.style.display = "none";
    }
  });
});
const themeToggle = document.getElementById("theme-toggle");
themeToggle.addEventListener("click", () => {
  const body = document.body;
  body.classList.toggle("light-mode");
});
const fileDropZone = document.querySelector(".file-drop-zone");
const fileInput = document.getElementById("picture-file");
const filePreview = document.querySelector(".file-preview");
const dropZoneText = document.getElementById("drop-zone-text");
fileDropZone.addEventListener("click", () => {
  fileInput.click();
});
fileDropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  fileDropZone.classList.add("dragover");
});
fileDropZone.addEventListener("dragleave", () => {
  fileDropZone.classList.remove("dragover");
});
fileDropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  fileDropZone.classList.remove("dragover");
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    fileInput.files = files;
    showPreview(files[0]);
  }
});
fileInput.addEventListener("change", () => {
  const files = fileInput.files;
  if (files.length > 0) {
    showPreview(files[0]);
  }
});
function showPreview(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const previewImage = document.createElement("img");
    previewImage.src = reader.result;
    filePreview.innerHTML = "";
    filePreview.appendChild(previewImage);
    dropZoneText.style.display = "none";
  };
  reader.readAsDataURL(file);
}
function removePreview() {
  filePreview.innerHTML = "";
  dropZoneText.style.display = "block";
  fileInput.value = "";
}
document.querySelector(".forms").addEventListener("click", function (e) {
  if (e.target.closest(".reset")) {
    removePreview();
  }
});

// Get the modal and close button elements
const modal = document.querySelector(".modal");
const closeButton = document.querySelector(".close");

// Get the image element in the .dock class
const dockImage = document.querySelector(".dock img");

// Open the modal when the image is clicked
dockImage.addEventListener("click", () => {
  modal.style.display = "block";
});

// Close the modal when the close button is clicked
closeButton.addEventListener("click", () => {
  modal.style.display = "none";
});

// Close the modal when clicking outside the modal content
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// Get all the file dropzones
const fileDropZones = document.querySelectorAll(".file-drop-zone");

// Attach event listeners to each file dropzone
fileDropZones.forEach((dropZone) => {
  dropZone.addEventListener("click", () => {
    fileInput.click();
  });

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      fileInput.files = files;
      showPreview(files[0]);
    }
  });
});

async function refreshPictureFeed() {
  const pictures = await collection.find(
    // ... (existing code)
  );
  const pictureFeed = document.querySelector("#picture-feed");
  pictureFeed.innerHTML = "";
  pictures.forEach((picture) => {
    const pictureDiv = document.createElement("div");
    pictureDiv.classList.add("picture-item", "new-item"); // Add the 'new-item' class initially
    pictureDiv.setAttribute(
      "data-src",
      picture.pictureFile || picture.pictureUrl
    );
    // ... (existing code to set pictureDiv content)
    pictureFeed.appendChild(pictureDiv);

    // Remove the 'new-item' class after a short delay to trigger animations
    setTimeout(() => {
      pictureDiv.classList.remove("new-item");
    }, 100); // Adjust the delay time as desired
  });

  // ... (existing code for lazy loading and delete button event listener)
}

// Function to check if the device is in mobile mode
function isMobileMode() {
  return window.matchMedia("(max-width: 767px)").matches;
}

// Check the device mode on page load
window.addEventListener("DOMContentLoaded", function () {
  const body = document.body;
  if (isMobileMode()) {
    body.classList.add("mobile-mode");
  } else {
    body.classList.remove("mobile-mode");
  }
});

// Listen for window resize event and update the device mode
window.addEventListener("resize", function () {
  const body = document.body;
  if (isMobileMode()) {
    body.classList.add("mobile-mode");
  } else {
    body.classList.remove("mobile-mode");
  }
});
