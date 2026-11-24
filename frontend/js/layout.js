// layout.js - navbar, footer, notifications drawer and ROLE-BASED ACCESS GUARDS (shared by all pages)

function getUser() {
  return JSON.parse(sessionStorage.getItem("user") || "null");
}

// ROLE GUARD 1: every page except login/signup must call this.
// No token = not logged in -> send to login page.
function requireLogin() {
  if (!sessionStorage.getItem("token")) location.href = "login.html";
}

// ROLE GUARD 2: admin-only pages call this.
// A normal user who types the admin URL is sent back to the events page.
function requireAdmin() {
  const user = getUser();
  if (!user || user.role !== "admin") location.href = "events.html";
}

function logout() {
  sessionStorage.clear();
  location.href = "login.html";
}

function escapeHtml(t) {
  return $("<div>").text(t || "").html();
}

function renderLayout() {
  const user = getUser();
  // ROLE GUARD 3: the Admin link is only drawn for admins (hidden for users)
  const isAdmin = user && user.role === "admin";

  const nav = `
  <header class="bg-indigo-800 text-white">
    <nav class="max-w-6xl mx-auto flex flex-wrap items-center gap-4 p-3" aria-label="Main navigation">
      <a href="events.html" class="font-bold text-xl">🏛️ Civic Event</a>
      <form id="globalSearch" class="flex-1 min-w-[160px]" role="search">
        <label for="searchBox" class="sr-only">Search events</label>
        <input id="searchBox" type="search" placeholder="Search events..." class="w-full rounded p-1 text-slate-900" />
      </form>
      <a href="events.html" class="hover:underline">Events</a>
      <a href="announcements.html" class="hover:underline">Announcements</a>
      <a href="promos.html" class="hover:underline">Promos</a>
      <button id="bellBtn" class="hover:underline" aria-label="Open notifications" aria-haspopup="dialog">
        🔔 <span id="unreadCount" class="bg-red-600 rounded-full px-2 text-xs">0</span>
      </button>
      ${isAdmin ? '<a href="admin.html" class="hover:underline">Admin</a>' : ""}
      <div class="relative">
        <button id="profileBtn" class="underline" aria-haspopup="true">${user ? escapeHtml(user.full_name) : ""} ▾</button>
        <div id="profileMenu" class="hidden absolute right-0 mt-1 bg-white text-slate-900 rounded shadow w-40 z-20">
          <a href="profile.html" class="block p-2 hover:bg-slate-100">Profile</a>
          <button id="logoutBtn" class="block w-full text-left p-2 hover:bg-slate-100">Logout</button>
        </div>
      </div>
    </nav>
  </header>

  <!-- Notifications drawer (slides in from the right) -->
  <aside id="drawer" role="dialog" aria-label="Notifications" aria-modal="true"
    class="hidden fixed top-0 right-0 h-full w-full sm:w-96 bg-white text-slate-900 shadow-2xl z-30 flex flex-col">
    <div class="flex items-center justify-between p-4 border-b">
      <h2 class="font-bold text-lg">Notifications</h2>
      <button id="drawerClose" class="text-2xl leading-none" aria-label="Close notifications">×</button>
    </div>
    <ul id="drawerList" class="flex-1 overflow-y-auto p-4 space-y-3"></ul>
    <a href="notifications.html" class="block text-center p-3 border-t text-indigo-700 underline">See all notifications</a>
  </aside>`;

  const footer = `
  <footer class="bg-slate-800 text-slate-200 text-center text-sm p-4 mt-8">
    © 2026 Civic Event · Built by Darlene Ayinkamiye
  </footer>`;

  $("#navbar").html(nav);
  $("#footer").html(footer);

  $("#profileBtn").on("click", () => $("#profileMenu").toggleClass("hidden"));
  $("#logoutBtn").on("click", logout);
  $("#globalSearch").on("submit", function (e) {
    e.preventDefault();
    location.href = "events.html?q=" + encodeURIComponent($("#searchBox").val());
  });

  // ----- Notifications: unread count + drawer -----
  apiRequest("GET", "/notifications").done(function (res) {
    const list = res.data;
    $("#unreadCount").text(list.filter((n) => !n.read).length);

    $("#drawerList").html(
      list.length
        ? list.slice(0, 8).map(function (n) {
            const m = n.metadata || {};
            const link = m.event_id
              ? `<a href="event.html?id=${m.event_id}" class="text-indigo-700 underline text-sm">View event</a>` : "";
            return `<li class="border rounded p-3">
              <p class="font-semibold">${escapeHtml(n.title)}</p>
              <p class="text-sm">${escapeHtml(n.message)}</p>
              ${link}</li>`;
          }).join("")
        : '<li class="text-slate-600">No notifications.</li>'
    );
  });

  function openDrawer() { $("#drawer").removeClass("hidden"); $("#drawerClose").focus(); }
  function closeDrawer() { $("#drawer").addClass("hidden"); $("#bellBtn").focus(); }

  $("#bellBtn").on("click", openDrawer);
  $("#drawerClose").on("click", closeDrawer);
  $(document).on("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });
}