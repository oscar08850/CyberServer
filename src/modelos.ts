export interface Usuario {
    nombre: string
    eHex: string
    nHex: string
}

export interface MensajeServidor {
    usuario: string
    tipo: string
    cifrado: string
    iv: string
    clave?: string
}

