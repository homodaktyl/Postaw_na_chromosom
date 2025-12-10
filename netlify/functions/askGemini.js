exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        // Parsujemy zapytanie (z zabezpieczeniem, gdyby body było puste)
        const body = event.body ? JSON.parse(event.body) : {};
        const { prompt } = body;
        
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            return { statusCode: 500, body: JSON.stringify({ error: "Brak klucza API" }) };
        }

        // --- ZMIANA NA GEMINI 2.5 FLASH ---
        // Bierzemy dokładną nazwę z Twojej listy JSON
        const modelName = "gemini-2.5-flash"; 
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;
        // ----------------------------------

        if (!prompt) {
             return { statusCode: 400, body: JSON.stringify({ error: "Brak promptu" }) };
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                contents: [{ parts: [{ text: prompt }] }] 
            })
        });

        const data = await response.json();

        // Jeśli wyskoczy błąd (np. limit 429), zwracamy go do gry
        if (data.error) {
            console.error("Google Error:", data.error);
            return {
                statusCode: data.error.code || 400,
                body: JSON.stringify(data)
            };
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};