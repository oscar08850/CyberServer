export interface Usuario {
    nombre: string
    pubKey: string
}

export interface MensajeServidor {
    usuario: string
    tipo: string
    cifrado: string
    iv: string
    clave?: string
}