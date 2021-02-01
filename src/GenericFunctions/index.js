module.exports = {

    // ..............
    // Ocultar dados em um objeto
    hideData(data = [], objet) {
        for (const dt of data) {
            objet[dt] = undefined
        }
    },




    // Geração de número aleatório
    getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

}