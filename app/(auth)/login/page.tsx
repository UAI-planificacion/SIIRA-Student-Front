import { LoginButton } from '@/components/shared/auth/login-button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title       : 'Iniciar sesión — Project',
    description : 'Inicia sesión con tu cuenta de Microsoft para acceder a Project.',
};

export default function LoginPage(): React.JSX.Element {
    return (
        <div className="flex  flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm text-center space-y-4">
                <h2 className="text-2xl font-black tracking-tight text-foreground">
                    Bienvenido a{' '}
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-teal-400">
                        Project
                    </span>
                </h2>

                <p className="text-sm text-muted-foreground">
                    Usa el botón de la barra superior para iniciar sesión con tu cuenta de Microsoft.
                </p>

                <LoginButton />
            </div>
        </div>
    );
}
