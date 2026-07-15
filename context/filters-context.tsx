'use client';

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';

type ScheduleBlock = "all" | "morning" | "afternoon";

interface FiltersContextValue {
    searchQuery             : string;
    showRequired            : boolean;
    showOptional            : boolean;
    scheduleBlock           : ScheduleBlock;
    hideCollisions          : boolean;
    hideNoQuotas            : boolean;
    hideExceedingCredits    : boolean;
    isSidebarOpen           : boolean;
    setSearchQuery          : ( q: string ) => void;
    setShowRequired         : ( v: boolean ) => void;
    setShowOptional         : ( v: boolean ) => void;
    setScheduleBlock        : ( b: ScheduleBlock ) => void;
    setHideCollisions       : ( v: boolean ) => void;
    setHideNoQuotas         : ( v: boolean ) => void;
    setHideExceedingCredits : ( v: boolean ) => void;
    toggleSidebar           : () => void;
}

const FiltersContext = createContext<FiltersContextValue | null>( null );

interface FiltersProviderProps {
    children : React.ReactNode;
}

export function FiltersProvider( { children }: FiltersProviderProps ): React.JSX.Element {
    const [ searchQuery, setSearchQuery ]                   = useState( '' );
    const [ showRequired, setShowRequired ]                 = useState( true );
    const [ showOptional, setShowOptional ]                 = useState( true );
    const [ scheduleBlock, setScheduleBlock ]               = useState<ScheduleBlock>( 'all' );
    const [ hideCollisions, setHideCollisions ]             = useState( false );
    const [ hideNoQuotas, setHideNoQuotas ]                 = useState( false );
    const [ hideExceedingCredits, setHideExceedingCredits ] = useState( false );
    const [ isSidebarOpen, setIsSidebarOpen ]               = useState( true );

    const handleSetSearchQuery             = useCallback( ( q: string )        => setSearchQuery( q ),             [] );
    const handleSetShowRequired            = useCallback( ( v: boolean )       => setShowRequired( v ),            [] );
    const handleSetShowOptional            = useCallback( ( v: boolean )       => setShowOptional( v ),            [] );
    const handleSetScheduleBlock           = useCallback( ( b: ScheduleBlock ) => setScheduleBlock( b ),           [] );
    const handleSetHideCollisions          = useCallback( ( v: boolean )       => setHideCollisions( v ),          [] );
    const handleSetHideNoQuotas            = useCallback( ( v: boolean )       => setHideNoQuotas( v ),            [] );
    const handleSetHideExceedingCredits    = useCallback( ( v: boolean )       => setHideExceedingCredits( v ),    [] );
    const handleToggleSidebar              = useCallback( () => setIsSidebarOpen( ( prev ) => !prev ),    [] );

    const value = useMemo<FiltersContextValue>(
        () => ({
            searchQuery,
            showRequired,
            showOptional,
            scheduleBlock,
            hideCollisions,
            hideNoQuotas,
            hideExceedingCredits,
            isSidebarOpen,
            setSearchQuery          : handleSetSearchQuery,
            setShowRequired         : handleSetShowRequired,
            setShowOptional         : handleSetShowOptional,
            setScheduleBlock        : handleSetScheduleBlock,
            setHideCollisions       : handleSetHideCollisions,
            setHideNoQuotas         : handleSetHideNoQuotas,
            setHideExceedingCredits : handleSetHideExceedingCredits,
            toggleSidebar           : handleToggleSidebar,
        }),
        [
            searchQuery,
            showRequired,
            showOptional,
            scheduleBlock,
            hideCollisions,
            hideNoQuotas,
            hideExceedingCredits,
            isSidebarOpen,
            handleSetSearchQuery,
            handleSetShowRequired,
            handleSetShowOptional,
            handleSetScheduleBlock,
            handleSetHideCollisions,
            handleSetHideNoQuotas,
            handleSetHideExceedingCredits,
            handleToggleSidebar,
        ]
    );

    return (
        <FiltersContext.Provider value={ value }>
            { children }
        </FiltersContext.Provider>
    );
}

export function useFilters(): FiltersContextValue {
    const ctx = useContext( FiltersContext );

    if ( !ctx ) throw new Error( 'useFilters debe usarse dentro de FiltersProvider' );

    return ctx;
}
