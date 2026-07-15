'use client';

interface DashboardGroupLayoutProps {
    children : React.ReactNode;
}

/**
 * Layout para el grupo de rutas (dashboard).
 */
export default function DashboardGroupLayout( { children }: DashboardGroupLayoutProps ): React.JSX.Element {
    return (
        <>
            { children }
        </>
    );
}
