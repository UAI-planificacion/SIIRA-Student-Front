export enum PeriodStatus {
    Pending     = 'Pending',
    InProgress  = 'InProgress',
    Opened      = 'Opened',
    Closed      = 'Closed'
}

export enum PeriodType {
    ANUAL       = 'ANUAL',
    TRIMESTRAL  = 'TRIMESTRAL',
    SEMESTRAL   = 'SEMESTRAL',
    VERANO      = 'VERANO',
    BIMESTRAL   = 'BIMESTRAL'
}

export interface Period {
    id              : string;
    name            : string;
    costCenterId    : string;
    startDate       : string;
    endDate         : string;
    openingDate     : string;
    closingDate     : string;
    status          : PeriodStatus;
    type            : PeriodType;
    createdAt       : string;
    updatedAt       : string;
}
