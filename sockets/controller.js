const TicketControl = require("../models/ticket-control");

const ticketControl = new TicketControl();

const socketController = (socket) => {
    
    //console.log('Cliente conectado', socket.id );
    socket.emit('ultimo-ticket',`Ticket ${ticketControl.ultimo}`);
    socket.emit('estado-actual',ticketControl.ultimos4);
    socket.emit('tickets-pendientes',ticketControl.tickets.length)

    socket.on('disconnect', () => {
        //console.log('Cliente desconectado', socket.id );
    });

    socket.on('siguiente-ticket', ( payload, callback ) => {
        
        const siguiente = ticketControl.siguiente();

        //TODO:notificar que hay un nuevo ticket pendiente de asignar
        socket.broadcast.emit('tickets-pendientes',ticketControl.tickets.length)

        callback(siguiente);

    })

    socket.on('atender-ticket',({escritorio},callback)=>{
        
        if(!escritorio){
            return callback({
                ok:false,
                msg:'El escritorio es obligatorio'
            });
        }

        const ticket = ticketControl.atenderTicket(escritorio);

        socket.broadcast.emit('estado-actual',ticketControl.ultimos4);//broadcast emite a todos
        socket.emit('tickets-pendientes',ticketControl.tickets.length)//emite para el mismo
        socket.broadcast.emit('tickets-pendientes',ticketControl.tickets.length)//emite para los demas

        //Notificar cambio en los ultimos 4

        if( !ticket ){
            callback({
                ok:false,
                msg:'Ya no hay tickets pendientes'
            })
        }else{
            callback({
                ok:true,
                ticket
            })
        }
    })

}



module.exports = {
    socketController
}

