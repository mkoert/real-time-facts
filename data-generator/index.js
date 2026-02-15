const fetch = require('node-fetch');

const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:3001';
const INTERVAL_MS = parseInt(process.env.GENERATOR_INTERVAL_MS) || 3000;
const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;

const facts = [
  // Nature
  { text: "A single tree can absorb up to 48 pounds of carbon dioxide per year.", category: "nature" },
  { text: "The Amazon rainforest produces about 20% of the world's oxygen.", category: "nature" },
  { text: "Bamboo can grow up to 35 inches in a single day.", category: "nature" },
  { text: "Lightning strikes the Earth about 8 million times per day.", category: "nature" },
  { text: "The deepest point in the ocean is about 36,000 feet deep.", category: "nature" },
  { text: "A cloud can weigh more than a million pounds.", category: "nature" },
  { text: "Rainforests cover only 6% of Earth's surface but contain over half of the world's plant and animal species.", category: "nature" },
  { text: "The oldest known tree is over 5,000 years old.", category: "nature" },

  // Animals
  { text: "Octopuses have three hearts and blue blood.", category: "animals" },
  { text: "A hummingbird's heart beats up to 1,200 times per minute.", category: "animals" },
  { text: "Dolphins sleep with one eye open.", category: "animals" },
  { text: "Elephants are the only animals that can't jump.", category: "animals" },
  { text: "A snail can sleep for three years.", category: "animals" },
  { text: "Koalas sleep up to 22 hours a day.", category: "animals" },
  { text: "A group of owls is called a parliament.", category: "animals" },
  { text: "Butterflies taste with their feet.", category: "animals" },
  { text: "Crows can recognize human faces and hold grudges.", category: "animals" },
  { text: "A blue whale's heart is the size of a small car.", category: "animals" },

  // History
  { text: "Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.", category: "history" },
  { text: "Oxford University is older than the Aztec Empire.", category: "history" },
  { text: "The first computer programmer was a woman named Ada Lovelace.", category: "history" },
  { text: "Vikings used to give kittens to new brides as essential household gifts.", category: "history" },
  { text: "Ancient Romans used crushed mouse brains as toothpaste.", category: "history" },
  { text: "The Great Wall of China is not visible from space with the naked eye.", category: "history" },
  { text: "Napoleon was once attacked by a horde of rabbits.", category: "history" },
  { text: "The shortest presidency in US history lasted just 32 days.", category: "history" },

  // Science
  { text: "Water can boil and freeze at the same time under certain conditions.", category: "science" },
  { text: "Bananas are radioactive due to their potassium content.", category: "science" },
  { text: "Hot water freezes faster than cold water under certain conditions.", category: "science" },
  { text: "There are more atoms in a glass of water than glasses of water in all the oceans.", category: "science" },
  { text: "Sound travels about 4 times faster through water than through air.", category: "science" },
  { text: "Venus is the only planet that spins clockwise.", category: "science" },
  { text: "A teaspoon of a neutron star would weigh about 6 billion tons.", category: "science" },
  { text: "DNA can last for 1,000 years when stored properly.", category: "science" },

  // Technology
  { text: "The first computer mouse was made of wood.", category: "technology" },
  { text: "The QWERTY keyboard was designed to slow down typing.", category: "technology" },
  { text: "The first website is still online at info.cern.ch.", category: "technology" },
  { text: "More than 300 hours of video are uploaded to YouTube every minute.", category: "technology" },
  { text: "The average smartphone has more computing power than NASA used to send astronauts to the moon.", category: "technology" },
  { text: "The first email was sent in 1971.", category: "technology" },
  { text: "About 90% of the world's data was created in the last two years.", category: "technology" },
  { text: "The first computer virus was created in 1983.", category: "technology" },

  // Space
  { text: "A day on Venus is longer than a year on Venus.", category: "space" },
  { text: "There are more stars in the universe than grains of sand on Earth.", category: "space" },
  { text: "Footprints on the Moon will last for millions of years.", category: "space" },
  { text: "The Sun makes up 99.86% of the mass in our solar system.", category: "space" },
  { text: "Space is completely silent because there's no atmosphere to carry sound.", category: "space" },
  { text: "Neutron stars can spin at a rate of 600 rotations per second.", category: "space" },
  { text: "One million Earths could fit inside the Sun.", category: "space" },
  { text: "The International Space Station travels at about 17,500 mph.", category: "space" },

  // Food
  { text: "Honey is the only food that doesn't spoil.", category: "food" },
  { text: "Carrots were originally purple before the orange variety was developed.", category: "food" },
  { text: "Peanuts aren't nuts; they're legumes.", category: "food" },
  { text: "Apples float in water because they're 25% air.", category: "food" },
  { text: "Chocolate was once used as currency by the Aztecs.", category: "food" },
  { text: "Cucumbers are 96% water.", category: "food" },
  { text: "The most expensive spice in the world is saffron.", category: "food" },
  { text: "Strawberries have more vitamin C than oranges.", category: "food" },

  // Geography
  { text: "Russia has 11 time zones.", category: "geography" },
  { text: "Canada has more lakes than the rest of the world combined.", category: "geography" },
  { text: "Mount Everest grows about 4mm every year.", category: "geography" },
  { text: "Australia is wider than the Moon.", category: "geography" },
  { text: "The Sahara Desert is larger than the United States.", category: "geography" },
  { text: "There are more people living inside this circle than outside it (pointing to Asia).", category: "geography" },
  { text: "Africa is the only continent in all four hemispheres.", category: "geography" },
  { text: "The Dead Sea is so salty you can float on it without trying.", category: "geography" },

  // Sports
  { text: "Golf balls have an average of 336 dimples.", category: "sports" },
  { text: "A marathon is 26.2 miles because of the British royal family.", category: "sports" },
  { text: "Volleyball was invented in 1895 by a YMCA instructor.", category: "sports" },
  { text: "The Olympic gold medals are mostly made of silver.", category: "sports" },
  { text: "Basketball was invented with a soccer ball and peach baskets.", category: "sports" },
  { text: "Tennis players can hit the ball at over 150 mph.", category: "sports" },
  { text: "The first FIFA World Cup was held in 1930 in Uruguay.", category: "sports" },
  { text: "Michael Phelps has won more Olympic medals than most countries.", category: "sports" },

  // Art
  { text: "The Mona Lisa has no eyebrows.", category: "art" },
  { text: "Vincent van Gogh only sold one painting during his lifetime.", category: "art" },
  { text: "The Louvre is the most visited art museum in the world.", category: "art" },
  { text: "Picasso could draw before he could walk.", category: "art" },
  { text: "The Scream by Edvard Munch was inspired by a sunset.", category: "art" },
  { text: "Leonardo da Vinci could write with one hand and draw with the other simultaneously.", category: "art" },
  { text: "The color wheel was invented by Isaac Newton.", category: "art" },
  { text: "Salvador Dali designed the Chupa Chups logo.", category: "art" }
];

