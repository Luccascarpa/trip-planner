// Restaurant AI Auto-fill Utility
// Uses web search and AI parsing to automatically populate restaurant information

import { parseRestaurantInfoWithLLM } from './llmParser';

export interface RestaurantInfo {
  neighborhood?: string;
  cuisine?: string;
  priceRange?: string;
  description?: string;
  sampleMenuHighlights?: string;
  insiderTips?: string[];
  rating?: number;
}

/**
 * Main parsing function - tries LLM first, falls back to regex
 */
export async function parseRestaurantInfo(
  searchResults: string,
  restaurantName: string,
  useLLM: boolean = true
): Promise<RestaurantInfo> {
  // Try LLM parsing first if enabled
  if (useLLM) {
    try {
      const llmResult = await parseRestaurantInfoWithLLM(searchResults, restaurantName);
      console.log('✅ LLM parsing successful');
      return llmResult;
    } catch (error) {
      console.warn('⚠️ LLM parsing failed, falling back to regex:', error);
      // Fall through to regex parsing
    }
  }

  // Fallback to regex-based parsing
  console.log('Using regex-based parsing (less accurate)');
  return parseRestaurantInfoRegex(searchResults, restaurantName);
}

/**
 * Legacy regex-based parsing (kept as fallback)
 * This function processes search snippets and extracts relevant details
 */
export function parseRestaurantInfoRegex(searchResults: string, restaurantName: string): RestaurantInfo {
  const info: RestaurantInfo = {};
  const lowerResults = searchResults.toLowerCase();

  // Extract neighborhood/location
  const neighborhoods = extractNeighborhood(searchResults, restaurantName);
  if (neighborhoods) info.neighborhood = neighborhoods;

  // Extract cuisine type
  const cuisine = extractCuisine(searchResults);
  if (cuisine) info.cuisine = cuisine;

  // Extract price range
  const price = extractPriceRange(searchResults);
  if (price) info.priceRange = price;

  // Extract description (first paragraph or summary)
  const description = extractDescription(searchResults, restaurantName);
  if (description) info.description = description;

  // Extract menu highlights
  const menuItems = extractMenuHighlights(searchResults);
  if (menuItems) info.sampleMenuHighlights = menuItems;

  // Extract insider tips
  const tips = extractInsiderTips(searchResults);
  if (tips.length > 0) info.insiderTips = tips;

  // Extract rating
  const rating = extractRating(searchResults);
  if (rating) info.rating = rating;

  return info;
}

function extractNeighborhood(text: string, restaurantName: string): string | null {
  // Common patterns for neighborhoods
  const patterns = [
    /(?:located in|in|at|neighborhood:|area:)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*(?:New York|NYC|Manhattan|Brooklyn)/gi,
    /\b(Tribeca|Soho|Chelsea|Village|Midtown|Upper East Side|Upper West Side|Lower East Side|Williamsburg|Downtown|Chinatown|Little Italy|Nolita|Brooklyn|Queens|Harlem|Financial District|Hell's Kitchen|Murray Hill|Gramercy|Flatiron|Battery Park|Greenwich Village|East Village|West Village)\b/gi,
  ];

  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    if (matches.length > 0) {
      const match = matches[0][1]?.trim();
      if (match && match.length < 50) {
        return match;
      }
    }
  }

  return null;
}

function extractCuisine(text: string): string | null {
  const cuisineKeywords = [
    'American', 'Italian', 'French', 'Japanese', 'Chinese', 'Mexican', 'Thai',
    'Indian', 'Korean', 'Vietnamese', 'Mediterranean', 'Spanish', 'Greek',
    'Comfort Food', 'Seafood', 'Steakhouse', 'BBQ', 'Pizza', 'Sushi',
    'Brunch', 'Breakfast', 'Contemporary', 'Fusion', 'Farm-to-Table'
  ];

  const patterns = [
    /(?:cuisine|food|restaurant|serving|serves|specializes in|known for|offers)(?:\s+\w+){0,3}\s+(American|Italian|French|Japanese|Chinese|Mexican|Thai|Indian|Korean|Vietnamese|Mediterranean|Spanish|Greek|Comfort Food|Seafood|Steakhouse|BBQ|Pizza|Sushi|Contemporary|Fusion)/gi,
  ];

  // Try pattern matching first
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const found = cuisineKeywords.find(c =>
        match[0].toLowerCase().includes(c.toLowerCase())
      );
      if (found) return found;
    }
  }

  // Fallback: search for cuisine keywords
  for (const cuisine of cuisineKeywords) {
    const regex = new RegExp(`\\b${cuisine}\\b`, 'gi');
    if (regex.test(text)) {
      return cuisine;
    }
  }

  return null;
}

