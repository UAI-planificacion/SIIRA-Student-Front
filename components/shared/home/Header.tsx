'use client';

import { useState }     from 'react';
import { useRouter }    from 'next/navigation';
import Image            from "next/image"

import { Calendar } from 'lucide-react';

import { Login }            from '../../../Login';
import { useStudent }       from '@/hooks/use-student';
import { useExecutionMode } from '@/hooks/use-execution-mode';
import { useCart }          from '@/context/cart-context';
import { ModeToggle }       from '@/components/shared/home/theme/mode-toggle';
import { Button }           from '@/components/ui/button';
import { CalendarioDrawer } from '@/components/dashboard/calendar/calendario-drawer';


export function Header(): React.JSX.Element {
	const {
		draftSubjects,
		usedCredits,
		requiredCredits,
		electiveCredits
	}                                       = useCart();
	const router                            = useRouter();
	const { data: student }                 = useStudent();
	const { mode }                          = useExecutionMode();
	const [ calendarOpen, setCalendarOpen ] = useState( false );

	const totalCredits = student?.totalCredits ?? 30;
	const percent      = totalCredits > 0 ? Math.min(( usedCredits / totalCredits ) * 100, 100 ) : 0;
	const isOver       = usedCredits > totalCredits;
	const isWarning    = !isOver && percent >= 80;

	const total   = Math.max( totalCredits, 1 );
	const reqPct  = Math.min( ( requiredCredits / total ) * 100, 100 );
	const elecPct = Math.min( ( electiveCredits / total ) * 100, 100 - reqPct );

	return (
		<header className="sticky top-0 z-50 w-full">
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

                        <h1 className="hidden sm:flex text-2xl sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white">Inscripción de Asignaturas</h1>
                    </div>
				</div>

				<div className="flex items-center gap-1.5 sm:gap-3">
					{/* Badge del Modo de Ejecución */}
					{ mode === 'planificacion' && (
						<span className="text-[10px] font-bold px-2 py-1 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 select-none">
							🏛️ Planificación
						</span>
					) }
					{ mode === 'toma_ramos' && (
						<span className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 select-none">
							⚡ Toma de Ramos
						</span>
					) }
					{ mode === 'esperando_prioridad' && (
						<span className="text-[10px] font-bold px-2 py-1 rounded bg-orange-500/10 text-orange-500 border border-orange-500/20 select-none">
							🕒 Espera de Turno
						</span>
					) }
					{ mode === 'finalizado' && (
						<span className="text-[10px] font-bold px-2 py-1 rounded bg-destructive/10 text-destructive border border-destructive/20 select-none">
							🛑 Finalizado
						</span>
					) }

					{/* Contador de Créditos Compacto y Premium */}
					{ student && (
						<div className="group relative flex items-center gap-2 px-2.5 py-1 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/40 transition-colors select-none cursor-help">
							<div className="flex flex-col items-end">
								<span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider leading-none">
									Créditos
								</span>

								<span className={ [
									'text-xs font-bold tabular-nums mt-0.5',
									isOver    ? 'text-destructive' :
									isWarning ? 'text-yellow-500'  :
									'text-foreground',
								].join( ' ' ) }>
									{ usedCredits }<span className="text-muted-foreground font-normal">/{ totalCredits }</span>
								</span>
							</div>

							{/* Stacked Progress Bar Mini */}
							<div className="relative h-1.5 w-16 rounded-full bg-muted overflow-hidden shrink-0">
								<div
									className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-300"
									style={ { width: `${ reqPct }%` } }
								/>

								<div
									className="absolute top-0 h-full bg-violet-500 transition-all duration-300"
									style={ { left: `${ reqPct }%`, width: `${ elecPct }%` } }
								/>
							</div>

							{/* Tooltip con desglose en hover */}
							<div className="absolute top-full right-0 mt-1.5 hidden group-hover:block z-50 bg-popover text-popover-foreground border border-border rounded-lg shadow-md p-2.5 min-w-40 text-xs">
								<p className="font-semibold mb-1.5 text-foreground">Desglose de Créditos</p>
								<div className="space-y-1">
									<div className="flex items-center justify-between gap-2">
										<span className="flex items-center gap-1 text-muted-foreground">
											<span className="size-2 rounded-full bg-blue-500 shrink-0" />
											Obligatorios
										</span>

										<strong className="text-foreground">{ requiredCredits } cr.</strong>
									</div>

									<div className="flex items-center justify-between gap-2">
										<span className="flex items-center gap-1 text-muted-foreground">
											<span className="size-2 rounded-full bg-violet-500 shrink-0" />
											Electivos
										</span>

										<strong className="text-foreground">{ electiveCredits } cr.</strong>
									</div>
								</div>
								{ isOver && (
									<p className="text-[10px] text-destructive font-medium mt-1.5 pt-1 border-t border-border">
										⚠ Límite excedido
									</p>
								) }
							</div>
						</div>
					) }

					{/* Botón calendario siempre visible */}
					<Button
						id          = "header-calendar-btn"
						variant     = "outline"
						size        = "sm"
						onClick     = { () => setCalendarOpen( true ) }
						disabled    = { draftSubjects.length === 0 }
						className   = "h-8 text-xs font-medium gap-1.5"
					>
						<Calendar className="size-3.5" />

						<span className="hidden md:inline">Horario Completo 🗓️</span>

						<span className="inline md:hidden">Horario 🗓️</span>
					</Button>

					<div className="h-8 w-px bg-border mx-1 hidden sm:block" />

					<ModeToggle />

					<Login />
				</div>
			</div>

			<CalendarioDrawer
				open    = { calendarOpen }
				onClose = { () => setCalendarOpen( false )}
			/>
		</header>
	);
}
