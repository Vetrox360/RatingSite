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
        const pictureUrl = document.getElementById("picture-url").value;
        const pictureRating = document.getElementById("picture-rating").value;
        const pictureDescription = document.getElementById(
          "picture-description"
        ).value;

        const pictureData = {
          personName: personName,
          pictureUrl: pictureUrl,
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
          };
        } else {
          await collection.insertOne(pictureData);
          refreshPictureFeed();
        }

        document.getElementById("picture-form").reset();
      });

    async function refreshPictureFeed() {
      const pictures = await collection.find({});
      const pictureFeed = document.querySelector("#picture-feed tbody");
      pictureFeed.innerHTML = "";

      pictures.forEach((picture) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td><img src="${
            picture.pictureFile || picture.pictureUrl
          }" alt="Picture"></td>
          <td>${picture.personName}</td>
          <td>${picture.pictureRating}</td>
          <td>${picture.pictureDescription}</td>
        `;
        pictureFeed.appendChild(row);
      });
    }

    refreshPictureFeed();
  } catch (error) {
    console.error("Error:", error);
  }
});

document.getElementById("search-input").addEventListener("input", function () {
  var searchValue = this.value.toLowerCase();
  var rows = document.querySelectorAll("#picture-feed tbody tr");
  rows.forEach(function (row) {
    var personName = row.cells[1].textContent.toLowerCase();
    if (personName.includes(searchValue)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const passwordModal = document.getElementById("password-modal");
  const passwordInput = document.getElementById("password-input");
  const submitPasswordButton = document.getElementById("submit-password");

  const predefinedPassword = "roksia123";

  passwordModal.style.display = "block";

  submitPasswordButton.addEventListener("click", function () {
    const enteredPassword = passwordInput.value;
    if (enteredPassword === predefinedPassword) {
      passwordModal.style.display = "none";
    } else {
      alert("Incorrect password. Please try again.");
      passwordInput.value = "";
    }
  });
});
