// events.js - events list with search, filter and pagination

requireLogin();      // GUARD: must be logged in
renderLayout();

const user = getUser();
// ROLE GUARD: only admins see the "+ New event" button
if (user.role === "admin") $("#newEventBtn").removeClass("hidden");

const PER_PAGE = 6;
let allEvents = [];
let page = 1;

// Escape text so event titles cannot inject HTML
function esc(t) {
  return $("<div>").text(t || "").html();
}

// Skeleton loader: grey boxes shown while the data loads
function showSkeleton() {
  let html = "";
  for (let i = 0; i < 6; i++) {
    html += `<div class="bg-white rounded-xl shadow p-4 animate-pulse">
      <div class="h-32 bg-slate-200 rounded mb-3"></div>
      <div class="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
      <div class="h-3 bg-slate-200 rounded w-1/2"></div></div>`;
  }
  $("#eventList").html(html);
}

function loadEvents() {
  showSkeleton();
  apiRequest("GET", "/events")
    .done(function (res) {
      // Only published events are shown
      allEvents = res.data.filter((e) => e.published !== false);
      render();
    })
    .fail(function () {
      $("#eventList").empty();
      $("#message").text("Could not load events. Is the backend running?");
    });
}

function render() {
  const q = $("#q").val().toLowerCase();
  const when = $("#when").val();
  const now = new Date();

  const filtered = allEvents.filter(function (e) {
    const text = ((e.title || "") + " " + (e.location || "")).toLowerCase();
    if (q && !text.includes(q)) return false;
    if (when === "upcoming" && new Date(e.starts_at) < now) return false;
    if (when === "past" && new Date(e.ends_at) >= now) return false;
    return true;
  });

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  if (page > pages) page = pages;
  const slice = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (slice.length === 0) {
    $("#eventList").html('<p class="col-span-full text-slate-600">No events found.</p>');
  } else {
    $("#eventList").html(
      slice.map(function (e) {
        const img = e.metadata && e.metadata.image_url
          ? `<img src="${e.metadata.image_url}" alt="Image for ${esc(e.title)}" loading="lazy" class="h-40 w-full object-cover rounded-t-xl" />`
          : `<div class="h-40 bg-indigo-100 rounded-t-xl flex items-center justify-center text-4xl" aria-hidden="true">🏛️</div>`;
        return `<article class="bg-white rounded-xl shadow">
          ${img}
          <div class="p-4">
            <h2 class="font-bold text-lg">${esc(e.title)}</h2>
            <p class="text-sm text-slate-600">📍 ${esc(e.location)}</p>
            <p class="text-sm text-slate-600">🗓️ ${new Date(e.starts_at).toLocaleString()}</p>
            <a href="event.html?id=${e.id}" class="inline-block mt-3 text-indigo-700 underline">View details</a>
          </div></article>`;
      }).join("")
    );
  }

  $("#pageInfo").text("Page " + page + " of " + pages);
  $("#prevBtn").prop("disabled", page <= 1);
  $("#nextBtn").prop("disabled", page >= pages);
}

// Search box can be filled from the navbar search (?q=...)
$("#q").val(new URLSearchParams(location.search).get("q") || "");

$("#q, #when").on("input change", function () { page = 1; render(); });
$("#prevBtn").on("click", function () { page--; render(); });
$("#nextBtn").on("click", function () { page++; render(); });

loadEvents();