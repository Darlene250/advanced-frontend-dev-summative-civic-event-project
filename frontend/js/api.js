// api.js - one function that talks to the backend.
// It adds the token to every request (Authorization: Bearer ...)
function apiRequest(method, path, data, isFormData) {
  const token = sessionStorage.getItem("token");

  return $.ajax({
    url: BASE_URL + "/api" + path,
    method: method,
    data: isFormData ? data : (data ? JSON.stringify(data) : undefined),
    contentType: isFormData ? false : "application/json",
    processData: !isFormData,
    headers: token ? { Authorization: "Bearer " + token } : {},
  }).fail(function (xhr) {
    // 401 = not logged in or token expired -> back to login
    if (xhr.status === 401 && !location.pathname.includes("login")) {
      sessionStorage.clear();
      location.href = "login.html";
    }

    // 403 = logged in but not allowed (for example a normal user calling an admin action)
    if (xhr.status === 403) {
      alert("You do not have permission to do this.");
    }
  });
}