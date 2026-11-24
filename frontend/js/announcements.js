// announcements.js - list announcements with audio; admin can create and delete

requireLogin();
renderLayout();

const user = getUser();
const isAdmin = user.role === "admin";

function esc(t) { return $("<div>").text(t || "").html(); }

// ROLE GUARD: the create form is only shown to admins
if (isAdmin) $("#adminBox").removeClass("hidden");

function load() {
  // Skeleton loader while waiting
  $("#list").html('<div class="bg-white rounded-xl shadow p-4 animate-pulse h-24"></div>'.repeat(2));

  apiRequest("GET", "/announcements")
    .done(function (res) {
      // Normal users see only published announcements
      const items = res.data.filter((a) => isAdmin || a.published !== false);
      if (!items.length) {
        return $("#list").html('<p class="text-slate-600">No announcements yet.</p>');
      }
      $("#list").html(items.map(function (a) {
        // ROLE GUARD: delete button only drawn for admins
        const del = isAdmin
          ? `<button data-id="${a.id}" class="delBtn text-red-700 underline text-sm">Delete</button>` : "";
        return `<article class="bg-white rounded-xl shadow p-4">
          <h2 class="font-bold text-lg">${esc(a.title)}</h2>
          <p class="text-xs text-slate-500 mb-2">${new Date(a.created_at).toLocaleString()}
            ${a.published === false ? "(not published)" : ""}</p>
          <audio controls preload="none" class="w-full" src="${a.audio_url}">
            Your browser does not support audio.
          </audio>
          <div class="mt-2">${del}</div>
        </article>`;
      }).join(""));
    })
    .fail(function () {
      $("#list").empty();
      $("#message").text("Could not load announcements.");
    });
}

// Admin: create announcement (multipart upload, field name "audio")
$("#annForm").on("submit", function (e) {
  e.preventDefault();
  $("#formMsg").text("");
  const file = $("#audio")[0].files[0];
  if (file && file.size > 5 * 1024 * 1024) return $("#formMsg").text("Audio is too big (max 5 MB).");

  const fd = new FormData();
  fd.append("title", $("#title").val());
  fd.append("audio", file);

  $("#saveBtn").prop("disabled", true).text("Uploading...");
  apiRequest("POST", "/announcements", fd, true)
    .done(function () {
      $("#annForm")[0].reset();
      load();
    })
    .fail(function (xhr) {
      $("#formMsg").text(xhr.responseJSON ? xhr.responseJSON.message : "Upload failed");
    })
    .always(function () {
      $("#saveBtn").prop("disabled", false).text("Publish");
    });
});

// Admin: delete announcement
$("#list").on("click", ".delBtn", function () {
  if (!confirm("Delete this announcement?")) return;
  apiRequest("DELETE", "/announcements/" + $(this).data("id")).done(load);
});

load();