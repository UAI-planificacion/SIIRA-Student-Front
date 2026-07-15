import type { NextRequest } from 'next/server';
import { NextResponse }     from 'next/server';

import type { Subject, SubjectSection, ScheduleSlot, SubjectAcademicStatus } from '@/types/siira';

// ─── Local helpers ────────────────────────────────────────────────────────────

function s( slots: ScheduleSlot[] ): string {
    return JSON.stringify( slots );
}

function randomQuotas( base: number ): number {
    const delta = Math.floor( Math.random() * 21 ) - 10;
    return Math.max( 0, base + delta );
}

/** Build two or three sections for an available_to_enroll subject */
function mkSections(
    subjectId : string,
    professors : string[],
    schedules  : ScheduleSlot[][],
    capacity   : number = 45,
): SubjectSection[] {
    return professors.map( ( professor, i ) => ({
        id        : `${ subjectId }-sec-${ i + 1 }`,
        label     : `Sec ${ i + 1 }`,
        professor,
        schedule  : s( schedules[ i ] ?? schedules[ 0 ]! ),
        quotas    : randomQuotas( Math.floor( capacity * 0.6 ) ),
        capacity,
    }) );
}

// MockStatus ensures only valid SubjectAcademicStatus values are used in this file
type MockStatus = SubjectAcademicStatus;

// ─── Subjects ─────────────────────────────────────────────────────────────────

