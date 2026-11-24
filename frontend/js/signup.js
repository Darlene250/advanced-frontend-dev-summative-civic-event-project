// signup.js - password strength meter + create account

// The backend needs: 8+ characters, uppercase, lowercase, number, special character
function checkStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[\W_]/.test(pw)) score++;
  return score; // 0 to 5
}

// Update the colored bar every time the user types
$("#password").on("input", function () {
  const score = checkStrength($(this).val());
  const levels = [
    { w: "0%",   color: "", text: "" },
    { w: "20%",  color: "bg-red-600",    text: "Very weak" },
    { w: "40%",  color: "bg-orange-500", text: "Weak" },
    { w: "60%",  color: "bg-yellow-500", text: "Fair" },
    { w: "80%",  color: "bg-lime-600",   text: "Good" },
    { w: "100%", color: "bg-green-700",  text: "Strong" },
  ];
  const lvl = levels[score];
  $("#strengthBar").attr("class", "h-2 rounded " + lvl.color).css("width", lvl.w);
  $("#strengthText").text(lvl.text);
});

$("#signupForm").on("submit", function (e) {
  e.preventDefault();
  $("#error").text("");

  const password = $("#password").val();
  if (checkStrength(password) < 5) {
    return $("#error").text("Password needs 8+ characters with uppercase, lowercase, a number and a special character.");
  }
  if (password !== $("#confirm_password").val()) {
    return $("#error").text("Passwords do not match.");
  }

  apiRequest("POST", "/auth/signup", {
    full_name: $("#full_name").val(),
    email: $("#email").val(),
    password: password,
  })
    .done(function () {
      location.href = "login.html";
    })
    .fail(function (xhr) {
      // example: 409 "Email already in use"
      $("#error").text(xhr.responseJSON ? xhr.responseJSON.message : "Server not reachable");
    });
});