class TextUtil {

    // méthode de normalisation de nom (suppression des accents, des espaces, des majuscules, etc)
    static normalizeName(name) {
        if (!name) return '';
        return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/-/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
    }
}

export default TextUtil;