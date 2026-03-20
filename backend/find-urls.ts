import querystring from 'querystring';

async function searchDuckDuckGo(brand: string) {
    const query = `site:schadeautos.nl/en/damaged/passenger-cars/ ${brand}`;
    const url = `https://html.duckduckgo.com/html/?q=${querystring.escape(query)}`;
    
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
    });
    
    if (!response.ok) return null;
    const html = await response.text();
    
    // DuckDuckGo puts result URLs inside href of .result__url
    const match = html.match(/href="([^"]+schadeautos\.nl\/en\/damaged\/passenger-cars\/[^"]+)"/);
    if (match) {
        // Duckduckgo returns redirect URLs like //duckduckgo.com/l/?uddg=actual_url
        const resultUrl = match[1];
        if (resultUrl.includes('uddg=')) {
            const decoded = decodeURIComponent(resultUrl.split('uddg=')[1].split('&')[0]);
            return decoded;
        }
        return resultUrl;
    }
    return null;
}

async function main() {
    const brands = ['Toyota', 'BMW', 'Mercedes-Benz', 'Jaguar', 'Honda'];
    for (const b of brands) {
        const url = await searchDuckDuckGo(b);
        console.log(`${b}: ${url || 'Not Found'}`);
        // Let's delay slightly to avoid DDG rate limits
        await new Promise(r => setTimeout(r, 1000));
    }
}

main().catch(console.error);
