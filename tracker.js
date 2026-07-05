async function trackFlights() {
  const token = process.env.TELEGRAM_TO_TOKEN;
  const chatId = process.env.TELEGRAM_TO_CHATID;
  const apiUrl = "https://airtrackbot.com";

  try {
    // Adding browser-emulating headers to bypass automated detection firewalls
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://airtrackbot.com/'
      }
    });

    const responseText = await response.text();

    // Check if the response received is HTML instead of JSON
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      throw new Error("The API blocked the GitHub runner with an HTML security challenge page. Use a browser or API proxy.");
    }

    if (!response.ok) throw new Error(`API HTTP error! Status: ${response.status}`);
    
    const data = JSON.parse(responseText);
    const flights = data.flights || data.results || data.data || [];
    
    if (flights.length === 0) {
      console.log("No flights found in the API response.");
      return;
    }

    // Sort flights by price in ascending order
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
