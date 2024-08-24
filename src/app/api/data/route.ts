import { NextResponse } from 'next/server' 
import https from 'https' 

interface Game {
  title: string 
  cover: string 
  url: string 
  rating_count: number 
  short_text: string 
}

interface JsonData {
  jam_games: {
    game: {
      title: string 
      cover: string 
      url: string 
      short_text: string 
    } 
    rating_count: number 
  }[] 
}

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0 

  values.sort((a, b) => a - b) 

  const mid = Math.floor(values.length / 2) 

  return values.length % 2 === 0
    ? (values[mid - 1] + values[mid]) / 2
    : values[mid] 
}

function getFilterCount(ratingCount: number): number {
  if (ratingCount < 100) return 3;
  if (ratingCount < 1000) return 6;
  return 10;
}

async function fetchDataFromAPI(url: string): Promise<Game[]> {
  return new Promise((resolve, reject) => {
    let data: Buffer[] = [] 

    https.get(url, (res) => {
      res.on('data', (chunk) => {
        data.push(chunk) 
      }) 

      res.on('end', () => {
        try {
          const jsonData: JsonData = JSON.parse(Buffer.concat(data).toString()) 

          const ratingCounts = jsonData.jam_games.map(game => game.rating_count) 
          const medianRating = calculateMedian(ratingCounts) 

          const amount = getFilterCount(ratingCounts.length)

          const filteredGames = jsonData.jam_games
            .filter(game => game.rating_count < medianRating + amount)
            .map(game => ({
              title: game.game.title,
              cover: game.game.cover,
              url: game.game.url,
              rating_count: game.rating_count,
              short_text: game.game.short_text,
            })) 

          resolve(filteredGames) 
        } catch (error) {
          reject(new Error('Failed to parse JSON data')) 
        }
      }) 
    }).on('error', (err) => {
      reject(new Error(err.message)) 
    }) 
  }) 
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url).searchParams.get('json_link')
    if (!url) {
      return NextResponse.json({ error: 'JSON link not provided' }, { status: 400 })
    }
    const lowRatingGames = await fetchDataFromAPI(url)
    return NextResponse.json(lowRatingGames)
  } catch (error) {
    console.error('API Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
