import type { Metadata } from 'next';

import { DashboardLayout } from '@/components/dashboard/layout/dashboard-layout';

export const metadata: Metadata = {
    title       : 'SIIRA — Inscripción de Asignaturas',
    description : 'Selecciona y arma tu borrador de inscripción de asignaturas para el semestre.',
};

export default function DashboardPage(): React.JSX.Element {
    return <DashboardLayout />;
}
