const axios = require("axios");
const { Client } = require("@googlemaps/google-maps-services-js");

// 🔑 Replace with your real Google Maps API key
const API_KEY = "AIzaSyCiRUnEyFC8qBI4P6XnNihuyLEzXx_pi4o";
const client = new Client({});

// ✅ Sync with backend
const API_BASE =
    process.env.NODE_ENV === "development"
        ? "http://localhost:5000"
        : "https://robot-backend-ywcd.onrender.com";   // <-- same backend as Checkout.jsx

async function fetchOrder() {
    try {
        const res = await axios.get(`${API_BASE}/orders/latest`);
        const order = res.data;

        console.clear();
        console.log("========================================");
        console.log("🤖 DELIVERY ROBOT ORDER RECEIPT");
        console.log("========================================");
        console.log(`🆔 Order ID: ${order.id}`);
        console.log(`👤 Customer: ${order.customer}`);
        console.log(`🏠 Address: ${order.address}, ${order.city}, ${order.zip}`);
        console.log("----------------------------------------");

        console.log("🛒 Items:");
        order.items.forEach((item, i) => {
            console.log(`   ${i + 1}. ${item.name} - $${item.price}`);
        });

        console.log("----------------------------------------");
        console.log(`💵 Total: $${order.total}`);
        console.log(`📦 Status: ${order.status}`);
        console.log("----------------------------------------");

        // ✅ Geocode
        const fullAddress = `${order.address}, ${order.city}, ${order.zip}`;
        console.log(`📍 Locating: ${fullAddress} ...`);

        const geoRes = await client.geocode({
            params: { address: fullAddress, key: API_KEY },
            timeout: 10000
        });

        if (geoRes.data.status === "OK") {
            const { lat, lng } = geoRes.data.results[0].geometry.location;
            console.log(`✅ Coordinates: (${lat}, ${lng})`);
        } else {
            console.warn("⚠️ Geocoding failed:", geoRes.data.status);
        }

        console.log("========================================\n");

    } catch (err) {
        if (err.response && err.response.status === 404) {
            console.log("🤖 Waiting for new orders...");
        } else {
            console.error("❌ Error fetching order:", err.message);
        }
    }
}

// Poll every 5s
setInterval(fetchOrder, 5000);
fetchOrder();
