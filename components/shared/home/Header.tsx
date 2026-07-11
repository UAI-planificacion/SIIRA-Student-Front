'use client';

import { useRouter } from 'next/navigation';
import Image                        from "next/image"


import { ModeToggle } from '@/components/shared/home/theme/mode-toggle';
import { Login }      from '../../../Login';


export function Header(): React.JSX.Element {
	const router = useRouter();

	return (
		<header className="sticky top-0 z-60 w-full">
			<div className="h-16 border-b bg-background/80 backdrop-blur-md flex items-center justify-between px-3 sm:px-6 shadow-sm border-border/50">
				<div
					role        = "button"
					tabIndex    = { 0 }
					className   = "flex items-center gap-2 group cursor-pointer select-none"
					onClick     = { () => router.push( '/dashboard' ) }
					onKeyDown   = { ( event ) => { if ( event.key === 'Enter' || event.key === ' ' ) { event.preventDefault(); router.push( '/dashboard' ); } }}
				>
					<div className="flex items-center gap-3">
                        <a href="#">
                            <span className="sr-only">Universidad Adolfo Ibáñez</span>

                            <Image
                                className   = "p-0"
                                title       = "UAI"
                                src         = "https://mailing20s.s3.amazonaws.com/templtates/logosinescudo.png"
                                alt         = "logo uai"
                                width       = { 137 }
                                height      = { 50 }
                            />
                        </a>

                        <h1 className="hidden sm:flex text-2xl sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white">Nombre Proyecto</h1>
                    </div>
				</div>

				<div className="flex items-center gap-1.5 sm:gap-3">
					<div className="h-8 w-px bg-border mx-1 hidden sm:block" />

					<ModeToggle />

					<Login />
				</div>
			</div>
		</header>
	);
}
