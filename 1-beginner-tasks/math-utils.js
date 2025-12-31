const MathUtils = {
  add: (a, b) => a + b,
  sub: (a, b) => a - b,
  mul: (a, b) => a * b,
  div: (a, b) => (b === 0 ? "Cannot divide by zero" : a / b),

  factorial: (() => {
    const cache = {};
    console.log("Memory Initialized!");

    const innerFunc = (n) => {
      if (n < 0) return undefined;
      if (n === 0 || n === 1) return 1;
      if (n in cache) {
        console.log(`Fetching ${n}! from cache...`);
        return cache[n];
      }
      console.log(`Calculating ${n}! for the first time...`);
      const result = n * innerFunc(n - 1);
      cache[n] = result;
      return result;
    };
    return innerFunc;
  })(),

  isPrime: (n) => {
    if (n <= 1) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) return false;
    }
    return true;
  },

  sumDigits: (n) => {
    return String(n)
      .split("")
      .reduce((acc, curr) => acc + Number(curr), 0);
  },

  getMinMax: (arr) => {
    if (!arr || arr.length === 0) return null;
    return {
      min: Math.min(...arr),
      max: Math.max(...arr)
    };
  },

  oddOrEven: (n) => {
    return (n % 2 === 0) ? "even" : "odd";
  },

  toFahrenheit: (c) => {
    return (c * 9 / 5) + 32;
  },

  toCelsius: (f) => {
    return (f - 32) * 5 / 9;
  },

  parseNumArray: (str) => {
    if (!str) return [];
    return String(str).trim().split(/[\s,]+/).map(Number).filter(n => Number.isFinite(n));
  },

  sortNumbers: (arr, order = 'asc') => {
    if (!Array.isArray(arr)) return [];
    return arr.slice().sort((a, b) => (order === 'desc' ? b - a : a - b));
  }
};

console.log("Add: ", MathUtils.add(5, 10));
console.log("Factorial: ", MathUtils.factorial(5));
console.log("Is 7 Prime?: ", MathUtils.isPrime(7));
console.log("Sum Digits (456): ", MathUtils.sumDigits(456));
console.log("MinMax: ", MathUtils.getMinMax([10, 5, 100, 2]));
console.log("Odd or Even: ", MathUtils.oddOrEven(7));
console.log("C to F (20C): ", MathUtils.toFahrenheit(20));
console.log("F to C (92F): ", MathUtils.toCelsius(92));
console.log("Parse Num Array: ", MathUtils.parseNumArray("10, 20, 30, abc, 40"));
console.log("Sort Numbers Asc: ", MathUtils.sortNumbers([5, 2, 9, 1], 'asc'));
console.log("Sort Numbers Desc: ", MathUtils.sortNumbers([5, 2, 9, 1], 'desc'));