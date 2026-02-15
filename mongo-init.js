db = db.getSiblingDB('factsdb');

db.createCollection('facts');

db.facts.createIndex({ createdAt: -1 });
db.facts.createIndex({ category: 1 });

db.facts.insertMany([
  {
    text: "Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that was still edible.",
    category: "nature",
    source: "initial-seed",
    createdAt: new Date()
  },
  {
    text: "A group of flamingos is called a 'flamboyance'.",
    category: "animals",
    source: "initial-seed",
    createdAt: new Date()
  },
  {
    text: "The shortest war in history lasted 38 to 45 minutes between Britain and Zanzibar on August 27, 1896.",
    category: "history",
    source: "initial-seed",
    createdAt: new Date()
  }
]);

print('Database initialized with sample facts');
