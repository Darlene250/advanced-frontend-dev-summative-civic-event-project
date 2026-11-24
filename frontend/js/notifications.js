// notifications.js - list notifications; admin can delete

requireLogin();
renderLayout();

const user = getUser();
const isAdmin = user.role === "admin";

function esc(t) { return $("<div>").text(t || "").html(); }

// Link to the related resource using the notification metadata
function linkFor(n) {
  const m = n.metadata || {};
  if (m.event_id) return `<a href="event.html?id=${m.event_id}" class="text-indigo-700 underline text-sm">View event</a>`;
  if (m.promo_id) return `<a href="promos.html" class="text-indigo-700 underline text-sm">View promo</a>`;
  if (m.announcement_id) return `<a href="announcements.html" class="text-indigo-700 underline text-sm">View announcement</a>`;
  return "";
}

function load() {
  $("#list").html('<li class="bg-white rounded-xl shadow p-4 animate-pulse h-20"></li>'.repeat(3));

  apiRequest("GET", "/notifications")
    .done(function (res) {
      if (!res.data.length) return $("#list").html('<li class="text-slate-600">No notifications.</li>');

      $("#list").html(res.data.map(function (n) {
        // ROLE GUARD: delete button only drawn for admins
        const del = isAdmin
          ? `<button data-id="${n.id}" class="delBtn text-red-700 underline text-sm ml-3">Delete</button>` : "";
        return `<li class="bg-white rounded-xl shadow p-4 ${n.read ? "" : "border-l-4 border-indigo-600"}">
          <h2 class="font-semibold">${esc(n.title)}</h2>
          <p class="text-sm">${esc(n.message)}</p>
          <p class="text-xs text-slate-500 my-1">${new Date(n.created_at).toLocaleString()}</p>
          ${linkFor(n)} ${del}
        </li>`;
      }).join(""));
    })
    .fail(function () {
      $("#list").empty();
      $("#message").text("Could not load notifications.");
    });
}

// Admin: delete notification
$("#list").on("click", ".delBtn", function () {
  if (!confirm("Delete this notification?")) return;
  apiRequest("DELETE", "/notifications/" + $(this).data("id")).done(load);
});

load();