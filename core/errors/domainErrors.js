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

export class HabitNotFoundError extends DomainError {
    constructor() {
        // 404 identique que l'habitude n'existe pas OU appartienne à un
        // autre utilisateur — même rationale que TaskNotFoundError.
        super("Habitude introuvable.", 404);
    }
}

export class HabitAlreadyCompletedError extends DomainError {
    constructor() {
        // 409 : conflit avec l'état actuel (le jour est déjà validé),
        // pas une faute de validation de forme (400) ni une absence de
        // ressource (404).
        super("Cette habitude a déjà été validée aujourd'hui.", 409);
    }
}

export class InvalidCredentialsError extends DomainError {
    constructor() {
        // 401, pas 400 : la session est valide (l'identité est connue),
        // mais la preuve fournie pour une action sensible (le mot de passe
        // actuel, pour en changer) est incorrecte — c'est un échec
        // d'authentification au même titre qu'un login raté, pas une
        // erreur de forme. Message volontairement générique, identique en
        // cas de mot de passe incorrect comme en cas d'autre souci : ne
        // jamais donner d'indice supplémentaire sur ce qui a échoué.
        super("Mot de passe actuel incorrect.", 401);
    }
}
