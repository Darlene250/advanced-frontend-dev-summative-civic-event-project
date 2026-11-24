// layout.js - navbar, footer and ROLE-BASED ACCESS GUARDS (shared by all pages)

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
      <a href="notifications.html" class="hover:underline" aria-label="Notifications">
        🔔 <span id="unreadCount" class="bg-red-600 rounded-full px-2 text-xs">0</span>
      </a>
      ${isAdmin ? '<a href="admin.html" class="hover:underline">Admin</a>' : ""}
      <div class="relative">
        <button id="profileBtn" class="underline" aria-haspopup="true">${user ? user.full_name : ""} ▾</button>
        <div id="profileMenu" class="hidden absolute right-0 mt-1 bg-white text-slate-900 rounded shadow w-40">
          <a href="profile.html" class="block p-2 hover:bg-slate-100">Profile</a>
          <button id="logoutBtn" class="block w-full text-left p-2 hover:bg-slate-100">Logout</button>
        </div>
      </div>
    </nav>
  </header>`;

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

  // Unread notification count for the bell
  apiRequest("GET", "/notifications").done(function (res) {
    const unread = res.data.filter((n) => !n.read).length;
    $("#unreadCount").text(unread);
  });
}