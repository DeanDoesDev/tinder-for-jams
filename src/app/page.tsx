"use client"

import { useEffect, useState } from "react" 
import { useSpring, animated } from "@react-spring/web" 
import { useDrag } from "@use-gesture/react" 
import Link from "next/link" 
import { Button } from "@/components/ui/button" 
import { GitBranch, Link2 } from "lucide-react" 
import { useRouter } from 'next/navigation';
import { Header } from "@/components/header"

type GameJam = {
  title: string 
  cover: string 
  url: string 
  short_text: string | null 
  gamejam_link: string 
  json_link: string
} 

const gameJams: GameJam[] = [
  {
    title: "GMTK Game Jam 2024",
    cover: "/gmtk.JPG",
    url: "/jam",
    short_text: "One of the biggest game jams ever, filled with amazing talent hosted by Mark Brown.",
    gamejam_link: "https://itch.io/jam/gmtk-2024",
    json_link: "https://itch.io/jam/379683/entries.json",
  },
  {
    title: "DISCORD JAM #8",
    cover: "/discordjam.JPG",
    url: "/jam",
    short_text: "A 48 hour weekend game jam with prizes and giveaways leading up to the event!",
    gamejam_link: "https://itch.io/jam/discord-jam-8",
    json_link: "https://itch.io/jam/389033/entries.json",
  },
  {
    title: "Mini Jam 165: Paint",
    cover: "/minijam.JPG",
    url: "/jam",
    short_text: "Mini jam is a 72-hour-long game development jam that occurs every two weeks on Itch.io.",
    gamejam_link: "https://itch.io/jam/mini-jam-165-paint",
    json_link: "https://itch.io/jam/390246/entries.json",
  },
] 

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0) 
  const [springProps, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rotate: 0,
    opacity: 1,
  })) 

  const handleSwipe = (direction: string) => {
    if (direction === "left" || direction === "right") {
      api.start({
        x: direction === "left" ? -300 : 300,
        rotate: direction === "left" ? -15 : 15,
        opacity: 0,
        onRest: () => {
          if (direction === "right") {
            const gameData = gameJams[currentIndex];
            const urlWithParams = `${gameData.url}?title=${encodeURIComponent(gameData.title)}&json_link=${encodeURIComponent(gameData.json_link)}&gamejam_link=${encodeURIComponent(gameData.gamejam_link)}`;
            window.location.href = urlWithParams;
          }
          setCurrentIndex((prevIndex) => (prevIndex + 1) % gameJams.length) 
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
          opacity: down ? 0.8 : 1,
        }) 
      }
    }
  ) 

  const currentGameJam = gameJams[currentIndex] 

  return (
    <div className="min-h-screen bg-zinc-800 flex flex-col items-center justify-center">
      <div className="fixed top-0 w-full z-50 flex items-center justify-center mt-3 xs:mt-1 sm:mt-3 md:mt-3 lg:mt-4 xl:mt-6">
        <Header />
      </div>
      <Link href={"https://itch.io/jam/gmtk-2024/rate/2913403"} target="_blank" rel="noopener noreferrer">
          <div className="bg-red-500 p-3 rounded-full mb-3 transition-transform transform hover:scale-110 hover:bg-red-500">
            <h1 className="text-red-200 text-sm font-bold flex items-center">DeanDoesDev presents:</h1>
          </div>
        </Link>
        <h1 className="text-white font-bold text-5xl text-center px-4 mb-1">
          Adopt a Jam
        </h1>
        <h1 className="text-white text-md text-center px-4 mb-5">
          This tool shows you a feed of game jams games who weren&rsquo;t super fortunate with ratings!
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
              src={currentGameJam.cover}
              alt={currentGameJam.title}
              className="w-full h-40 object-cover rounded-md mb-4"
            />
            <div className="rounded-lg mb-1">
              <h2 className="text-white text-2xl font-bold text-center p-2">{currentGameJam.title}</h2>
            </div>
            <p className="text-white text-center text-md mb-2">
              {currentGameJam.short_text ? currentGameJam.short_text : "No description available."}
            </p>
            <Link href={currentGameJam.gamejam_link}>
              <Button className="bg-red-500 p-3 rounded-full mb-2 mt-2 transition-transform transform hover:scale-110 hover:bg-red-500 flex items-center">
                Link to the jam <Link2 className="h-4 w-4 ml-1"/>
              </Button>
            </Link>
          </animated.div>
        </div>
        <div className="flex mt-5">
          <h1 className="text-white text-md text-center px-4 mb-3">
            <strong className="text-red-500">Left</strong> to swipe, <strong className="text-red-500">right</strong> to open the jam feed!
          </h1>
        </div>
        <Link href={"https://github.com/DeanDoesDev/tinder-for-jams"} target="_blank" rel="noopener noreferrer">
          <div className="bg-zinc-700 p-3 rounded-full mb-3 transition-transform transform hover:scale-110 hover:bg-zinc-600">
            <h1 className="text-zinc-200 text-sm font-bold flex items-center">See Github repo <GitBranch className="ml-1 w-4 h-4"/></h1>
          </div>
        </Link>
    </div>
  ) 
}
