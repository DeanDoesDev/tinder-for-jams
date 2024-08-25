"use client"

import { useEffect, useState } from "react"
import { useSpring, animated } from "@react-spring/web"
import { useDrag } from "@use-gesture/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Link2 } from "lucide-react"
import { useSearchParams } from 'next/navigation'  
import { Header } from "@/components/header"

type Game = {
  title: string
  cover: string
  url: string
  rating_count: number
  short_text: string | null
}

async function fetchLowRatingGames(jsonLink: string): Promise<Game[]> {
  try {
    const response = await fetch(`/api/data?json_link=${encodeURIComponent(jsonLink)}`)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data: Game[] = await response.json()
    return data.sort(() => Math.random() - 0.5)
  } catch (error) {
    console.error('Error fetching data:', error)
    return []
  }
}

async function fetchAllGames(jsonLink: string): Promise<Game[]> {
  try {
    const response = await fetch(`/api/all-games?json_link=${encodeURIComponent(jsonLink)}`)  
    if (!response.ok) {
      throw new Error(`Network response was not ok. Status: ${response.status}, ${response.statusText}`)  
    }
    const data: Game[] = await response.json()  
    return data  
  } catch (error) {
    console.error('Error fetching all games:', error)  
    return []  
  }
}

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0

  values.sort((a, b) => a - b)

  const mid = Math.floor(values.length / 2)

  return values.length % 2 === 0
    ? (values[mid - 1] + values[mid]) / 2
    : values[mid]
}

export default function Home() {
  const searchParams = useSearchParams()  

  const title = searchParams.get('title')  
  const json_link = searchParams.get('json_link') || ''  
  console.log('JSON Link:', json_link)  

  const gamejam_link = searchParams.get('gamejam_link')  

  const [lowRatingGames, setLowRatingGames] = useState<Game[]>([])
  const [allGames, setAllGames] = useState<Game[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [medianRating, setMedianRating] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  const [springProps, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rotate: 0,
    opacity: 1,
  }))

  useEffect(() => {
    async function getGames() {
      try {
        const lowGames = await fetchLowRatingGames(json_link)
        setLowRatingGames(lowGames)

        const allGames = await fetchAllGames(json_link)
        setAllGames(allGames)

        const ratingCounts = allGames.map(game => game.rating_count)
        console.log('Rating counts:', ratingCounts)

        const median = calculateMedian(ratingCounts)
        setMedianRating(median)
        console.log('Calculated median:', median)

        setLoading(false)
      } catch (error) {
        console.error('Error fetching games:', error)
        setLoading(false)
      }
    }

    getGames()
  }, [])

  useEffect(() => {
    console.log(medianRating)
  }, [medianRating])  

  const handleSwipe = (direction: string) => {
    if (direction === "left" || direction === "right") {
      api.start({
        x: direction === "left" ? -300 : 300,
        rotate: direction === "left" ? -15 : 15,
        opacity: 0,
        onRest: () => {
          if (direction === "right") {
            const isMobile = window.matchMedia("(max-width: 768px)").matches
            if (isMobile) {
              window.location.href = lowRatingGames[currentIndex].url
            } else {
              window.open(lowRatingGames[currentIndex].url, "_blank")
            }
          }
          setCurrentIndex((prevIndex) => (prevIndex + 1) % lowRatingGames.length)
          api.start({ x: 0, y: 0, rotate: 0, opacity: 1 })
        },
      })
    }
  }

  const bind = useDrag(
    ({ down, movement: [mx, my], direction: [xDir], velocity }) => {
      const trigger = velocity[0] > 0.2
      const dir = xDir < 0 ? "left" : "right"
      if (!down && trigger) {
        handleSwipe(dir)
      } else {
        api.start({
          x: down ? mx : 0,
          y: down ? my : 0,
          rotate: down ? (mx / window.innerWidth) * 15 : 0,
          opacity: down ? 0.8 : 1
        })
      }
    }
  )

  if (loading) {
    return (
      <div className="fixed inset-0 bg-zinc-800 flex items-center justify-center z-50">
        <div className="text-white text-center">
          <div className="spinner-border animate-spin inline-block w-16 h-16 border-4 rounded-full border-t-transparent border-red-500" role="status">
          </div>
          <p className="mt-4">Loading games...</p>
        </div>
      </div>
    )
  }

  if (currentIndex >= lowRatingGames.length) {
    return <p className="text-white">No more games to swipe!</p>
  }

  const currentGame = lowRatingGames[currentIndex]

  return (
    <div className="min-h-screen bg-zinc-800 flex flex-col items-center justify-center">
      <div className="fixed top-0 w-full z-50 flex items-center justify-center mt-3 xs:mt-1 sm:mt-3 md:mt-3 lg:mt-4 xl:mt-6">
        <Header />
      </div>
      {gamejam_link && (
        <Link href={gamejam_link} target="_blank" rel="noopener noreferrer">
          <Button className="bg-red-500 p-3 rounded-full mb-2 mt-2 transition-transform transform hover:scale-110 hover:bg-red-500 flex items-center font-bold text-red-200 text-md">
            Link to the jam <Link2 className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      )}
      {!gamejam_link && (
        <p className="text-white text-md text-center">No Game Jam link available.</p>
      )}
      <h1 className="text-white font-bold text-5xl text-center px-4 mb-1">
        {title || "No Title"}
      </h1>  
      <h1 className="text-white text-md text-center md:px-[670px] px-2 mb-5">
        The current game jam median is at <strong className="text-red-200 bg-red-500 px-2 py-[3px] mx-1 rounded-lg">{medianRating} ratings</strong> per game, help these devs avoid the ranking punishement that comes with being below the median!
      </h1>
      <div className="relative">
        <animated.div
          {...bind()}
          style={{
            ...springProps,
            touchAction: "none",
            backgroundColor: "#4a5568",
            padding: "16px",
            borderRadius: "8px",
            width: "320px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 1,
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          <img
            src={currentGame.cover}
            alt={currentGame.title}
            className="w-full h-58 object-cover rounded-md mb-4"
          />
          <div className=" rounded-lg mb-1">
            <h2 className="text-white text-2xl font-bold text-center p-2">{currentGame.title}</h2>
          </div>
          <p className="text-white text-center text-md mb-2">
            {currentGame.short_text ? currentGame.short_text : "No description available."}
          </p>
          <div className="bg-red-500  px-4 py-2 rounded-full mx-2 mt-3 mb-2">
            <p className="text-red-200 text-md font-bold text-center">Ratings: {currentGame.rating_count}</p>
          </div>
        </animated.div>
      </div>
      <div className="flex mt-5">
        <h1 className="text-white text-md text-center px-4 mb-1">
          <strong className="text-red-500">Left</strong> to swipe, <strong className="text-red-500">right</strong> to open the link to the game!
        </h1>
      </div>
      <p className="text-red-500 text-xs mb-5 text-center px-2">
        Disclaimer: any games with up to 10 reviews over the median may appear in your feed.
      </p>
    </div>
  )
}
