// promos.js - promo videos with captions; admin can create and delete

requireLogin();
renderLayout();

const user = getUser();
const isAdmin = user.role === "admin";

function esc(t) { return $("<div>").text(t || "").html(); }

// ROLE GUARD: the create form is only shown to admins
if (isAdmin) $("#adminBox").removeClass("hidden");

// Build a WebVTT captions file in memory from the caption text
function captionUrl(text) {
  const vtt = "WEBVTT\n\n00:00:00.000 --> 00:59:00.000\n" + text + "\n";
  return URL.createObjectURL(new Blob([vtt], { type: "text/vtt" }));
}

function load() {
  $("#list").html('<div class="bg-white rounded-xl shadow p-4 animate-pulse h-48"></div>'.repeat(2));

  apiRequest("GET", "/promos")
    .done(function (res) {
      const items = res.data.filter((p) => isAdmin || p.published !== false);
      if (!items.length) return $("#list").html('<p class="text-slate-600">No promos yet.</p>');

      $("#list").html(items.map(function (p) {
        // ROLE GUARD: delete button only drawn for admins
        const del = isAdmin
          ? `<button data-id="${p.id}" class="delBtn text-red-700 underline text-sm">Delete</button>` : "";
        return `<article class="bg-white rounded-xl shadow overflow-hidden">
          <video controls preload="none" class="w-full bg-black" src="${p.video_url}">
            <track kind="captions" srclang="en" label="English" default src="${captionUrl(p.caption_text)}" />
            Your browser does not support video.
          </video>
          <div class="p-4">
            <h2 class="font-bold text-lg">${esc(p.title)}</h2>
            <p class="text-sm text-slate-600">${esc(p.description)}</p>
            ${del}
          </div></article>`;
      }).join(""));
    })
    .fail(function () {
      $("#list").empty();
      $("#message").text("Could not load promos.");
    });
}

// Admin: create promo (multipart upload, field name "video")
$("#promoForm").on("submit", function (e) {
  e.preventDefault();
  $("#formMsg").text("");
  const file = $("#video")[0].files[0];
  if (file && file.size > 8 * 1024 * 1024) return $("#formMsg").text("Video is too big (max 8 MB).");

  const fd = new FormData();
  fd.append("title", $("#title").val());
  fd.append("description", $("#description").val());
  fd.append("caption_text", $("#caption_text").val());
  fd.append("video", file);

  $("#saveBtn").prop("disabled", true).text("Uploading...");
  apiRequest("POST", "/promos", fd, true)
    .done(function () { $("#promoForm")[0].reset(); load(); })
    .fail(function (xhr) {
      $("#formMsg").text(xhr.responseJSON ? xhr.responseJSON.message : "Upload failed");
    })
    .always(function () { $("#saveBtn").prop("disabled", false).text("Publish"); });
});

// Admin: delete promo
$("#list").on("click", ".delBtn", function () {
  if (!confirm("Delete this promo?")) return;
  apiRequest("DELETE", "/promos/" + $(this).data("id")).done(load);
});

load();