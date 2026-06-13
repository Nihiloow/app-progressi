// Erreurs métier du domaine. Principe : la couche domaine signale QUOI a
// échoué (avec une intention de code HTTP), la couche API décide COMMENT le
// présenter. Remplace le matching fragile sur error.message dans les routes.
// Côté barème : héritage + polymorphisme (instanceof) = POO appliquée.

export class DomainError extends Error {
    constructor(message, httpStatus) {
        super(message);
        // this.constructor.name donne le nom de la classe fille réelle
        // (polymorphisme), utile dans les logs serveur
        this.name = this.constructor.name;
        this.httpStatus = httpStatus;
    }
}

export class TaskNotFoundError extends DomainError {
    constructor() {
        // 404 volontairement identique que la tâche n'existe pas OU
        // appartienne à un autre utilisateur : ne pas révéler l'existence
        // des ressources d'autrui
        super("Quête introuvable.", 404);
    }
}

export class InvalidTaskTransitionError extends DomainError {
    constructor(fromStatus, toStatus) {
        super(
            `Transition impossible : la quête est "${fromStatus}" et ne peut pas passer à "${toStatus}".`,
            409,
        );
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
    }
}

export class AccountDisabledError extends DomainError {
    constructor() {
        super("Ce compte a été désactivé.", 403);
    }
}

export class TagNotFoundError extends DomainError {
    constructor() {
        super("Tag introuvable.", 404);
    }
}
