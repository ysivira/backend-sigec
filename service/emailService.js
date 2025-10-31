//============================================================================
// SERVICIO DE EMAIL PARA RESETEAR CONTRASEÑA, ACTIVAR CUENTA Y BIENVENIDA
//============================================================================

const nodemailer = require('nodemailer');
require('dotenv').config(); 

/**
 * Creamos el "transportador" (el servicio que envía el email).
 * Usaremos Gmail
 */
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Servidor SMTP de Gmail
  port: 465,              // Puerto seguro
  secure: true,           // Usar SSL/TLS
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

/**
 * Envía un correo de reseteo de contraseña.
 * @param {string} to - Email del destinatario (el asesor)
 * @param {string} token - El token único de reseteo
 */
const sendPasswordResetEmail = async (to, token) => {
  const resetUrl = `http://localhost:3000/reset-password/${token}`; // URL del Frontend

  // Contenido del email 
  const mailOptions = {
    from: `"SIGEC Admin" <${process.env.EMAIL_USER}>`, 
    to: to, 
    subject: 'Solicitud de reseteo de contraseña - SIGEC',
    html: `
      <p>Hola,</p>
      <p>Hemos recibido una solicitud para resetear tu contraseña en SIGEC.</p>
      <p>Si no fuiste tú, por favor ignora este correo.</p>
      <p>Para cambiar tu contraseña, haz clic en el siguiente enlace. Este enlace caducará en 1 hora:</p>
      <p>
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
          Resetear mi Contraseña
        </a>
      </p>
      <p>O copia y pega esta URL en tu navegador:</p>
      <p>${resetUrl}</p>
      <br>
      <p>Saludos,</p>
      <p>El equipo de SIGEC.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email de reseteo enviado exitosamente. Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error al enviar el email de reseteo:', error);
    throw new Error('Error al enviar el email de reseteo.');
  }
};

/**
 * Envía el correo para activar la cuenta.
 * 
 */
const sendActivationEmail = async (to, legajo) => {
  const activationUrl = `http://localhost:3000/confirm-email/${legajo}`; // URL del Frontend 

  const mailOptions = {
    from: `"SIGEC Admin" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: '¡Bienvenido a SIGEC! Activa tu cuenta',
    html: `
      <p>¡Gracias por registrarte en SIGEC!</p>
      <p>Tu legajo es: <strong>${legajo}</strong></p>
      <p>Por favor, haz clic en el siguiente enlace para confirmar tu dirección de correo electrónico:</p>
      <p><a href="${activationUrl}" style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
        Activar mi Cuenta
      </a></p>
      <p>Una vez confirmado, un administrador revisará tu solicitud para activar tu cuenta.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email de activación enviado. ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error al enviar el email de activación:', error);
    throw new Error('Error al enviar el email de activación.');
  }
};

/**
 * Envía el correo de bienvenida (cuando el admin activa la cuenta).
 * 
 */
const sendWelcomeEmail = async (to, nombre) => {
  const loginUrl = `http://localhost:3000/login`; // URL del Frontend

  const mailOptions = {
    from: `"SIGEC Admin" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: '¡Tu cuenta en SIGEC ha sido activada!',
    html: `
      <p>Hola ${nombre},</p>
      <p>¡Buenas noticias! Un administrador ha activado tu cuenta en SIGEC.</p>
      <p>Ya puedes iniciar sesión con tu legajo y la contraseña que elegiste.</p>
      <p><a href="${loginUrl}" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
        Iniciar Sesión
      </a></p>
    `,
  };

   try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email de bienvenida enviado. ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error al enviar el email de bienvenida:', error);
    throw new Error('Error al enviar el email de bienvenida.');
  }
};
module.exports = {
  sendPasswordResetEmail,
    sendActivationEmail,
    sendWelcomeEmail,

};