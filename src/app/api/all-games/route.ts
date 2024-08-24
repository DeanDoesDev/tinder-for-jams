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

async function fetchDataFromAPI(url: string): Promise<Game[]> {
  return new Promise((resolve, reject) => {
    let data: Buffer[] = [] 

    https.get(url, res => {
      res.on('data', chunk => {
        data.push(chunk) 
      }) 

      res.on('end', () => {
        try {
          const responseData = Buffer.concat(data).toString()
          
          const jsonData: JsonData = JSON.parse(responseData)
          
          if (!jsonData.jam_games || !Array.isArray(jsonData.jam_games)) {
            throw new Error('Invalid JSON structure')
          }
          
          const filteredGames = jsonData.jam_games
            .map(game => ({
              title: game.game.title,
              cover: game.game.cover,
              url: game.game.url,
              rating_count: game.rating_count,
              short_text: game.game.short_text,
            })) 

          resolve(filteredGames) 
        } catch (error) {
          console.error('Failed to parse JSON data:', error)
          reject(new Error('Failed to parse JSON data')) 
        }
      }) 
    }).on('error', err => {
      console.error('Request error:', err)
      reject(new Error(err.message)) 
    }) 
  }) 
}

export async function GET() {
  try {
    const url = 'https://itch.io/jam/379683/entries.json' 
    const lowRatingGames = await fetchDataFromAPI(url) 
    return NextResponse.json(lowRatingGames) 
  } catch (error) {
    console.error('API Error:', error) 
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred' 
    return NextResponse.json({ error: errorMessage }, { status: 500 }) 
  }
}
