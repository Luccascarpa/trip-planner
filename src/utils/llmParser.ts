// LLM-powered parser for restaurant information
// Supports both OpenAI and Claude APIs for accurate data extraction

interface RestaurantInfo {
  neighborhood?: string;
  cuisine?: string;
  priceRange?: string;
  description?: string;
  sampleMenuHighlights?: string;
  insiderTips?: string[];
  rating?: number;
}

/**
 * Parse restaurant information using OpenAI GPT-4
 */
export async function parseWithOpenAI(
  searchResults: string,
  restaurantName: string,
  apiKey: string
): Promise<RestaurantInfo> {
  const prompt = createExtractionPrompt(searchResults, restaurantName);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // Fast and cheap
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that extracts structured restaurant information from web search results. Always respond with valid JSON only, no other text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' }, // Ensures JSON output
      temperature: 0.3, // Lower temperature for more consistent extraction
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No response from OpenAI');
  }

  return parseJSONResponse(content);
}

/**
 * Parse restaurant information using Claude API
 */
export async function parseWithClaude(
  searchResults: string,
  restaurantName: string,
  apiKey: string
): Promise<RestaurantInfo> {
  const prompt = createExtractionPrompt(searchResults, restaurantName);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307', // Fast and affordable
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt + '\n\nIMPORTANT: Respond with ONLY valid JSON, no other text or explanation.'
        }
      ],
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(`Claude API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.content[0]?.text;

  if (!content) {
    throw new Error('No response from Claude');
  }

  return parseJSONResponse(content);
}

/**
 * Create a detailed prompt for LLM to extract restaurant information
 */
function createExtractionPrompt(searchResults: string, restaurantName: string): string {
  return `Extract detailed information about "${restaurantName}" from these web search results:

${searchResults}

Extract and return a JSON object with these fields:

{
  "neighborhood": "The neighborhood or area (e.g., 'Tribeca', 'Soho', 'Lower East Side'). Leave empty if not found.",
  "cuisine": "Type of cuisine (e.g., 'American', 'Italian', 'Comfort Food', 'Japanese'). Leave empty if not found.",
  "priceRange": "Price range using $ symbols (e.g., '$$', '$$-$$$', '$$$$'). Leave empty if not found.",
  "description": "A 2-3 sentence description of the restaurant, what it's known for, and its atmosphere. Leave empty if not found.",
  "rating": "Star rating as a number from 1-5 (e.g., 4.5). Use null if not found.",
  "sampleMenuHighlights": "3-5 popular or signature menu items, formatted as bullet points like:\\n• Buttermilk Pancakes — beloved brunch item\\n• Fried Chicken & Waffles — hearty comfort dish\\n• Sour Cherry Pie — signature dessert\\n\\nLeave empty if not found.",
  "insiderTips": ["Array of 3-5 practical tips for visiting this restaurant, such as best times to go, what to order, how to avoid waits, etc. Each tip should be a complete sentence. Leave as empty array if not found."]
}

Guidelines:
- Extract ONLY information that is clearly stated in the search results
- Do NOT make up or invent information
- If information is not available, use empty string "" or null
- For menu items, include both the dish name and a brief description
- For tips, focus on practical advice from reviews and articles
- Be concise and accurate
- Return ONLY the JSON object, no other text

JSON response:`;
}

/**
 * Parse JSON response from LLM, handling various formats
 */
function parseJSONResponse(content: string): RestaurantInfo {
  try {
    // Remove markdown code blocks if present
    let jsonStr = content.trim();

    // Remove ```json or ``` markers
    jsonStr = jsonStr.replace(/^```json?\s*/i, '').replace(/```\s*$/,  '');

    // Parse JSON
    const parsed = JSON.parse(jsonStr);

    // Validate and clean up the data
    const result: RestaurantInfo = {};

    if (parsed.neighborhood && typeof parsed.neighborhood === 'string' && parsed.neighborhood.trim()) {
      result.neighborhood = parsed.neighborhood.trim();
    }

    if (parsed.cuisine && typeof parsed.cuisine === 'string' && parsed.cuisine.trim()) {
      result.cuisine = parsed.cuisine.trim();
    }

    if (parsed.priceRange && typeof parsed.priceRange === 'string' && parsed.priceRange.trim()) {
      result.priceRange = parsed.priceRange.trim();
    }

    if (parsed.description && typeof parsed.description === 'string' && parsed.description.trim()) {
      result.description = parsed.description.trim();
    }

    if (parsed.sampleMenuHighlights && typeof parsed.sampleMenuHighlights === 'string' && parsed.sampleMenuHighlights.trim()) {
      result.sampleMenuHighlights = parsed.sampleMenuHighlights.trim();
    }

    if (parsed.rating && typeof parsed.rating === 'number' && parsed.rating >= 1 && parsed.rating <= 5) {
      result.rating = Math.round(parsed.rating * 10) / 10; // Round to 1 decimal
    }

    if (Array.isArray(parsed.insiderTips) && parsed.insiderTips.length > 0) {
      result.insiderTips = parsed.insiderTips
        .filter((tip: any) => typeof tip === 'string' && tip.trim())
        .map((tip: string) => tip.trim());
    }

    return result;
  } catch (error) {
    console.error('Failed to parse LLM JSON response:', error);
    console.error('Raw content:', content);
    throw new Error('Failed to parse LLM response as JSON');
  }
}

/**
 * Main function to parse restaurant info using available LLM
 * Tries OpenAI first, then Claude, based on available API keys
 */
export async function parseRestaurantInfoWithLLM(
  searchResults: string,
  restaurantName: string
): Promise<RestaurantInfo> {
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const claudeKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!openaiKey && !claudeKey) {
    throw new Error('No LLM API key configured. Add VITE_OPENAI_API_KEY or VITE_ANTHROPIC_API_KEY to your .env file. See LLM_AUTOFILL_SETUP.md for details.');
  }

  // Try OpenAI first if available
  if (openaiKey) {
    try {
      return await parseWithOpenAI(searchResults, restaurantName, openaiKey);
    } catch (error) {
      console.error('OpenAI parsing failed:', error);
      // Fall through to try Claude if available
      if (!claudeKey) throw error;
    }
  }

  // Try Claude as fallback or primary
  if (claudeKey) {
    return await parseWithClaude(searchResults, restaurantName, claudeKey);
  }

  throw new Error('All LLM parsing methods failed');
}