let usedIndices = new Set();
let accessToken = null;
let tokenExpiresAt = null;

function getRandomFact() {
  if (usedIndices.size >= facts.length) {
    usedIndices.clear();
  }

  let index;
  do {
    index = Math.floor(Math.random() * facts.length);
  } while (usedIndices.has(index));

  usedIndices.add(index);
  return facts[index];
}

async function getToken() {

  if (accessToken && tokenExpiresAt && Date.now() < tokenExpiresAt - 60000) {
    return accessToken;
  }

  const response = await fetch(`${BACKEND_URL}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: OAUTH_CLIENT_ID,
      client_secret: OAUTH_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    throw new Error(`Token request failed: ${response.status} ${response.message}`);
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiresAt = new Date(data.access_token_expires_at).getTime();
  console.log(`[${new Date().toISOString()}] Obtained OAuth2 access token`);
  return accessToken;
}

async function sendFact() {
  const fact = getRandomFact();

  try {
    const token = await getToken();
    const response = await fetch(`${BACKEND_URL}/api/facts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        text: fact.text,
        category: fact.category,
        source: 'generator'
      }),
    });

    if (response.ok) {
      console.log(`[${new Date().toISOString()}] Sent fact: "${fact.text.substring(0, 50)}..." (${fact.category})`);
    } else if (response.status === 401) {
      accessToken = null;
      tokenExpiresAt = null;
      console.error(`[${new Date().toISOString()}] Auth failed, will retry with new token`);
    } else {
      console.error(`[${new Date().toISOString()}] Failed to send fact: ${response.status}`);
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error sending fact:`, error.message);
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Facts Generator Started');
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Interval: ${INTERVAL_MS}ms`);
  console.log(`Total facts available: ${facts.length}`);
  console.log(`OAuth2 client: ${OAUTH_CLIENT_ID ? 'configured' : 'NOT configured'}`);
  console.log('='.repeat(60));

  await new Promise(resolve => setTimeout(resolve, 45000));

  await sendFact();

  setInterval(sendFact, INTERVAL_MS);
}

main().catch(console.error);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Generator shutting down...');
  process.exit(0);
});
