document.addEventListener("DOMContentLoaded", async function () {
  const app = new Realm.App({ id: "application-1-oftmq" });
  const credentials = Realm.Credentials.anonymous();
  try {
    const user = await app.logIn(credentials);
    const mongodb = app.currentUser.mongoClient("mongodb-atlas");
    const collection = mongodb.db("rating-data").collection("data");
    document
      .getElementById("picture-form")
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
        document.getElementById("picture-form").reset();
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
// Add this event listener for the delete button click event
document.querySelector(".forms").addEventListener("click", function (e) {
  if (e.target.closest(".reset")) {
    removePreview();
  }
});
const searchButton = document.querySelector('.searchb');
const searchInput = document.querySelector('.search');

searchButton.addEventListener('click', () => {
  searchInput.focus();
});

