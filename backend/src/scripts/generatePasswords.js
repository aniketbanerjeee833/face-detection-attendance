import bcrypt from "bcrypt"

// 1. Define your accounts here. Edit this list as needed.
// const accounts = [
//   {  password: "admin@123"  },
//   {     password: "admin@123"  },
//   {    password: "admin@123"  },
//   {    password: "Slk@2026#Secure4" },
//   {     password: "Bhl@2026#Secure5" },
//   {     password: "Ddm@2026#Secure6" },
//   {   password: "Tgj@2026#Secure7" },
//   { password: "Pks@2026#Secure8" },
//   { password: "Grh@2026#Secure9" },
//   {       password: "Ksb@2026#Secure10" },
//   {  password: "Bbz@2026#Secure11" },
//   {           password: "SupAdm@2026#Root12"},
// ];

const accounts = [
  {  password: "admin@123"  },
  {     password: "admin@123"  },
  {    password: "admin@123"  }
];

const SALT_ROUNDS = 10;

async function main() {
  const results = [];

  for (const acc of accounts) {
    const hash = await bcrypt.hash(acc.password, SALT_ROUNDS);
    results.push({ ...acc, hash });
  }

  console.log("\n===== PLAIN CREDENTIALS (save this somewhere safe, then delete) =====\n");
  results.forEach((r) => {
    console.log(`  ${r.password} `);
  });

  console.log("\n===== SQL INSERT STATEMENTS =====\n");
  results.forEach((r) => {
    //const psId = r.police_station_id === null ? "NULL" : r.police_station_id;
    console.log(
      `INSERT INTO admins (password) 
      VALUES ('${r.hash}');`
    );
  });

  console.log("\nDone. Copy the SQL block above into your DB client.\n");
}

main().catch((err) => {
  console.error("Error generating passwords:", err);
  process.exit(1);
});