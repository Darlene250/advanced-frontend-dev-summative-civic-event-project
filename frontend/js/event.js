// event.js - event details, register/cancel, feedback, admin tools

requireLogin();
renderLayout();

const user = getUser();
const eventId = new URLSearchParams(location.search).get("id");
let isRegistered = false;
let myFeedbackId = null;   // set if this user already sent feedback

function esc(t) { return $("<div>").text(t || "").html(); }

// ---------- 1. Load the event ----------
apiRequest("GET", "/events/" + eventId)
  .done(function (res) {
    const e = res.data;
    const img = e.metadata && e.metadata.image_url
      ? `<img src="${e.metadata.image_url}" alt="Image for ${esc(e.title)}" loading="lazy" class="w-full h-64 object-cover" />`
      : "";
    $("#eventBox").html(`${img}
      <div class="p-5">
        <h1 class="text-2xl font-bold">${esc(e.title)}</h1>
        <p class="text-slate-600 mt-1">📍 ${esc(e.location)}</p>
        <p class="text-slate-600">🗓️ ${new Date(e.starts_at).toLocaleString()} → ${new Date(e.ends_at).toLocaleString()}</p>
        <p class="mt-3">${esc(e.description)}</p>
      </div>`);
    document.title = e.title + " - Civic Event";
  })
  .fail(function (xhr) {
    $("#message").text(xhr.status === 404 ? "Event not found." : "Could not load the event.");
  });

// ---------- 2. Register / cancel ----------
function paintButton() {
  $("#regBtn")
    .text(isRegistered ? "Cancel registration" : "Register")
    .toggleClass("bg-indigo-700", !isRegistered)
    .toggleClass("bg-red-700", isRegistered);
}

apiRequest("GET", "/event-registrations/my-registrations").done(function (res) {
  const mine = res.data.find((r) => r.event_id === eventId && r.status === "registered");
  isRegistered = !!mine;
  paintButton();
});

$("#regBtn").on("click", function () {
  const wasRegistered = isRegistered;
  // OPTIMISTIC UI: change the button immediately, undo if the server says no
  isRegistered = !wasRegistered;
  paintButton();

  const path = wasRegistered ? "/event-registrations/cancel" : "/event-registrations/register";
  apiRequest("POST", path, { event_id: eventId })
    .done(function () {
      $("#message").removeClass("text-red-700").addClass("text-green-700")
        .text(wasRegistered ? "Registration cancelled." : "You are registered!");
    })
    .fail(function (xhr) {
      isRegistered = wasRegistered;   // undo
      paintButton();
      $("#message").removeClass("text-green-700").addClass("text-red-700")
        .text(xhr.responseJSON ? xhr.responseJSON.message : "Action failed");
    });
});

// ---------- 3. Feedback (one per user per event) ----------
apiRequest("GET", "/event-feedback/my-feedback").done(function (res) {
  const mine = res.data.find((f) => f.event_id === eventId);
  if (mine) {
    myFeedbackId = mine.id;
    $("#rating").val(mine.rating);
    $("#comment").val(mine.comment);
    $("#fbMsg").text("You already sent feedback. Sending again will update it.");
  }
});

$("#feedbackForm").on("submit", function (e) {
  e.preventDefault();
  const body = { rating: Number($("#rating").val()), comment: $("#comment").val() };

  // If feedback exists we UPDATE it (PUT), otherwise we CREATE it (POST)
  const req = myFeedbackId
    ? apiRequest("PUT", "/event-feedback/" + myFeedbackId, body)
    : apiRequest("POST", "/event-feedback", Object.assign({ event_id: eventId }, body));

  req
    .done(function (res) {
      myFeedbackId = res.data.id;
      $("#fbMsg").removeClass("text-red-700").addClass("text-green-700").text("Thank you for your feedback!");
    })
    .fail(function (xhr) {
      $("#fbMsg").removeClass("text-green-700").addClass("text-red-700")
        .text(xhr.responseJSON ? xhr.responseJSON.message : "Could not send feedback");
    });
});

// ---------- 4. ADMIN ONLY tools ----------
// ROLE GUARD: the admin box is shown and its data requested ONLY for admins.
// (The backend also blocks non-admins with 403, so this is double protection.)
if (user.role === "admin") {
  $("#adminBox").removeClass("hidden");
  $("#editBtn").attr("href", "event-form.html?id=" + eventId);

  apiRequest("GET", "/event-registrations/event/" + eventId + "/attendees").done(function (res) {
    $("#registrants").html(
      res.data.length
        ? res.data.map((r) => `<li>${esc(r.full_name)} (${esc(r.email)})</li>`).join("")
        : "<li>No registrations yet</li>"
    );
  });

  apiRequest("GET", "/event-feedback/event/" + eventId).done(function (res) {
    const list = res.data;
    if (list.length) {
      const avg = list.reduce((s, f) => s + f.rating, 0) / list.length;
      $("#avg").text("(average " + avg.toFixed(1) + " / 5)");
    }
    $("#feedbackList").html(
      list.length
        ? list.map((f) => `<li>${f.rating}/5 - ${esc(f.full_name)}: ${esc(f.comment)}</li>`).join("")
        : "<li>No feedback yet</li>"
    );
  });

  $("#deleteBtn").on("click", function () {
    if (!confirm("Delete this event?")) return;
    apiRequest("DELETE", "/events/" + eventId).done(function () {
      location.href = "events.html";
    });
  });
}