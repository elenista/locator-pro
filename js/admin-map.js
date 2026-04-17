document.addEventListener("DOMContentLoaded", function () {
  const latInput = document.getElementById("lp_lat");
  const lngInput = document.getElementById("lp_lng");
  const mapContainer = document.getElementById("lp-admin-map");

  if (!mapContainer) return;

  // Default coordinates (Athens) if fields are empty
  let initialLat = latInput.value || 37.9838;
  let initialLng = lngInput.value || 23.7275;

  // Initialize the map
  const map = L.map("lp-admin-map").setView([initialLat, initialLng], 13);

  // Add OpenStreetMap tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // Force the map to recalculate its size after a small delay
  setTimeout(function () {
    map.invalidateSize();
  }, 100);

  // Add a draggable marker
  let marker = L.marker([initialLat, initialLng], {
    draggable: true,
  }).addTo(map);

  // Update inputs when marker is dragged
  marker.on("dragend", function (e) {
    const position = marker.getLatLng();
    latInput.value = position.lat.toFixed(6);
    lngInput.value = position.lng.toFixed(6);
  });

  // Update marker and inputs when map is clicked
  map.on("click", function (e) {
    const { lat, lng } = e.latlng;
    marker.setLatLng([lat, lng]);
    latInput.value = lat.toFixed(6);
    lngInput.value = lng.toFixed(6);
  });

  // Initialize the Geocoder
  const geocoder = L.Control.Geocoder.nominatim();
  const searchControl = L.Control.geocoder({
    query: "",
    placeholder: "Search for address...",
    defaultMarkGeocode: false, // Don't add a new marker, we will move ours
    geocoder: geocoder,
  }).addTo(map);

  // What happens when a location is selected from the search
  searchControl.on("markgeocode", function (e) {
    const latlng = e.geocode.center;

    // Move marker to the new position
    marker.setLatLng(latlng);

    // Center map to the new position
    map.setView(latlng, 16);

    // Update the hidden inputs
    latInput.value = latlng.lat.toFixed(6);
    lngInput.value = latlng.lng.toFixed(6);
  });
});
