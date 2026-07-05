async function trackFlights() {
  const token = process.env.TELEGRAM_TO_TOKEN;
  const chatId = process.env.TELEGRAM_TO_CHATID;
  const apiUrl = "https://airtrackbot.com";

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`API HTTP error! Status: ${response.status}`);
    
    const data = await response.json();
    const flights = data.flights || data.results || data.data || [];
    
    if (flights.length === 0) {
      console.log("No flights found in the API response.");
      return;
    }

    flights.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    const cheapestFlights = flights.slice(0, 2);

    let message = `✈️ *Cheapest Flights Found (DEL -> PQC)*\n\n`;
    cheapestFlights.forEach((flight, index) => {
      const airline = flight.airline || flight.marketingCarrier || "Unknown Airline";
      const price = flight.price;
      const departs = flight.departureTime || flight.departs_at || "N/A";
      
      message += `*${index + 1}. ${airline}*\n`;
      message += `💰 Price: ₹${price}\n`;
      message += `🕒 Departure: ${departs}\n\n`;
    });

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
      console.log("Cheapest flights sent to Telegram successfully!");
    } else {
      console.error("Failed to send message to Telegram.");
    }

  } catch (error) {
    console.error("Error running tracker:", error.message);
  }
}

trackFlights();
