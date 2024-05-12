export interface EventPayload {
    'orders.pay': {
        pay: string;
    };
    'ticket.generate': {
        gen: string;
    };
    'ticket.start': {
        start: string;
    };
}

export const microserviceEvent = {
    'ORDERS.PAY': 'orders.pay',
    // idea en los headers puedo implementar
    //  'ORDERS.PAY': 'orders.pay',
    // 'ORDERS': 'orders', --> siginifa que va a escuchar todos los eventos de orders, y siempre que se publica un evente se publica tambien el header con el micro auto, es decir se publica dos veces??? mejor no parece mala idea.o capaz, si, siempre y cuando si escuholos todos los eventso, no puede escuhcar adicionalmete los individuales, pues recibira el mensaje 2 veces.
    'TICKET.GENERATE': 'ticket.generate',
    'TICKET.START': 'ticket.start'
} as const;

export type MicroserviceEvent = (typeof microserviceEvent)[keyof typeof microserviceEvent];
