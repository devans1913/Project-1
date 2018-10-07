
$(document).ready(function () {
	//hiding the <p> that i put the image url in to pull from later
	$("#url").hide();

	//The array of background images, one item is in there as a default so there will always be a background picture available
	// var backgroundImage = ["https://i.ytimg.com/vi/xVYLqWUbyH8/maxresdefault.jpg"];

	// initialize firebase
	var config = {
		apiKey: "AIzaSyDNHswzcLNEGN71DxCVdSxCs-fVupsLODc",
		authDomain: "kingpin-project-1.firebaseapp.com",
		databaseURL: "https://kingpin-project-1.firebaseio.com",
		projectId: "kingpin-project-1",
		storageBucket: "kingpin-project-1.appspot.com",
		messagingSenderId: "66745041672"
	};
	firebase.initializeApp(config);

	// Creating database variable
	var database = firebase.database();

	// //this chunk grabs the images within firebase and pushes them to the backgroundImage array 
	// var ref = database.ref();
	// ref.on('value', gotData, errData);

	// function gotData(data) {

	//     var backgroundImg = data.val();
	//     var keys = Object.keys(backgroundImg);

	//     for (var i = 0; i < keys.length; i++) {
	//         var k = keys[i];
	//         var image = backgroundImg[k].imageUrl;
	//         backgroundImage.push(image);
	//         var randomImage = backgroundImage[Math.floor(Math.random() * backgroundImage.length)];
	//         $("body").css("background-image", "url('" + randomImage + "')");
	//     }
	// }

	// function errData(err) {
	//     console.log('Error!');
	//     console.log(err);
	// }

	//this grabs the upload status bar and button 
	var uploader = document.getElementById('uploader');
	var fileButton = document.getElementById('fileButton');

	//when a new file is put into the add file button
	fileButton.addEventListener('change', function (e) {
		//get file
		var file = e.target.files[0];
		//create a store ref
		var storageRef = firebase.storage().ref('images/' + file.name);

		function getUrl() {
			storageRef.getDownloadURL().then(function (url) {
				$("#url").text(url);
			});
		}

		//upload file
		var task = storageRef.put(file);

		// update progress bar
		task.on('state_changed',
			function progress(snapshot) {
				var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				uploader.value = percentage;
			},
			function error(err) {
			},
			function complete() {

				getUrl();
			}
		);
	});

	// click function to capture the user input
	$("#submit").on("click", function (event) {
		event.preventDefault();
		var name = $("#name").val().trim();
		var email = $("#email").val().trim();
		var city = $("#city").val().trim();
		var state = $("#state :selected").text();
		var imageUrl = $("#url").text();
		var date = moment().format('MMMM Do YYYY');

		//creating the variable object that will push to the database
		var newContent = {
			name: name,
			email: email,
			city: city,
			state: state,
			imageUrl: imageUrl,
			date: date,
		};

		//pushes new input into the database
		if (name === "" && email === "" && city === "" && state === ""()) {
		}
		else {
			database.ref().push(newContent);
		}

		//clears the form out for the next entry
		$(".form-control").val("");
		$("#fileButton").val("");
	})

	//creates the snapshot when a new data entry is loaded into firebase
	database.ref().on("child_added", function (childSnapshot) {

		//creation of variables based on the snapshot of the database
		var name = childSnapshot.val().name;
		var email = childSnapshot.val().email;
		var city = childSnapshot.val().city;
		var state = childSnapshot.val().state;
		var imageUrl = childSnapshot.val().imageUrl;
		var date = childSnapshot.val().date;

		//creates our new card
		var newCard = $("<div class='card'>").append(
			$('<img class="card-img-top-fluid" type="button" class="btn" data-toggle="modal" data-target="#myModal" src="' + imageUrl + '" alt="Photo">'),
			$("<p id='card-name'>").text("Contributor : " + name),
			$("<p id='card-city'>").text("Photo Location : " + city + ", " + state),
			$("<p id='card-state'>").text("Contact me : " + email),
			$("<p id='card-state'>").text("Date Uploaded : " + date),

		)

		//prepends the new card to the newCard div
		$(".newCard").prepend(newCard)

		//alters the html of the modal to whatever is tied to the photo
		$(".card-img-top-fluid").on("click", function () {
			// console.log("HI")
			imageUrl = $(this).attr("src");
			console.log(imageUrl);
			$(".modalImage").attr("src", imageUrl);
			// $(".modal-body").html("<p>").append(
			// $("<p>").text("Contributor: " + name),
			// $("<p>").text("Location of photo: " + city + ", " + state),
			// $("<p>").text("Contact me @ " + email),
			// $("<p>").text("Description: " + description),
			// )
		})
		//randomizes our background image array to choose the next background image.
		// var randomImage = backgroundImage[Math.floor(Math.random() * backgroundImage.length)];
		// $("body").css("background-image", "url('" + randomImage + "')");
	});

	// api calls for geolocation and weather information
	navigator.geolocation.getCurrentPosition(function (position) {
		console.log(position)
		$.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + position.coords.latitude + "," + position.coords.longitude + "&sensor=false&key=AIzaSyBmULRulOLZfJ1ONuodqEQfe2RezgttsbY", function (data) {
			var location = data.results[5].formatted_address;
			console.log(data)
			var APIKey = "166a433c57516f51dfab1f7edaed8413";

			// Here we are building the URL we need to query the database
			var queryURL = "https://api.openweathermap.org/data/2.5/weather?" +
				"q=" + location + "&units=imperial&appid=" + APIKey;
			$("#gLoc").text("Location: " + location)
			// Here we run our AJAX call to the OpenWeatherMap API
			$.ajax({
				url: queryURL,
				method: "GET"
			})
				// function to grab the response and push that information to the weather card on the HTML
				.then(function (response) {
					$("#oTemp").text("Temperature: " + Math.floor(response.main.temp) + " Degrees");
					$("#oWeather").text("Weather: " + response.weather[0].main);
					console.log(response)
				})
		})
	});
})