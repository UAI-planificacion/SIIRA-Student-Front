Actúa como un Ingeniero de Software Frontend Senior experto en React, Next.js (App Router), Tailwind CSS, Shadcn/ui y TanStack Query v5 y toggle theme por defecto light mode, y se puede cambiar a darkmode.

Necesito que construyas la interfaz de usuario de selección de asignaturas para el estudiante de la plataforma "SIIRA" (Sistema Inteligente de Inscripción de Asignaturas). La UI debe ser una SPA (Single Page Dashboard) de pantalla completa fija, altamente reactiva, modular y optimizada para evitar lagazos o degradación de rendimiento por re-renders masivos debidos al polling en tiempo real de los cupos.

---

### 🛠️ REQUISITOS DE RENDIMIENTO Y OPTIMIZACIÓN (CRÍTICO)
Para evitar bloqueos e hilos saturados al actualizar cupos en vivo:
1. COMPONETIZACIÓN ESTRICTA: Prohibido hacer todo en una sola página. Divide la UI de forma atómica: SidebarFiltros, CatalogoCentral, SubjectCard, CarritoBorrador, CalendarioDrawer, ContadorCreditos.
2. RENDIMIENTO E INMUTABILIDAD DE ESTADOS: Usa contextos de React separados o gestores de estado locales eficientes para que las actualizaciones por Short Polling del TanStack Query en los cupos de las cards NO provoquen el re-render total de la grilla de horarios o de los filtros.
3. GRILLA VIRTUALIZADA: El catálogo central debe implementar virtualización de listas (utiliza `@tanstack/react-virtual` o `react-window`) para renderizar únicamente las tarjetas visibles en el viewport del usuario, manteniendo el DOM ultra liviano aunque existan cientos de materias.

---

### 🗂️ MODELOS DE DATOS (TypeScript)
Usa y extiende los siguientes tipos, agregando la propiedad 'isRequired' para las asignaturas obligatorias:

export type SubjectKind = "asignatura" | "taller";

export interface Subject {
  id: string;
  name: string;
  credits: number;
  quotas: number; // Cupos actuales mutables por polling
  kind: SubjectKind;
  professor: string;
  schedule: string; // Ej: "Lunes 1-2, Miércoles 1-2" o JSON stringificado
  description: string;
  isRequired: boolean; // <-- NUEVO: Define si es obligatorio por malla
}

export type DraftStatus = "editing" | "submitted";

export interface Draft {
  id: string;
  subjects: Subject[];
  remainingCredits: number;
  status: DraftStatus;
}

export interface Student {
  id: string;
  name: string;
  program: string;
  totalCredits: number;
}

---

### 🔄 CAPA DE DATOS (TanStack Query)
1. Consume la data mockeada mediante 2 endpoints internos simulados de Next.js (App Router):
   - `app/api/draft/get-one` -> Retorna el Draft actual y la info del Student.
   - `app/api/signatures/get-all` -> Retorna el array completo de Subjects falsos de prueba (al menos 40 asignaturas para forzar la virtualización).
2. Ambos endpoints de la API deben simular un retraso de carga forzado (`setTimeout`) de exactamente 2 segundos antes de resolver el JSON.
3. En el frontend, utiliza TanStack Query (`useQuery`) para manejar estas peticiones.
4. Mientras `isLoading` sea true, muestra componentes de carga tipo SKELETON LOADERS animados con Tailwind (`animate-pulse`) en la columna central y en el carrito, imitando perfectamente la estructura de las tarjetas finales.
5. Configura el query del catálogo para hacer un refetch (Polling) controlado cada 3 segundos (`refetchInterval: 3000`) para simular la actualización en tiempo real de la propiedad `quotas`.

---

### 🎨 DISTRIBUCIÓN DEL LAYOUT (Layout de 3 Columnas)

El diseño debe ocupar el 100vh fijo de la pantalla (`h-screen overflow-hidden`) y dividirse en:

1. COLUMNA IZQUIERDA (20% - Filtros Avanzados):
   - Barra de búsqueda (Fuzzy search por nombre, código o profesor).
   - Checkboxes de filtrado: Ramos Obligatorios (isRequired: true) vs Opcionales.
   - Selector por bloque horario (Mañana vs Tarde).
   - Un Switch/Toggle que diga: "Ocultar colisiones horarias" (Filtra de forma reactiva las cards del centro comparando los horarios con los ramos ya añadidos al carrito).

2. COLUMNA CENTRAL (55% - Catálogo de Asignaturas Virtualizado):
   - Muestra las cards de asignaturas renderizadas de forma eficiente mediante una grilla virtualizada.
   - Si no hay filtros aplicados, muestra arriba por defecto en una sección destacada los ramos que tengan `isRequired: true` ("Sugeridos para tu Semestre") y abajo los electivos.
   - Cada tarjeta de asignatura debe mostrar de forma limpia: Nombre, Profesor, Créditos, Horario, un Badge dinámico para `isRequired` (Obligatorio/Opcional) y un indicador visual dinámico del estado de los cupos (`quotas`): Verde si hay stock, Naranja si quedan menos de 5, Rojo y botón bloqueado si está en 0.
   - Acción: Botón interactivo para "Añadir al Borrador". Si ya está añadido, debe cambiar a un estado visual de "Seleccionado".

3. COLUMNA DERECHA (25% - Carrito del Borrador):
   - Header superior persistente que muestra un KPI dinámico de créditos: `[Créditos Utilizados / totalCredits del estudiante]` (Ej: 18 / 30 cr.) acompañado de una barra de progreso reactiva de Tailwind.
   - Botón destacado en el header del carrito: "Visualizar Horario Completo 🗓️". Al hacer clic, abre un componente DRAWER de Shadcn que se desliza desde un costado y despliega la grilla horaria completa en formato CALENDARIO expandido (Columnas = Días Lunes a Sábado, Filas = Bloques de horas). Dentro del Drawer se ven los bloques ocupados por los ramos del carrito y permite removerlos en caliente.
   - Cuerpo del carrito: Listado compacto de tarjetas con los ramos agregados, mostrando su nombre, créditos y cupos actuales en vivo.
   - Botón Atómico en la base: "Guardar y Congelar Borrador". Si el estado del borrador cambia a "submitted", toda la UI se bloquea visualmente con un candado inmutable.

Genera el código limpio, modular, estilizado con Tailwind moderno, usando componentes de Shadcn/ui (Drawer, Button, Switch, ScrollArea, Badge, Skeleton) si están disponibles, o Tailwind nativo equivalente.