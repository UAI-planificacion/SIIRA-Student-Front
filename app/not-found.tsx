'use client';

import { Button } from '@/components/ui/button';
import Image        from 'next/image';
import { useRouter } from 'next/navigation';

export default function Error404(): React.JSX.Element {
	const router = useRouter();

	return (
		<section className="w-full max-w-2xl mx-auto my-auto py-16 px-4 flex flex-col items-center justify-center text-center gap-8">
			{/* Contenedor de Imágenes */}
			<div className="flex flex-col sm:flex-row items-center justify-center gap-8">
				{/* Imagen 404 */}
				<div className="invert dark:invert-0">
					<Image
						src    = "https://i.ibb.co/G9DC8S0/404-2.png"
						alt    = "404 graphic"
						width  = { 300 }
						height = { 120 }
						priority
					/>
				</div>

				{/* Imagen del enchufe */}
				<div>
					<Image
						src    = "https://i.ibb.co/ck1SGFJ/Group.png"
						alt    = "disconnected plug"
						width  = { 200 }
						height = { 200 }
						priority
					/>
				</div>
			</div>

			{/* Textos */}
			<div className="space-y-4 max-w-xl">
				<h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
					Parece que has encontrado la puerta para llegar a donde querias ☹️
				</h1>
				<p className="text-muted-foreground text-base sm:text-lg">
					Lo sentimos por eso! Visite nuestra página de inicio para llegar a donde necesita ir.
				</p>
			</div>

			{/* Botón */}
			<Button
				onClick={ () => router.push( '/' ) }
				size= 'lg'
			>
				Seguir buscando!
			</Button>
		</section>
	);
}




