class MiClase {
    constructor(nombre:string, apellido:string) {
    }
}



export class Usuario {
    constructor(private name: string, private pubkey: string) {}

    get Name() {
        return this.name;
    }

    set Name(name) {
        this.name = name;
    }

    get Pubkey() {
        return this.pubkey;
    }

    set Pubkey(pubkey) {
        this.pubkey = pubkey;
    }
}