const DataInspector = {
    getType: (val) => {
        if (val === null) return "null";
        if (val === undefined) return "undefined";
        return Object.prototype.toString.call(val).slice(8, -1).toLowerCase();
    },

    getValue: (obj, key) => {
        return obj?.[key] ?? "Not Found";
    },

    getGrade: (score) => {
        if (score >= 90) return "A";
        else if (score >= 80) return "B";
        else if (score >= 70) return "C";
        else if (score >= 60) return "D";
        else return "F";
    },

    removeDuplicates: (arr) => {
        if (!Array.isArray(arr)) return [];
        return [...new Set(arr)];
    },

    getFrequency: (arr) => {
        if (!Array.isArray(arr)) return {};
        return arr.reduce((acc, curr) => {
            acc[curr] = (acc[curr] || 0) + 1;
            return acc;
        }, {});
    }
};

console.log("Type of null:", DataInspector.getType(null));
console.log("Type of [1,2]:", DataInspector.getType([1, 2]));
console.log("Get Value:", DataInspector.getValue({ name: "Alice" }, "name"));
console.log("Get Missing:", DataInspector.getValue(null, "age"));
console.log("Grade 85:", DataInspector.getGrade(85)); 
console.log("Remove Duplicates:", DataInspector.removeDuplicates([1, 2, 2, 3, 4, 4]));
console.log("Get Frequency:", DataInspector.getFrequency(["apple", "banana", "apple", "orange", "banana", "apple"]));