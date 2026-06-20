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

export class ForbiddenError extends DomainError {
    constructor() {
        // 403 et non 401 : l'identité est connue et valide, c'est le
        // niveau de privilège qui est insuffisant. Message volontairement
        // sobre : ne pas détailler ce qui manque comme droit.
        super("Accès réservé aux administrateurs.", 403);
    }
}

export class UnauthenticatedError extends DomainError {
    constructor() {
        // 401 et non 403 : ici l'identité elle-même n'est pas établie
        // (pas de session valide), contrairement à ForbiddenError où
        // l'identité est connue mais insuffisamment privilégiée.
        super("Non autorisé.", 401);
    }
}

export class SelfTargetError extends DomainError {
    constructor() {
        // Un admin ne peut pas se désactiver ni se supprimer lui-même :
        // garde-fou contre le verrouillage hors de sa propre application.
        super(
            "Vous ne pouvez pas appliquer cette action à votre propre compte.",
            409,
        );
    }
}

export class EmailAlreadyUsedError extends DomainError {
    constructor() {
        // 409 : conflit avec une ressource existante (même sémantique que
        // le P2002 Prisma qu'elle remplace pour le cas pré-vérifié).
        super("Cet email est déjà utilisé par un autre héros.", 409);
    }
}
