import { useMutation } from '@tanstack/react-query';


export interface ISubscriptionParams {
	sessionId : string;
	email     : string;
}


export interface ISubscriptionResponse {
	ticketId : string;
}


export const useSubscribeStudent = () => {
	return useMutation<ISubscriptionResponse, Error, ISubscriptionParams>({
		mutationFn: async ({ sessionId, email }) => {
			const res = await fetch( `/api/study-plan/subscribe/${ sessionId }?email=${ encodeURIComponent( email ) }`, {
				method : 'POST',
			} );

			if ( !res.ok ) {
				const errorData = await res.json().catch( () => ({}) );
				throw new Error( errorData?.message || 'Error al inscribir la asignatura' );
			}

			return res.json() as Promise<ISubscriptionResponse>;
		},
	});
};


export const useUnsubscribeStudent = () => {
	return useMutation<ISubscriptionResponse, Error, ISubscriptionParams>({
		mutationFn: async ({ sessionId, email }) => {
			const res = await fetch( `/api/study-plan/unsubscribe/${ sessionId }?email=${ encodeURIComponent( email ) }`, {
				method : 'POST',
			} );

			if ( !res.ok ) {
				const errorData = await res.json().catch( () => ({}) );
				throw new Error( errorData?.message || 'Error al desinscribir la asignatura' );
			}

			return res.json() as Promise<ISubscriptionResponse>;
		},
	});
};
