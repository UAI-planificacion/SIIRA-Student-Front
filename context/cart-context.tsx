'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

import { useSubjects }      from '@/hooks/use-subjects';
import { useExecutionMode } from '@/hooks/use-execution-mode';
import type { DraftStatus, Subject } from '@/types/siira';

interface CartContextValue {
    draftSubjects   : Subject[];
    draftStatus     : DraftStatus;
    usedCredits     : number;
    requiredCredits : number;
    electiveCredits : number;
    isCartOpen      : boolean;
    addSubject      : ( subject: Subject ) => void;
    removeSubject   : ( id: string ) => void;
    freezeDraft     : () => void;
    isInCart        : ( id: string ) => boolean;
    toggleCart      : () => void;
}

const CartContext = createContext<CartContextValue | null>( null );

interface CartProviderProps {
    children : React.ReactNode;
}

export function CartProvider( { children }: CartProviderProps ): React.JSX.Element {
    const [ draftSubjects, setDraftSubjects ] = useState<Subject[]>( [] );
    const [ draftStatus, setDraftStatus ]     = useState<DraftStatus>( 'editing' );
    const [ isCartOpen, setIsCartOpen ]       = useState( true );

    const { data: subjects } = useSubjects();
    const { mode }           = useExecutionMode();

    useEffect( () => {
        if ( mode === 'toma_ramos' && subjects ) {
            const enrolledSubjects: Subject[] = [];

            subjects.forEach( ( s ) => {
                if ( s.academicHistory?.status === 'IN_PROGRESS' && s.sections ) {
                    const enrolledSection = s.sections.find( ( sec ) =>
                        sec.enrollments?.some( ( e ) => e.status === 'CONFIRMED' || e.status === 'PROCESSING' )
                    );

                    if ( enrolledSection ) {
                        enrolledSubjects.push({
                            ...s,
                            professor : enrolledSection.professor,
                            schedule  : enrolledSection.schedule,
                            quotas    : enrolledSection.quotas,
                        });
                    }
                }
            } );

            setDraftSubjects( enrolledSubjects );
        }
    }, [ subjects, mode ] );


    const usedCredits = useMemo(
        () => draftSubjects.reduce( ( acc, s ) => acc + s.credits, 0 ),
        [ draftSubjects ]
    );

    const requiredCredits = useMemo(
        () => draftSubjects.filter( ( s ) => s.isRequired ).reduce( ( acc, s ) => acc + s.credits, 0 ),
        [ draftSubjects ]
    );

    const electiveCredits = useMemo(
        () => draftSubjects.filter( ( s ) => !s.isRequired ).reduce( ( acc, s ) => acc + s.credits, 0 ),
        [ draftSubjects ]
    );

    const addSubject = useCallback( ( subject: Subject ) => {
        setDraftSubjects( ( prev ) => {
            if ( prev.some( ( s ) => s.id === subject.id ) ) return prev;

            return [ ...prev, subject ];
        } );
    }, [] );

    const removeSubject = useCallback( ( id: string ) => {
        setDraftSubjects( ( prev ) => prev.filter( ( s ) => s.id !== id ) );
    }, [] );

    const freezeDraft = useCallback( () => {
        setDraftStatus( 'submitted' );
    }, [] );

    const isInCart = useCallback(
        ( id: string ) => draftSubjects.some( ( s ) => s.id === id ),
        [ draftSubjects ]
    );

    const handleToggleCart = useCallback( () => setIsCartOpen( ( prev ) => !prev ), [] );

    const value = useMemo<CartContextValue>(
        () => ({
            draftSubjects,
            draftStatus,
            usedCredits,
            requiredCredits,
            electiveCredits,
            isCartOpen,
            addSubject,
            removeSubject,
            freezeDraft,
            isInCart,
            toggleCart    : handleToggleCart,
        }),
        [ draftSubjects, draftStatus, usedCredits, requiredCredits, electiveCredits, isCartOpen, addSubject, removeSubject, freezeDraft, isInCart, handleToggleCart ]
    );

    return (
        <CartContext.Provider value={ value }>
            { children }
        </CartContext.Provider>
    );
}

export function useCart(): CartContextValue {
    const ctx = useContext( CartContext );

    if ( !ctx ) throw new Error( 'useCart debe usarse dentro de CartProvider' );

    return ctx;
}
