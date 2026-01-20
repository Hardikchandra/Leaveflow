const db = require("./database");

const balances = [
  { userId: 1 }, // employee
  { userId: 2 }, // manager
  { userId: 3 }  // admin
];

balances.forEach(({ userId }) => {
  db.run(
    `
    INSERT OR IGNORE INTO leave_balances
    (user_id, total_paid, used_paid, remaining_paid)
    VALUES (?, 12, 0, 12)
    `,
    [userId]
  );
});

console.log("Leave balances seeded");
