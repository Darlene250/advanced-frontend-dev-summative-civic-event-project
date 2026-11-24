// profile.js - edit own name/email (role and status cannot be edited) + my registrations

requireLogin();
renderLayout();

function esc(t) { return $("<div>").text(t || "").html(); }

// Load the profile into the form
apiRequest("GET", "/users/profile/me").done(function (res) {
  $("#full_name").val(res.data.full_name);
  $("#email").val(res.data.email);
  $("#role").val(res.data.role);
});

// Save changes: we send ONLY full_name and email (never role or is_active)
$("#profileForm").on("submit", function (e) {
  e.preventDefault();
  $("#msg").text("");
  $("#saveBtn").prop("disabled", true).text("Saving...");

  apiRequest("PATCH", "/users/profile/me", {
    full_name: $("#full_name").val(),
    email: $("#email").val(),
  })
    .done(function (res) {
      // Keep the saved user in sync so the navbar shows the new name
      const u = getUser();
      u.full_name = res.data.full_name;
      u.email = res.data.email;
      sessionStorage.setItem("user", JSON.stringify(u));
      $("#msg").removeClass("text-red-700").addClass("text-green-700").text("Profile updated!");
      renderLayout();
    })
    .fail(function (xhr) {
      // 409 = "Email is already in use"
      $("#msg").removeClass("text-green-700").addClass("text-red-700")
        .text(xhr.responseJSON ? xhr.responseJSON.message : "Could not update profile");
    })
    .always(function () {
      $("#saveBtn").prop("disabled", false).text("Save changes");
    });
});

// My registrations
apiRequest("GET", "/event-registrations/my-registrations").done(function (res) {
  const mine = res.data.filter((r) => r.status === "registered");
  $("#myRegs").html(
    mine.length
      ? mine.map((r) => `<li class="bg-white rounded-xl shadow p-3">
          <a href="event.html?id=${r.event_id}" class="font-semibold text-indigo-700 underline">${esc(r.title)}</a>
          <p class="text-sm text-slate-600">📍 ${esc(r.location)} · ${new Date(r.starts_at).toLocaleString()}</p>
        </li>`).join("")
      : '<li class="text-slate-600">You have not registered for any event yet.</li>'
  );
});