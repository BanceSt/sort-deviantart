import Dexie from "dexie";

// Création de la base de données
export const db = new Dexie("SortsDatabase");

// Définition des tables
db.version(2).stores({
    sorts: "++id, sort_type, folder_name", // Table sorts avec clé primaire auto-incrémentée
    deviations_sorted: "++id, sort_id, deviation_id" // sort_id est la clé étrangère simulée
});

// Méthode pour ajouter un sort et ses déviations associées
export const addSortWithDeviations = async (sortType, deviations) => {
    return await db.transaction("rw", db.sorts, db.deviations_sorted, async () => {
        // Ajouter le sort
        const sortId = await db.sorts.add({ sort_type: sortType, folder_name: "Default Folder" });

        // Ajouter les déviations associées
        const deviationsToAdd = deviations.map(deviation => ({
            sort_id: sortId, // Référence au sort
            deviation_id: deviation.deviationid,
        }));

        // ajout en masse des déviations
        await db.deviations_sorted.bulkAdd(deviationsToAdd);
        return sortId; // Retourner l'ID du sort ajouté
    });
};