function extractPriceRange(text: string): string | null {
  // Look for $ symbols
  const dollarMatch = text.match(/(\$+)/g);
  if (dollarMatch) {
    const longest = dollarMatch.reduce((a, b) => a.length > b.length ? a : b);
    return longest;
  }

  // Look for price descriptors
  if (/\b(expensive|upscale|fine dining|high-end)\b/gi.test(text)) {
    return '$$$-$$$$';
  }
  if (/\b(moderate|mid-range|reasonably priced)\b/gi.test(text)) {
    return '$$-$$$';
  }
  if (/\b(affordable|cheap|budget|inexpensive)\b/gi.test(text)) {
    return '$-$$';
  }

  return null;
}

function extractDescription(text: string, restaurantName: string): string | null {
  // Try to extract a good description paragraph
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 30);

  // Find sentences mentioning the restaurant
  const relevantSentences = sentences.filter(s =>
    s.toLowerCase().includes(restaurantName.toLowerCase()) ||
    s.toLowerCase().includes('restaurant') ||
    s.toLowerCase().includes('known for') ||
    s.toLowerCase().includes('serves') ||
    s.toLowerCase().includes('offers')
  );

  if (relevantSentences.length > 0) {
    // Take first 2-3 sentences
    const description = relevantSentences.slice(0, 2).join('. ').trim();
    if (description.length > 50 && description.length < 500) {
      return description + '.';
    }
  }

  // Fallback: take first substantial paragraph
  if (sentences.length > 0) {
    const desc = sentences[0].trim();
    if (desc.length > 50 && desc.length < 500) {
      return desc + '.';
    }
  }

  return null;
}

function extractMenuHighlights(text: string): string | null {
  const items: string[] = [];

  // Look for menu item patterns
  const patterns = [
    /(?:famous for|known for|signature|try the|must-try|popular|specialty)(?:\s+\w+){0,5}\s+([A-Z][a-zA-Z\s&'-]+?)(?:\.|,|—|$)/g,
    /•\s*([A-Z][a-zA-Z\s&'-]+?)\s*(?:—|–|-)\s*([^•\n]+)/g,
  ];

  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches.slice(0, 5)) {
      if (match[1] && match[1].length < 80) {
        const item = match[2]
          ? `${match[1]} — ${match[2].trim()}`
          : match[1];
        items.push(`• ${item.trim()}`);
      }
    }
  }

  return items.length > 0 ? items.join('\n') : null;
}

function extractInsiderTips(text: string): string[] {
  const tips: string[] = [];

  // Look for tip patterns
  const tipPatterns = [
    /(?:tip|advice|recommendation|insider|pro tip|worth knowing):\s*([^.!?]+[.!?])/gi,
    /(?:avoid|best time|try to|make sure|don't miss)(?:\s+\w+){1,15}[.!?]/gi,
    /\b(?:weekday|weekend|lunch|dinner|brunch|reservation|wait time|line|queue)(?:\s+\w+){2,20}[.!?]/gi,
  ];

  for (const pattern of tipPatterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches.slice(0, 5)) {
      const tip = (match[1] || match[0]).trim();
      if (tip.length > 20 && tip.length < 200 && !tips.some(t => t.toLowerCase() === tip.toLowerCase())) {
        tips.push(tip);
      }
    }
  }

  return tips.slice(0, 5); // Max 5 tips
}

function extractRating(text: string): number | null {
  // Look for star ratings
  const patterns = [
    /(\d+(?:\.\d+)?)\s*(?:out of|\/|stars?)/gi,
    /rated?\s*(\d+(?:\.\d+)?)/gi,
    /(\d+(?:\.\d+)?)\s*stars?/gi,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const ratingMatch = match[0].match(/(\d+(?:\.\d+)?)/);
      if (ratingMatch) {
        const rating = parseFloat(ratingMatch[1]);
        if (rating >= 1 && rating <= 5) {
          return Math.round(rating * 10) / 10; // Round to 1 decimal
        }
      }
    }
  }

  return null;
}

/**
 * Creates a search query optimized for finding restaurant information
 */
export function createRestaurantSearchQuery(restaurantName: string, address?: string): string {
  let query = `${restaurantName} restaurant`;

  if (address) {
    // Extract city/neighborhood from address
    const cityMatch = address.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s*(?:NY|New York)/i);
    if (cityMatch) {
      query += ` ${cityMatch[1]}`;
    }
  }

  query += ' review menu cuisine price insider tips';
  return query;
}
