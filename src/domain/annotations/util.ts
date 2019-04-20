const backgrounds = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

export const getBackgroundFromId = (id: string): string => {
    let idValue = 0;
    for (let i=0; i < id.length; i++) {
        idValue += id.charCodeAt(i);
    }
    return backgrounds[idValue % backgrounds.length];
};
