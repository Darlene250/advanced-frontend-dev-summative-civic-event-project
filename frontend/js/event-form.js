// event-form.js - admin creates or edits an event (with image upload)

requireLogin();
requireAdmin();   // ROLE GUARD: a normal user who opens this page is sent away
renderLayout();

const eventId = new URLSearchParams(location.search).get("id"); // ?id=... means EDIT mode

// Turn a date from the backend into the format datetime-local needs
function toLocalInput(iso) {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

// EDIT mode: load the event and fill the form
if (eventId) {
  $("#formTitle").text("Edit event");
  apiRequest("GET", "/events/" + eventId).done(function (res) {
    const e = res.data;
    $("#title").val(e.title);
    $("#description").val(e.description);
    $("#location").val(e.location);
    $("#starts_at").val(toLocalInput(e.starts_at));
    $("#ends_at").val(toLocalInput(e.ends_at));
    if (e.metadata && e.metadata.image_url) {
      $("#preview").attr("src", e.metadata.image_url).removeClass("hidden");
    }
  });
}

// Image preview before uploading
$("#image").on("change", function () {
  const file = this.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    $("#error").text("Image is too big (max 2 MB).");
    this.value = "";
    return;
  }
  $("#error").text("");
  $("#preview").attr("src", URL.createObjectURL(file)).removeClass("hidden");
});

$("#eventForm").on("submit", function (e) {
  e.preventDefault();
  $("#error").text("");

  // Files must be sent as FormData (multipart), not JSON
  const fd = new FormData();
  fd.append("title", $("#title").val());
  fd.append("description", $("#description").val());
  fd.append("location", $("#location").val());
  fd.append("starts_at", new Date($("#starts_at").val()).toISOString());
  fd.append("ends_at", new Date($("#ends_at").val()).toISOString());
  const file = $("#image")[0].files[0];
  if (file) fd.append("image", file);   // field name must be "image"

  $("#saveBtn").prop("disabled", true).text("Saving...");

  const request = eventId
    ? apiRequest("PUT", "/events/" + eventId, fd, true)
    : apiRequest("POST", "/events", fd, true);

  request
    .done(function () { location.href = "events.html"; })
    .fail(function (xhr) {
      const msg = xhr.responseJSON ? xhr.responseJSON.message : "Could not save the event";
      $("#error").text(msg);
      $("#saveBtn").prop("disabled", false).text("Save event");
    });
});