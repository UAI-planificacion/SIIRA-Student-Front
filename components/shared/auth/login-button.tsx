'use client';

import { LogIn, LogOut, User } from 'lucide-react';
import { useRouter }           from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button }                              from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { authClient } from '@/lib/auth-client';

export function LoginButton(): React.JSX.Element {
    const router                       = useRouter();
    const { data: session, isPending } = authClient.useSession();

    const handleLogin = async (): Promise<void> => {
        await authClient.signIn.social({
            provider    : 'microsoft',
            callbackURL : '/dashboard',
        });
    };

    const handleLogout = async (): Promise<void> => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => router.push( '/login' ),
            },
        });
    };

    if ( isPending ) {
        return (
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
        );
    }

    if ( !session ) {
        return (
            <Button
                variant   = "default"
                size      = "default"
                onClick   = { handleLogin }
                className = "gap-2 rounded-lg text-sm font-semibold"
            >
                <svg viewBox="0 0 256 256" preserveAspectRatio="xMidYMid"><path fill="#F1511B" d="M121.666 121.666H0V0h121.666z"/><path fill="#80CC28" d="M256 121.666H134.335V0H256z"/><path fill="#00ADEF" d="M121.663 256.002H0V134.336h121.663z"/><path fill="#FBBC09" d="M256 256.002H134.335V134.336H256z"/></svg>

                <span className="hidden sm:inline">Iniciar sesión</span>
            </Button>
        );
    }

    const user     = session.user;
    const initials = user.name
        ? user.name.split( ' ' ).map( ( n: string ) => n[ 0 ] ).slice( 0, 2 ).join( '' ).toUpperCase()
        : ( user.email?.[ 0 ]?.toUpperCase() ?? 'U' );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className  = "flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-border hover:ring-primary/50 transition-all focus-visible:outline-none cursor-pointer"
                aria-label = "Menú de usuario"
            >
                <Avatar className="h-8 w-8">
                    <AvatarImage src={ user.image ?? undefined } alt={ user.name ?? 'Usuario' } />

                    <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground">
                        { initials }
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 rounded-xl">
                {/* DropdownMenuLabel must be inside a DropdownMenuGroup
                    because @base-ui/react requires GroupLabel inside Menu.Group */}
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-semibold leading-none">{ user.name }</p>

                            <p className="text-xs text-muted-foreground truncate">{ user.email }</p>
                        </div>
                    </DropdownMenuLabel>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    <DropdownMenuItem
                        onClick   = { () => router.push( '/dashboard' ) }
                        className = "gap-2 cursor-pointer"
                    >
                        <User className="h-4 w-4" />
                        <span>Mi perfil</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    <DropdownMenuItem
                        onClick      = { handleLogout }
                        className    = "gap-2 cursor-pointer"
                        data-variant = "destructive"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Cerrar sesión</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
