// login.js - sends email + password to the backend and saves the token

$("#loginForm").on("submit", function (e) {
  e.preventDefault();               // stop the page from reloading
  $("#error").text("");

  apiRequest("POST", "/auth/login", {
    email: $("#email").val(),
    password: $("#password").val(),
  })
    .done(function (res) {
      // Save the token and the user {id, full_name, email, role}
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("user", JSON.stringify(res.data.user));
      location.href = "events.html";
    })
    .fail(function (xhr) {
      const msg = xhr.responseJSON ? xhr.responseJSON.message : "Server not reachable";
      $("#error").text(msg);        // example: "Invalid credentials"
    });
});