const BASE_SUBJECTS: Omit<Subject, 'quotas'>[] = [
    // ───── SEMESTRE 1 ─────
    {
        id             : 'subj-01',
        name           : 'Estructuras de Datos',
        credits        : 6,
        kind           : 'asignatura',
        professor      : 'Daza',
        isRequired     : true,
        academicStatus : 'approved' satisfies MockStatus,
        semester       : 1,
        description    : 'Curso troncal de algoritmos y estructuras lineales, árboles, grafos y técnicas de búsqueda y ordenamiento eficiente.',
        schedule       : s( [
            { day: 'Lunes',     block: 1 },
            { day: 'Lunes',     block: 2 },
            { day: 'Miércoles', block: 1 },
            { day: 'Miércoles', block: 2 },
        ] ),
    },
    {
        id             : 'subj-02',
        name           : 'Cálculo Diferencial',
        credits        : 6,
        kind           : 'asignatura',
        professor      : 'Fuentes',
        isRequired     : true,
        academicStatus : 'approved' satisfies MockStatus,
        semester       : 1,
        description    : 'Límites, continuidad, derivadas y aplicaciones al análisis de funciones reales de variable real.',
        schedule       : s( [
            { day: 'Martes', block: 3 },
            { day: 'Martes', block: 4 },
            { day: 'Jueves', block: 3 },
            { day: 'Jueves', block: 4 },
        ] ),
    },
    {
        id             : 'subj-03',
        name           : 'Álgebra Lineal',
        credits        : 5,
        kind           : 'asignatura',
        professor      : 'Morales',
        isRequired     : true,
        academicStatus : 'approved' satisfies MockStatus,
        semester       : 1,
        description    : 'Vectores, matrices, sistemas de ecuaciones, determinantes, valores y vectores propios.',
        schedule       : s( [
            { day: 'Lunes',     block: 3 },
            { day: 'Miércoles', block: 3 },
            { day: 'Viernes',   block: 1 },
        ] ),
    },

    // ───── SEMESTRE 2 ─────
    {
        id             : 'subj-04',
        name           : 'Programación Orientada a Objetos',
        credits        : 6,
        kind           : 'asignatura',
        professor      : 'Soto',
        isRequired     : true,
        academicStatus : 'approved' satisfies MockStatus,
        semester       : 2,
        description    : 'Paradigma OOP con Java: encapsulación, herencia, polimorfismo, interfaces y patrones de diseño básicos.',
        schedule       : s( [
            { day: 'Martes', block: 1 },
            { day: 'Martes', block: 2 },
            { day: 'Jueves', block: 1 },
            { day: 'Jueves', block: 2 },
        ] ),
    },
    {
        id             : 'subj-05',
        name           : 'Bases de Datos',
        credits        : 5,
        kind           : 'asignatura',
        professor      : 'Villarroel',
        isRequired     : true,
        academicStatus : 'failed_or_pending' satisfies MockStatus,
        semester       : 2,
        description    : 'Modelo relacional, SQL, normalización, transacciones y fundamentos de bases NoSQL.',
        schedule       : s( [
            { day: 'Lunes',     block: 5 },
            { day: 'Miércoles', block: 5 },
            { day: 'Viernes',   block: 3 },
        ] ),
    },
    {
        id             : 'subj-06',
        name           : 'Sistemas Operativos',
        credits        : 5,
        kind           : 'asignatura',
        professor      : 'Araya',
        isRequired     : true,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 2,
        description    : 'Procesos, hilos, scheduling, memoria virtual, sistemas de archivos y seguridad en SO.',
        prerequisites  : [ 'subj-01', 'subj-03' ],
        sections       : mkSections(
            'subj-06',
            [ 'Araya', 'Ríos' ],
            [
                [ { day: 'Martes', block: 5 }, { day: 'Jueves', block: 5 }, { day: 'Viernes', block: 5 } ],
                [ { day: 'Lunes',  block: 5 }, { day: 'Miércoles', block: 5 }, { day: 'Viernes', block: 6 } ],
            ]
        ),
        schedule       : s( [ { day: 'Martes', block: 5 }, { day: 'Jueves', block: 5 }, { day: 'Viernes', block: 5 } ] ),
    },

    // ───── SEMESTRE 3 ─────
    {
        id             : 'subj-07',
        name           : 'Redes de Computadores',
        credits        : 5,
        kind           : 'asignatura',
        professor      : 'Poblete',
        isRequired     : true,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 3,
        description    : 'Modelo OSI/TCP-IP, protocolos de capa de transporte, enrutamiento y seguridad básica en redes.',
        prerequisites  : [ 'subj-06' ],
        sections       : mkSections(
            'subj-07',
            [ 'Poblete', 'Bravo', 'Navia' ],
            [
                [ { day: 'Lunes',     block: 6 }, { day: 'Miércoles', block: 6 } ],
                [ { day: 'Martes',    block: 6 }, { day: 'Jueves',    block: 6 } ],
                [ { day: 'Miércoles', block: 7 }, { day: 'Viernes',   block: 7 } ],
            ]
        ),
        schedule       : s( [ { day: 'Lunes', block: 6 }, { day: 'Miércoles', block: 6 } ] ),
    },
    {
        id             : 'subj-08',
        name           : 'Ingeniería de Software',
        credits        : 5,
        kind           : 'asignatura',
        professor      : 'Bravo',
        isRequired     : true,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 3,
        description    : 'Metodologías ágiles, requisitos, arquitectura de software, testing y DevOps.',
        prerequisites  : [ 'subj-04' ],
        sections       : mkSections(
            'subj-08',
            [ 'Bravo', 'Cordero' ],
            [
                [ { day: 'Martes', block: 6 }, { day: 'Jueves', block: 6 } ],
                [ { day: 'Lunes',  block: 7 }, { day: 'Jueves', block: 7 } ],
            ]
        ),
        schedule       : s( [ { day: 'Martes', block: 6 }, { day: 'Jueves', block: 6 } ] ),
    },
    {
        id             : 'subj-09',
        name           : 'Probabilidades y Estadística',
        credits        : 5,
        kind           : 'asignatura',
        professor      : 'Navarro',
        isRequired     : true,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 3,
        description    : 'Probabilidad, distribuciones, inferencia estadística, regresión y aplicaciones en ingeniería.',
        prerequisites  : [ 'subj-02', 'subj-03' ],
        sections       : mkSections(
            'subj-09',
            [ 'Navarro', 'Ortiz' ],
            [
                [ { day: 'Lunes', block: 7 }, { day: 'Miércoles', block: 7 }, { day: 'Viernes', block: 7 } ],
                [ { day: 'Martes', block: 7 }, { day: 'Jueves',   block: 7 }, { day: 'Sábado',  block: 1 } ],
            ]
        ),
        schedule       : s( [ { day: 'Lunes', block: 7 }, { day: 'Miércoles', block: 7 }, { day: 'Viernes', block: 7 } ] ),
    },

    // ───── SEMESTRE 4 ─────
    {
        id             : 'subj-10',
        name           : 'Compiladores',
        credits        : 5,
        kind           : 'asignatura',
        professor      : 'Espinoza',
        isRequired     : true,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 4,
        description    : 'Análisis léxico, sintáctico y semántico, generación de código intermedio y optimización.',
        prerequisites  : [ 'subj-01', 'subj-04' ],
        sections       : mkSections(
            'subj-10',
            [ 'Espinoza', 'Vidal' ],
            [
                [ { day: 'Martes', block: 7 }, { day: 'Jueves', block: 7 } ],
                [ { day: 'Lunes',  block: 8 }, { day: 'Miércoles', block: 8 } ],
            ]
        ),
        schedule       : s( [ { day: 'Martes', block: 7 }, { day: 'Jueves', block: 7 } ] ),
    },
    {
        id             : 'subj-11',
        name           : 'Cálculo Integral',
        credits        : 6,
        kind           : 'asignatura',
        professor      : 'Torres',
        isRequired     : true,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 4,
        description    : 'Integral definida e indefinida, técnicas de integración, integrales múltiples y aplicaciones.',
        prerequisites  : [ 'subj-02' ],
        sections       : mkSections(
            'subj-11',
            [ 'Torres', 'Fuentes' ],
            [
                [ { day: 'Lunes', block: 4 }, { day: 'Miércoles', block: 4 }, { day: 'Viernes', block: 4 } ],
                [ { day: 'Martes', block: 3 }, { day: 'Jueves', block: 3 }, { day: 'Sábado', block: 2 } ],
            ]
        ),
        schedule       : s( [ { day: 'Lunes', block: 4 }, { day: 'Miércoles', block: 4 }, { day: 'Viernes', block: 4 } ] ),
    },
    {
        id             : 'subj-12',
        name           : 'Arquitectura de Computadores',
        credits        : 4,
        kind           : 'asignatura',
        professor      : 'Gutiérrez',
        isRequired     : true,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 4,
        description    : 'Organización del procesador, pipeline, jerarquía de memoria, RISC vs CISC y paralelismo.',
        prerequisites  : [ 'subj-06' ],
        sections       : mkSections(
            'subj-12',
            [ 'Gutiérrez', 'Contreras' ],
            [
                [ { day: 'Martes', block: 8 }, { day: 'Jueves', block: 8 } ],
                [ { day: 'Lunes',  block: 7 }, { day: 'Viernes', block: 7 } ],
            ]
        ),
        schedule       : s( [ { day: 'Martes', block: 8 }, { day: 'Jueves', block: 8 } ] ),
    },

    // ───── SEMESTRE 5 ─────
    {
        id             : 'subj-13',
        name           : 'Análisis de Algoritmos',
        credits        : 5,
        kind           : 'asignatura',
        professor      : 'Díaz',
        isRequired     : true,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 5,
        description    : 'Complejidad temporal y espacial, notación asintótica, divide y vencerás, programación dinámica.',
        schedule       : s( [
            { day: 'Lunes',     block: 8 },
            { day: 'Miércoles', block: 8 },
        ] ),
    },
    {
        id             : 'subj-14',
        name           : 'Metodología de la Investigación',
        credits        : 3,
        kind           : 'asignatura',
        professor      : 'Rojas',
        isRequired     : true,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 5,
        description    : 'Formulación de hipótesis, diseño experimental, revisión bibliográfica y escritura académica.',
        schedule       : s( [
            { day: 'Viernes', block: 6 },
            { day: 'Sábado',  block: 1 },
        ] ),
    },
    {
        id             : 'subj-15',
        name           : 'Ética Profesional',
        credits        : 2,
        kind           : 'asignatura',
        professor      : 'Castillo',
        isRequired     : true,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 5,
        description    : 'Responsabilidad profesional, propiedad intelectual, privacidad digital y ética en IA.',
        schedule       : s( [
            { day: 'Viernes', block: 8 },
        ] ),
    },

    // ───── ELECTIVOS — SEMESTRE 6 ─────
    {
        id             : 'subj-16',
        name           : 'Desarrollo Web Fullstack',
        credits        : 5,
        kind           : 'asignatura',
        professor      : 'Reyes',
        isRequired     : false,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 6,
        description    : 'React, Node.js, REST APIs, bases de datos y despliegue en la nube con prácticas DevOps modernas.',
        schedule       : s( [
            { day: 'Lunes',     block: 1 },
            { day: 'Miércoles', block: 1 },
        ] ),
    },
    {
        id             : 'subj-17',
        name           : 'Machine Learning',
        credits        : 5,
        kind           : 'asignatura',
        professor      : 'Vargas',
        isRequired     : false,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 6,
        description    : 'Regresión, clasificación, clustering, redes neuronales y evaluación de modelos con Python/scikit-learn.',
        schedule       : s( [
            { day: 'Martes', block: 1 },
            { day: 'Jueves', block: 1 },
        ] ),
    },
    {
        id             : 'subj-18',
        name           : 'Seguridad Informática',
        credits        : 4,
        kind           : 'asignatura',
        professor      : 'Medina',
        isRequired     : false,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 6,
        description    : 'Criptografía, ataques comunes, hacking ético, análisis de vulnerabilidades y respuesta a incidentes.',
        schedule       : s( [
            { day: 'Lunes',  block: 6 },
            { day: 'Jueves', block: 6 },
        ] ),
    },
    {
        id             : 'subj-19',
        name           : 'Computación en la Nube',
        credits        : 4,
        kind           : 'asignatura',
        professor      : 'Olivares',
        isRequired     : false,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 6,
        description    : 'AWS, Azure, GCP, contenedores con Docker, orquestación con Kubernetes y arquitecturas serverless.',
        schedule       : s( [
            { day: 'Martes', block: 3 },
            { day: 'Jueves', block: 3 },
        ] ),
    },
    {
        id             : 'subj-20',
        name           : 'Inteligencia Artificial',
        credits        : 5,
        kind           : 'asignatura',
        professor      : 'Fernández',
        isRequired     : false,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 6,
        description    : 'Búsqueda heurística, lógica proposicional, planificación, procesamiento de lenguaje natural e IA generativa.',
        schedule       : s( [
            { day: 'Lunes',     block: 7 },
            { day: 'Miércoles', block: 7 },
        ] ),
    },
    {
        id             : 'subj-21',
        name           : 'Desarrollo de Aplicaciones Móviles',
        credits        : 4,
        kind           : 'asignatura',
        professor      : 'Herrera',
        isRequired     : false,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 7,
        description    : 'React Native y Flutter: UI nativa, estado, navegación, cámara, GPS y publicación en stores.',
        schedule       : s( [
            { day: 'Martes', block: 5 },
            { day: 'Viernes', block: 5 },
        ] ),
    },
    {
        id             : 'subj-22',
        name           : 'Procesamiento de Imágenes',
        credits        : 4,
        kind           : 'asignatura',
        professor      : 'Sepúlveda',
        isRequired     : false,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 7,
        description    : 'Filtros, segmentación, detección de bordes, reconocimiento de patrones y visión por computadora con OpenCV.',
        schedule       : s( [
            { day: 'Lunes',   block: 5 },
            { day: 'Viernes', block: 2 },
        ] ),
    },
    {
        id             : 'subj-23',
        name           : 'Electrónica Digital',
        credits        : 4,
        kind           : 'asignatura',
        professor      : 'Contreras',
        isRequired     : false,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 7,
        description    : 'Circuitos combinacionales y secuenciales, lógica programmable, FPGA y microcontroladores.',
        schedule       : s( [
            { day: 'Martes', block: 4 },
            { day: 'Jueves', block: 4 },
        ] ),
    },
    {
        id             : 'subj-24',
        name           : 'Sistemas Distribuidos',
        credits        : 5,
        kind           : 'asignatura',
        professor      : 'Pizarro',
        isRequired     : false,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 7,
        description    : 'Consistencia, consenso, tolerancia a fallos, microservicios, gRPC y sistemas de mensajería distribuida.',
        schedule       : s( [
            { day: 'Miércoles', block: 2 },
            { day: 'Viernes',   block: 2 },
        ] ),
    },
    {
        id             : 'subj-25',
        name           : 'Blockchain y Contratos Inteligentes',
        credits        : 3,
        kind           : 'asignatura',
        professor      : 'Aguirre',
        isRequired     : false,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 8,
        description    : 'Fundamentos de blockchain, Ethereum, Solidity, DeFi y casos de uso empresariales.',
        schedule       : s( [
            { day: 'Viernes', block: 6 },
        ] ),
    },
    {
        id             : 'subj-26',
        name           : 'UX/UI y Diseño de Interacción',
        credits        : 3,
        kind           : 'asignatura',
        professor      : 'Molina',
        isRequired     : false,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 8,
        description    : 'Investigación de usuario, wireframing, prototipado en Figma, sistemas de diseño y pruebas de usabilidad.',
        schedule       : s( [
            { day: 'Sábado', block: 2 },
            { day: 'Sábado', block: 3 },
        ] ),
    },
    {
        id             : 'subj-27',
        name           : 'Análisis de Datos con Python',
        credits        : 4,
        kind           : 'asignatura',
        professor      : 'Gallardo',
        isRequired     : false,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 8,
        description    : 'Pandas, NumPy, Matplotlib, Seaborn, limpieza de datos y visualización interactiva con Plotly.',
        schedule       : s( [
            { day: 'Lunes',     block: 2 },
            { day: 'Miércoles', block: 2 },
        ] ),
    },
    {
        id             : 'subj-28',
        name           : 'DevOps y CI/CD',
        credits        : 3,
        kind           : 'asignatura',
        professor      : 'Vega',
        isRequired     : false,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 8,
        description    : 'Pipelines de integración y despliegue continuo, GitHub Actions, testing automatizado y monitoreo.',
        schedule       : s( [
            { day: 'Viernes', block: 3 },
        ] ),
    },
    {
        id             : 'subj-29',
        name           : 'Programación Funcional',
        credits        : 4,
        kind           : 'asignatura',
        professor      : 'León',
        isRequired     : false,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 9,
        description    : 'Haskell, inmutabilidad, funciones de orden superior, mónadas, y aplicación de FP en TypeScript.',
        schedule       : s( [
            { day: 'Martes', block: 2 },
            { day: 'Jueves', block: 2 },
        ] ),
    },
    {
        id             : 'subj-30',
        name           : 'Robótica e IoT',
        credits        : 4,
        kind           : 'asignatura',
        professor      : 'Muñoz',
        isRequired     : false,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 9,
        description    : 'Arduino, Raspberry Pi, sensores, actuadores, MQTT y construcción de sistemas embebidos conectados.',
        schedule       : s( [
            { day: 'Sábado', block: 4 },
            { day: 'Sábado', block: 5 },
        ] ),
    },
    {
        id             : 'subj-31',
        name           : 'Procesamiento de Lenguaje Natural',
        credits        : 4,
        kind           : 'asignatura',
        professor      : 'Ibáñez',
        isRequired     : false,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 9,
        description    : 'Tokenización, embeddings, transformers, LLMs, fine-tuning y aplicaciones con HuggingFace.',
        schedule       : s( [
            { day: 'Lunes',  block: 3 },
            { day: 'Jueves', block: 3 },
        ] ),
    },
    {
        id             : 'subj-32',
        name           : 'Taller de Emprendimiento Tecnológico',
        credits        : 3,
        kind           : 'taller',
        professor      : 'Flores',
        isRequired     : false,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 9,
        description    : 'Lean startup, validación de hipótesis, pitch de negocios, MVP y financiamiento de startups tech.',
        schedule       : s( [
            { day: 'Viernes', block: 4 },
            { day: 'Sábado',  block: 1 },
        ] ),
    },
    {
        id             : 'subj-33',
        name           : 'Taller de Videojuegos',
        credits        : 4,
        kind           : 'taller',
        professor      : 'Salinas',
        isRequired     : false,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 10,
        description    : 'Unity y Godot: diseño de juegos 2D/3D, física, animación, audio y publicación multiplataforma.',
        schedule       : s( [
            { day: 'Sábado', block: 6 },
            { day: 'Sábado', block: 7 },
        ] ),
    },
    {
        id             : 'subj-34',
        name           : 'Taller de Ciberseguridad Ofensiva',
        credits        : 3,
        kind           : 'taller',
        professor      : 'Álvarez',
        isRequired     : false,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 10,
        description    : 'CTF challenges, penetration testing, exploit development, análisis de malware y bug bounty.',
        schedule       : s( [
            { day: 'Miércoles', block: 8 },
            { day: 'Viernes',   block: 8 },
        ] ),
    },
    {
        id             : 'subj-35',
        name           : 'Taller de Arquitectura en la Nube',
        credits        : 3,
        kind           : 'taller',
        professor      : 'Campos',
        isRequired     : false,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 10,
        description    : 'Diseño de sistemas escalables, multi-región, high availability y cost optimization en AWS y GCP.',
        schedule       : s( [
            { day: 'Sábado', block: 8 },
        ] ),
    },
    {
        id             : 'subj-36',
        name           : 'Big Data y Procesamiento Masivo',
        credits        : 4,
        kind           : 'asignatura',
        professor      : 'Godoy',
        isRequired     : false,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 10,
        description    : 'Hadoop, Spark, Kafka, arquitecturas Lambda y Kappa, y procesamiento de datos en tiempo real.',
        schedule       : s( [
            { day: 'Lunes',  block: 5 },
            { day: 'Jueves', block: 5 },
        ] ),
    },
    {
        id             : 'subj-37',
        name           : 'Computación Cuántica',
        credits        : 3,
        kind           : 'asignatura',
        professor      : 'Becerra',
        isRequired     : false,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 11,
        description    : 'Qubits, puertas cuánticas, algoritmos de Shor y Grover, y programación con Qiskit de IBM.',
        schedule       : s( [
            { day: 'Martes', block: 8 },
            { day: 'Sábado', block: 2 },
        ] ),
    },
    {
        id             : 'subj-38',
        name           : 'Gestión de Proyectos TI',
        credits        : 3,
        kind           : 'asignatura',
        professor      : 'Silva',
        isRequired     : false,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 11,
        description    : 'PMBOK, Scrum avanzado, gestión de riesgos, presupuesto y comunicación con stakeholders.',
        schedule       : s( [
            { day: 'Miércoles', block: 5 },
            { day: 'Viernes',   block: 5 },
        ] ),
    },
    {
        id             : 'subj-39',
        name           : 'Criptografía Aplicada',
        credits        : 4,
        kind           : 'asignatura',
        professor      : 'Robles',
        isRequired     : false,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 11,
        description    : 'RSA, AES, curvas elípticas, TLS/SSL, firma digital, PKI y aplicaciones en sistemas reales.',
        schedule       : s( [
            { day: 'Lunes',     block: 4 },
            { day: 'Miércoles', block: 4 },
        ] ),
    },
    {
        id             : 'subj-40',
        name           : 'Taller de Deep Learning',
        credits        : 4,
        kind           : 'taller',
        professor      : 'Hidalgo',
        isRequired     : false,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 11,
        description    : 'CNN, RNN, LSTM, Transformers, PyTorch y despliegue de modelos de visión y lenguaje.',
        schedule       : s( [
            { day: 'Sábado', block: 3 },
            { day: 'Sábado', block: 4 },
        ] ),
    },
    {
        id             : 'subj-41',
        name           : 'Taller de Open Source',
        credits        : 2,
        kind           : 'taller',
        professor      : 'Peña',
        isRequired     : false,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 12,
        description    : 'Contribución a proyectos open source, licencias, gestión de comunidades y proyectos en GitHub.',
        schedule       : s( [
            { day: 'Viernes', block: 7 },
        ] ),
    },
    {
        id             : 'subj-42',
        name           : 'Bioinformática Computacional',
        credits        : 4,
        kind           : 'asignatura',
        professor      : 'Zamora',
        isRequired     : false,
        academicStatus : 'available_to_enroll' satisfies MockStatus,
        semester       : 12,
        description    : 'Alineación de secuencias, filogenética, análisis genómico y herramientas BLAST, BioPython.',
        schedule       : s( [
            { day: 'Martes', block: 6 },
            { day: 'Viernes', block: 6 },
        ] ),
    },
];

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET( _req: NextRequest ): Promise<NextResponse> {
    await new Promise<void>( ( resolve ) => setTimeout( resolve, 2000 ) );

    const subjects: Subject[] = BASE_SUBJECTS.map( ( subj ) => ({
        ...subj,
        quotas : randomQuotas(
            [ 'subj-01', 'subj-04', 'subj-16' ].includes( subj.id ) ? 2 : 30
        ),
    }) );

    return NextResponse.json( subjects );
}
