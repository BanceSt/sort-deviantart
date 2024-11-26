import Dexie from "dexie";

// Création de la base de données
export const db = new Dexie("MyDatabase");

// Définition des tables
db.version(1).stores({
    sorts: "++id, sort_type", // Table sorts avec clé primaire auto-incrémentée
    deviations_sorted: "++id, sort_id, deviation_title, deviation_author" // sort_id est la clé étrangère simulée
});

// Exemple de méthode pour ajouter un sort et ses déviations associées
export const addSortWithDeviations = async (sortType, deviations) => {
    return await db.transaction("rw", db.sorts, db.deviations_sorted, async () => {
        // Ajouter le sort
        const sortId = await db.sorts.add({ sort_type: sortType });

        // Ajouter les déviations associées
        for (let deviation of deviations) {
            await db.deviations_sorted.add({
                sort_id: sortId, // Référence au sort
                deviation_title: deviation.title,
                deviation_author: deviation.author
            });
        }
        return sortId; // Retourner l'ID du sort ajouté
    });
};