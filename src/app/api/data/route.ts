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
          const jsonData: JsonData = JSON.parse(Buffer.concat(data).toString()) 
          const filteredGames = jsonData.jam_games
            .filter(game => game.rating_count < 40)
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
    }).on('error', err => {
      reject(new Error(err.message)) 
    }) 
  }) 
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url') 

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is missing' }, { status: 400 }) 
    }

    const lowRatingGames = await fetchDataFromAPI(url) 
    return NextResponse.json(lowRatingGames) 
  } catch (error) {
    console.error('API Error:', error) 
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred' 
    return NextResponse.json({ error: errorMessage }, { status: 500 }) 
  }
}
