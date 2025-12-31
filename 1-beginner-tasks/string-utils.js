const StringUtils = {
    reverse: (str) => {
        if (!str) return 0;
        return String(str).split('').reverse().join('');
    },

    countWords: (str) => {
        const text = String(str).trim();
        if (!text) return 0;
        return text.split(/\s+/).length;
    },

    countVowels: (str) => {
        if (!str) return 0;
        const matches = String(str).match(/[aeiou]/gi);
        return matches ? matches.length : 0;
    },

    isPalindrome: (str) => {
        if (!str) return false;
        const clean = String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
        const reversed = clean.split('').reverse().join('');
        return clean === reversed;
    },

    isAnagram: (str1, str2) => {
        const normalize = (s) => String(s).replace(/[^a-z0-9]/gi, "").toLowerCase().split("").sort().join("");
        return normalize(str1) === normalize(str2);
    }
}

console.log("Reverse (hello):", StringUtils.reverse("hello"));
console.log("Word Count (Hello   World):", StringUtils.countWords("Hello   World"));
console.log("Vowels (Architecture):", StringUtils.countVowels("Architecture"));
console.log("Palindrome (Race Car):", StringUtils.isPalindrome("Race Car")); 
console.log("Anagram (Listen, Silent):", StringUtils.isAnagram("Listen", "Silent"));