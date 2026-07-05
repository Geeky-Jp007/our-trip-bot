async function trackFlights() {
  const token = process.env.TELEGRAM_TO_TOKEN;
  const chatId = process.env.TELEGRAM_TO_CHATID;

  // Complete, absolute URL path explicitly wrapped to prevent string truncation
  const apiUrl = "https://airtrackbot.com/api/search_flights?origin=95673498&originIATA=DEL&originName=Delhi+Indira+Gandhi+International&destination=128667199&destinationIATA=PQC&destinationName=Phu+Quoc&departureDate=2026-10-01&flightClass=economy&adults=1&country=IN&currency=INR&source=tracker";

  const headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "X-Requested-With": "XMLHttpRequest"
  };

  try {
    console.log("🛰️ Fetching live flight data from endpoint...");
    const response = await fetch(apiUrl, { headers });
    const responseText = await response.text();

    if (responseText.trim().startsWith('<')) {
      console.error("❌ Error: The API returned an HTML page instead of JSON data.");
      console.log("\n--- Preview of Response ---");
      console.log(responseText.substring(0, 300));
      return;
    }

    const data = JSON.parse(responseText);
    const flights = data.flights || data.results || data.data || [];
    
    if (flights.length === 0) {
      console.log("⚠️ No flights found in the API response payload.");
      return;
    }

    // Sort flights by price in ascending order
    flights.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

    // Extract the top 2 cheapest flights
    const cheapestFlights = flights.slice(0, 2);

    // Format the Markdown message structure for Telegram
    let message = `✈️ *Cheapest Flights Found (DEL -> PQC)*\n\n`;
    cheapestFlights.forEach((flight, index) => {
      const airline = flight.airline || flight.marketingCarrier || "Unknown Airline";
      const price = flight.price;
      const departs = flight.departureTime || flight.departs_at || "N/A";
      
      message += `*${index + 1}. ${airline}*\n`;
      message += `💰 Price: ₹${price}\n`;
      message += `🕒 Departure: ${departs}\n\n`;
    });

    console.log("🚀 Forwarding the top 2 flights to Telegram...");
    const telegramUrl = `https://telegram.org{token}/sendMessage`;
    const teleResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    if (teleResponse.ok) {
      console.log("✅ Success! Cheapest flights posted to your Telegram group.");
    } else {
      console.error(`❌ Failed to send message. Telegram Status: ${teleResponse.status}`);
    }

  } catch (error) {
    console.error("❌ Script Execution Failed:", error.message);
  }
}

trackFlights();
