import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "./ui/button";
import Image from "next/image";

export function Header(){
    const session = useSession()
    return(
        <div className="flex items-center justify-center gap-x-4 bg-zinc-800">
            <Button className="bg-zinc-800 hover:bg-zinc-800 hover:text-red-500 p-0 transition-transform transform hover:scale-110">
                <h1 className="text-md">Home</h1>
            </Button>
            <Button className="bg-zinc-800 hover:bg-zinc-800 hover:text-red-500 p-0 transition-transform transform hover:scale-110">
                <h1 className="text-md">Liked Games</h1>
            </Button>
            <Button className="bg-zinc-800 hover:bg-zinc-800 hover:text-red-500 p-0 transition-transform transform hover:scale-110">
                <h1 className="text-md">History</h1>
            </Button>
            <Button className="bg-zinc-800 hover:bg-zinc-800 hover:text-red-500 p-0 transition-transform transform hover:scale-110">
                <h1 className="text-md text-zinc-500">Creators (soon)</h1>
            </Button>
            {session.data ?
                    <div className="flex items-center justify-center gap-x-4">
                        <Button className="bg-zinc-700 p-3 rounded-full transition-transform transform hover:scale-110 hover:bg-zinc-600" onClick={() => signOut()}>
                            <h1 className="text-md font-bold text-zinc-200">Sign out</h1>
                        </Button>
                        <Image
                            src={session.data?.user?.image ?? ""}
                            width={30}
                            height={30}
                            alt="Profile"
                            className="rounded-full"
                        />
                    </div>
                :
                    <Button className="bg-red-500 p-3 rounded-full transition-transform transform hover:scale-110 hover:bg-red-500" onClick={() => signIn("google")}>
                        <h1 className="text-md font-bold text-red-200">Sign in</h1>
                    </Button>
            }
        </div>
    )
}