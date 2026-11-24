// admin.js - admin dashboard: counts + enable/disable users

requireLogin();
requireAdmin();   // ROLE GUARD: normal users are sent back to the events page
renderLayout();

const me = getUser();

function esc(t) { return $("<div>").text(t || "").html(); }

function card(label, value) {
  return `<div class="bg-white rounded-xl shadow p-4">
    <p class="text-sm text-slate-600">${label}</p>
    <p class="text-3xl font-bold">${value}</p></div>`;
}

// ----- Counts -----
$("#stats").html('<div class="bg-white rounded-xl shadow p-4 animate-pulse h-20"></div>'.repeat(4));

apiRequest("GET", "/dashboard/admin")
  .done(function (res) {
    const s = res.data;
    $("#stats").html(
      card("Total users", s.users.total_users) +
      card("Active users", s.users.active_users) +
      card("Total events", s.events.total_events) +
      card("Upcoming events", s.events.upcoming_events) +
      card("Registrations", s.registrations.total_registrations) +
      card("Feedback", s.feedbacks.total_feedback) +
      card("Promos", s.promos.total_promos) +
      card("Announcements", s.announcements.total_announcements)
    );
  })
  .fail(function (xhr) {
    $("#stats").empty();
    $("#message").text(xhr.status === 403 ? "Access denied: admins only." : "Could not load the dashboard.");
  });

// ----- Users table -----
function loadUsers() {
  apiRequest("GET", "/users?page=1&limit=100").done(function (res) {
    $("#users").html(res.data.map(function (u) {
      const isMe = u.id === me.id;
      // Admins can enable/disable users, but NOT change roles and NOT disable themselves
      const btn = isMe
        ? '<span class="text-slate-500">(you)</span>'
        : u.is_active
          ? `<button data-id="${u.id}" data-act="disable" class="act bg-red-700 text-white rounded px-3 py-1">Disable</button>`
          : `<button data-id="${u.id}" data-act="enable" class="act bg-green-700 text-white rounded px-3 py-1">Enable</button>`;
      return `<tr class="border-t">
        <td class="p-3">${esc(u.full_name)}</td>
        <td class="p-3">${esc(u.email)}</td>
        <td class="p-3">${esc(u.role)}</td>
        <td class="p-3">${u.is_active ? "Active" : "Disabled"}</td>
        <td class="p-3">${btn}</td></tr>`;
    }).join(""));
  });
}

$("#users").on("click", ".act", function () {
  const btn = $(this);
  btn.prop("disabled", true);
  apiRequest("PATCH", "/users/" + btn.data("id") + "/" + btn.data("act"))
    .done(loadUsers)
    .fail(function () { btn.prop("disabled", false); $("#message").text("Action failed."); });
});

loadUsers();