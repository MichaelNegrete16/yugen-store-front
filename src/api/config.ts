/**
 * Configuración del cliente API.
 * La URL base es pública (no es un secreto). Las llaves de la pasarela
 * viven SOLO en el backend; la app nunca las conoce.
 */
export const API_BASE_URL = 'https://yugen.michaelnegrete.online/api/v1';

/** Timeout por defecto para las peticiones (ms). */
export const API_TIMEOUT = 15000;
