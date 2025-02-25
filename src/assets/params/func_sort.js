export const sorts_types  = [
    {
        "name" : "aleatoire",
        "func" : (array) => {
            let shuffledArray = [...array];
            for (let i = array.length - 1; i > 0; i--) {
                // console.log("Here func aleatoire ", array[i]);
                
                const j = Math.floor(Math.random() * (i + 1));
                const temp = shuffledArray[i];
                shuffledArray[i] = shuffledArray[j];
                shuffledArray[j] = temp;
              }
            return shuffledArray;
        }
        
    },
    {
        "name" : "alphabéthique author-title",
        "func" : (array) => {

            //function de sort author-titleusername.
            function sortDeviant (a, b) {
                // enlever les espaces et mettre en maj
                let author_a = a.author.username.trim().toUpperCase();
                let author_b = b.author.username.trim().toUpperCase();
            
                if (author_a === author_b) {
                    // enlever les espaces et mettre en maj
                    let title_a = a.title.trim().toUpperCase();
                    let title_b = b.title.trim().toUpperCase();
            
                    if (title_a < title_b) return -1;
                    else if (title_a > title_b) return 1;
                    else return 0;
                } else if (author_a < author_b) return -1;
                else return 1;
            }

            // utilisation de la fonction
            array.sort(sortDeviant);
            return array;
        }
    },
    {
        "name" : "alphabéthique title-author",
        "func" : (array) => {

            //function de sort title-author
            function sortDeviant (a, b) {
                // enlever les espaces et mettre en maj
                let title_a = a.title.trim().toUpperCase();
                let title_b = b.title.trim().toUpperCase();
                
            
                if (title_a === title_b) {
                    // enlever les espaces et mettre en maj
                    let author_a = a.author.username.trim().toUpperCase();
                    let author_b = b.author.username.trim().toUpperCase();
                    
            
                    if (author_a < author_b) return -1;
                    else if (author_a > author_b) return 1;
                    else return 0;
                } else if (title_a < title_b) return -1;
                else return 1;
            }

             // utilisation de la fonction
             array.sort(sortDeviant);
             return array;
        }
    },
    {
        "name" : "Plus récent",
        "func" : (array) => {
            function sortDeviant(a, b) {
                if (parseInt(a.published_time) < parseInt(b.published_time)) 
                    return 1;
                else return -1;
            }
            // utilisation de la fonction
            array.sort(sortDeviant);
            return array;
        }
    },
    {
        "name" : "Plus ancien",
        "func" : (array) => {
            function sortDeviant(a, b) {
                if (parseInt(a.published_time) > parseInt(b.published_time)) 
                    return 1;
                else return -1;
            }
            // utilisation de la fonction
            array.sort(sortDeviant);
            return array;
        }
    },
    {
        "name" : "Populaire",
        "func" : (array) => {
            function sortDeviant(a, b) {
                if (parseInt(a.stats.favourites) < parseInt(b.stats.favourites)) 
                    return 1;
                else return -1;
            }
            // utilisation de la fonction
            array.sort(sortDeviant);
            return array;
        }
    },
    {
        "name" : "Engagement",
        "func" : (array) => {
            function sortDeviant(a, b) {
                if (parseInt(a.stats.comments) < parseInt(b.stats.comments)) 
                    return 1;
                else return -1;
            }
            // utilisation de la fonction
            array.sort(sortDeviant);
            return array;
        }
    },
]