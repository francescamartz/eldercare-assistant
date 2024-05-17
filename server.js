const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');

// Configuración de Twilio
const accountSid = 'your_twilio_account_sid';
const authToken = 'your_twilio_auth_token';
const client = new twilio(accountSid, authToken);

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(bodyParser.json());

// Simulación de recordatorio de medicamentos
let reminders = [];

app.post('/chat', (req, res) => {
    const userMessage = req.body.message.toLowerCase();
    let botResponse = 'No entendí eso. ¿Puedes repetirlo?';

    if (userMessage.includes('medicina') || userMessage.includes('medicamento')) {
        botResponse = '¿A qué hora necesitas que te recuerde tomar tu medicina?';
    } else if (/\d{1,2}:\d{2}/.test(userMessage)) {
        reminders.push(userMessage);
        botResponse = `Te recordaré tomar tu medicina a las ${userMessage}.`;
    } else if (userMessage.includes('llamar a')) {
        const contact = userMessage.replace('llamar a', '').trim();
        botResponse = `Llamando a ${contact}...`;
        // Aquí puedes agregar la lógica para llamar al contacto usando Twilio
        client.calls.create({
            url: 'http://demo.twilio.com/docs/voice.xml',
            to: 'the_contact_phone_number', // Cambia a número de teléfono del contacto
            from: 'your_twilio_phone_number' // Cambia a tu número de Twilio
        })
        .then(call => console.log(call.sid))
        .catch(err => console.error(err));
    } else {
        botResponse = 'Puedo recordarte tomar tu medicina o llamar a un contacto. ¿Qué necesitas?';
    }

    res.json({ response: botResponse });
});

// Recordatorio automático (cada minuto verifica y recuerda)
setInterval(() => {
    const now = new Date();
    const currentTime = `${now.getHours()}:${now.getMinutes()}`;
    reminders.forEach((reminder, index) => {
        if (reminder === currentTime) {
            console.log('Recordatorio: ¡Es hora de tomar tu medicina!');
            // Aquí podrías enviar un mensaje SMS con Twilio o usar otra forma de notificación
            reminders.splice(index, 1); // Remueve el recordatorio una vez notificado
        }
    });
}, 60000); // Verificar cada minuto

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
