const employees = [
  { id: 1, name: "Alice", department: "IT", salary: 50000, years: 5 },
  { id: 2, name: "Bob", department: "HR", salary: 45000, years: 2 },
  { id: 3, name: "Charlie", department: "IT", salary: 75000, years: 10 },
  { id: 4, name: "David", department: "Marketing", salary: 55000, years: 4 },
  { id: 5, name: "Eve", department: "IT", salary: 80000, years: 7 },
  { id: 6, name: "Frank", department: "HR", salary: 60000, years: 3 }
];

const veterans = employees.filter(e => e.years > 4);

const itSalary = employees.filter(t => {
    if(t.department === "IT") return t;
})

const totalItSalary = itSalary.reduce((acc, curr) => {
    return acc + curr.salary;
},0);

const groupedByDept = employees.reduce((acc, curr) => {
    if(!acc[curr.department]) acc[curr.department] = [];
    acc[curr.department].push(curr);
    return acc;
}, {});

console.log(veterans);
console.log(totalItSalary);
console.log(groupedByDept);