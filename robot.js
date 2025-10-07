const { io } = require("socket.io-client");
const axios = require("axios");
const { Client } = require("@googlemaps/google-maps-services-js");

const API_KEY = "AIzaSyCiRUnEyFC8qBI4P6XnNihuyLEzXx_pi4o";
const client = new Client({});
const API_BASE = "https://robot-backend-ywcd.onrender.com"; // your live backend

// ✅ Connect to Socket.IO
const socket = io(API_BASE, { transports: ["websocket"] });

socket.on("connect", () => {
    console.log("🤖 Connected to backend in real-time:", socket.id);
});

// ✅ Receive new order instantly
socket.on("new_order", async (order) => {
    console.log("🚨 NEW ORDER RECEIVED!");
    console.log("----------------------------------------");
    console.log(`🆔 Order ID: ${order.id}`);
    console.log(`👤 Customer: ${order.customer}`);
    console.log(`🏠 ${order.address}, ${order.city}, ${order.zip}`);
    console.log(`💵 Total: $${order.total}`);
    console.log("🛒 Items:");
    order.items.forEach((item, i) => console.log(`   ${i + 1}. ${item.name} - $${item.price}`));

    const fullAddress = `${order.address}, ${order.city}, ${order.zip}`;
    console.log(`📍 Locating: ${fullAddress}...`);

    try {
        const geoRes = await client.geocode({
            params: { address: fullAddress, key: API_KEY },
            timeout: 10000,
        });
        const { lat, lng } = geoRes.data.results[0].geometry.location;
        console.log(`✅ Coordinates: (${lat}, ${lng})`);
    } catch (err) {
        console.error("⚠️ Geocoding failed:", err.message);
    }

    console.log("----------------------------------------\n");
});
