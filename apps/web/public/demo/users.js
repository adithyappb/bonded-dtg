// Curated exactly 48 users with age-image matching heuristics.
// Men/Women randomuser images map to consistent IDs. I've curated these to realistically map 22-35.
const DEMO_USERS = [
  // Block 1 - Age 22-25
  { id: 1, gender: 'men', imgId: 1, age: 24, name: 'James', bio: 'Love exploring new cities and finding the best coffee spots.', interests: ['Coffee', 'Travel'], ghostScore: 12, balance: '0.45' },
  { id: 2, gender: 'women', imgId: 2, age: 23, name: 'Mary', bio: 'Just a normal person looking for a real connection.', interests: ['Art', 'Museums'], ghostScore: 34, balance: '1.20' },
  { id: 3, gender: 'men', imgId: 3, age: 25, name: 'John', bio: 'Tech enthusiast by day, aspiring chef by night.', interests: ['Web3', 'Tech', 'Cooking'], ghostScore: 4, balance: '2.50' },
  { id: 4, gender: 'women', imgId: 4, age: 22, name: 'Patricia', bio: 'Looking for someone to go to concerts with.', interests: ['Music', 'Festivals'], ghostScore: 41, balance: '0.15' },
  { id: 5, gender: 'men', imgId: 5, age: 22, name: 'Robert', bio: 'Dog parent, runner, and reader.', interests: ['Dogs', 'Running'], ghostScore: 8, balance: '1.05' },
  { id: 6, gender: 'women', imgId: 6, age: 24, name: 'Jennifer', bio: 'Always planning my next trip. Let\'s travel.', interests: ['Travel', 'Photography'], ghostScore: 19, balance: '0.85' },
  { id: 7, gender: 'men', imgId: 7, age: 25, name: 'Michael', bio: 'Finance bro but I promise I\'m fun. Let\'s grab drinks.', interests: ['Finance', 'Gym'], ghostScore: 44, balance: '3.00' },
  { id: 8, gender: 'women', imgId: 8, age: 25, name: 'Linda', bio: 'Web3 builder and crypto native. Stake your dinner date.', interests: ['Web3', 'Tech'], ghostScore: 2, balance: '4.20' },

  // Block 2 - Age 26-28
  { id: 9, gender: 'men', imgId: 11, age: 26, name: 'William', bio: 'I probably swipe right for your dog.', interests: ['Dogs', 'Hiking'], ghostScore: 25, balance: '0.35' },
  { id: 10, gender: 'women', imgId: 12, age: 27, name: 'Elizabeth', bio: 'Let\'s grab a drink and see what happens.', interests: ['Foodie', 'Wine'], ghostScore: 11, balance: '1.50' },
  { id: 11, gender: 'men', imgId: 13, age: 28, name: 'David', bio: 'In search of the perfect slice of pizza.', interests: ['Foodie', 'Cooking'], ghostScore: 5, balance: '0.95' },
  { id: 12, gender: 'women', imgId: 14, age: 26, name: 'Barbara', bio: 'Art, museums, and indie music.', interests: ['Art', 'Design'], ghostScore: 33, balance: '0.25' },
  { id: 13, gender: 'men', imgId: 15, age: 27, name: 'Richard', bio: 'Love exploring new cities.', interests: ['Travel', 'Reading'], ghostScore: 14, balance: '2.10' },
  { id: 14, gender: 'women', imgId: 16, age: 28, name: 'Susan', bio: 'Tech enthusiast looking for love.', interests: ['Web3', 'Running'], ghostScore: 9, balance: '0.65' },
  { id: 15, gender: 'men', imgId: 17, age: 26, name: 'Joseph', bio: 'Concerts and festivals.', interests: ['Music', 'Concerts'], ghostScore: 38, balance: '1.15' },
  { id: 16, gender: 'women', imgId: 18, age: 27, name: 'Jessica', bio: 'Always planning my next trip.', interests: ['Travel', 'Outdoors'], ghostScore: 17, balance: '2.80' },

  // Block 3 - Age 29-31
  { id: 17, gender: 'men', imgId: 21, age: 30, name: 'Thomas', bio: 'Finance and gym.', interests: ['Finance', 'Trading'], ghostScore: 22, balance: '5.00' },
  { id: 18, gender: 'women', imgId: 22, age: 29, name: 'Sarah', bio: 'Yoga, meditation, reading.', interests: ['Yoga', 'Meditation'], ghostScore: 3, balance: '1.45' },
  { id: 19, gender: 'men', imgId: 23, age: 31, name: 'Charles', bio: 'Web3 native looking for a partner.', interests: ['Web3', 'Tech'], ghostScore: 7, balance: '8.20' },
  { id: 20, gender: 'women', imgId: 24, age: 30, name: 'Karen', bio: 'Pizza and movies.', interests: ['Foodie', 'Design'], ghostScore: 42, balance: '0.10' },
  { id: 21, gender: 'men', imgId: 25, age: 29, name: 'Daniel', bio: 'Dog parent.', interests: ['Dogs', 'Outdoors'], ghostScore: 15, balance: '1.75' },
  { id: 22, gender: 'women', imgId: 26, age: 31, name: 'Lisa', bio: 'Let\'s travel together.', interests: ['Travel', 'Photography'], ghostScore: 28, balance: '0.90' },
  { id: 23, gender: 'men', imgId: 27, age: 30, name: 'Matthew', bio: 'Drinks and fun.', interests: ['Foodie', 'Wine'], ghostScore: 36, balance: '3.30' },
  { id: 24, gender: 'women', imgId: 28, age: 29, name: 'Nancy', bio: 'Art and museums.', interests: ['Art', 'Museums'], ghostScore: 10, balance: '1.10' },

  // Block 4 - Age 32-35
  { id: 25, gender: 'men', imgId: 31, age: 33, name: 'Anthony', bio: 'Looking for real connection.', interests: ['Reading', 'Yoga'], ghostScore: 6, balance: '2.25' },
  { id: 26, gender: 'women', imgId: 32, age: 32, name: 'Sandra', bio: 'Aspiring chef.', interests: ['Cooking', 'Foodie'], ghostScore: 18, balance: '1.80' },
  { id: 27, gender: 'men', imgId: 33, age: 34, name: 'Mark', bio: 'Tech enthusiast.', interests: ['Tech', 'Web3'], ghostScore: 12, balance: '4.50' },
  { id: 28, gender: 'women', imgId: 34, age: 35, name: 'Ashley', bio: 'Music and festivals.', interests: ['Music', 'Festivals'], ghostScore: 31, balance: '0.55' },
  { id: 29, gender: 'men', imgId: 35, age: 32, name: 'Paul', bio: 'Runner and reader.', interests: ['Running', 'Reading'], ghostScore: 21, balance: '1.30' },
  { id: 30, gender: 'women', imgId: 36, age: 34, name: 'Kimberly', bio: 'Always planning next trip.', interests: ['Travel', 'Outdoors'], ghostScore: 27, balance: '2.95' },
  { id: 31, gender: 'men', imgId: 37, age: 35, name: 'Steven', bio: 'Finance bro.', interests: ['Finance', 'Gym'], ghostScore: 39, balance: '6.10' },
  { id: 32, gender: 'women', imgId: 38, age: 33, name: 'Donna', bio: 'Crypto native.', interests: ['Web3', 'Design'], ghostScore: 4, balance: '3.75' },

  // Block 5 - Age 23-27 (Expanding Dataset)
  { id: 33, gender: 'men', imgId: 41, age: 24, name: 'Andrew', bio: 'Swipe right for dog.', interests: ['Dogs', 'Hiking'], ghostScore: 16, balance: '0.80' },
  { id: 34, gender: 'women', imgId: 42, age: 25, name: 'Emily', bio: 'Drinks and adventures.', interests: ['Foodie', 'Travel'], ghostScore: 24, balance: '1.40' },
  { id: 35, gender: 'men', imgId: 43, age: 27, name: 'Kenneth', bio: 'Perfect slice of pizza.', interests: ['Foodie', 'Cooking'], ghostScore: 8, balance: '2.05' },
  { id: 36, gender: 'women', imgId: 44, age: 26, name: 'Michelle', bio: 'Indie music and art.', interests: ['Art', 'Music'], ghostScore: 35, balance: '0.45' },
  { id: 37, gender: 'men', imgId: 45, age: 25, name: 'Joshua', bio: 'Exploring cities.', interests: ['Travel', 'Photography'], ghostScore: 13, balance: '1.95' },
  { id: 38, gender: 'women', imgId: 46, age: 24, name: 'Carol', bio: 'Love tech and web3.', interests: ['Web3', 'Tech'], ghostScore: 1, balance: '5.50' },
  { id: 39, gender: 'men', imgId: 47, age: 26, name: 'Kevin', bio: 'Festivals.', interests: ['Music', 'Concerts'], ghostScore: 43, balance: '0.20' },
  { id: 40, gender: 'women', imgId: 48, age: 27, name: 'Amanda', bio: 'Next trip planned.', interests: ['Travel', 'Reading'], ghostScore: 20, balance: '1.65' },

  // Block 6 - Age 28-33 (Expanding Dataset)
  { id: 41, gender: 'men', imgId: 51, age: 29, name: 'Brian', bio: 'Finance and gym.', interests: ['Finance', 'Trading'], ghostScore: 26, balance: '3.80' },
  { id: 42, gender: 'women', imgId: 52, age: 30, name: 'Melissa', bio: 'Yoga and meditation.', interests: ['Yoga', 'Meditation'], ghostScore: 5, balance: '2.15' },
  { id: 43, gender: 'men', imgId: 53, age: 31, name: 'George', bio: 'Web3 builder.', interests: ['Web3', 'Tech'], ghostScore: 11, balance: '4.90' },
  { id: 44, gender: 'women', imgId: 54, age: 28, name: 'Deborah', bio: 'Pizza enthusiast.', interests: ['Foodie', 'Wine'], ghostScore: 37, balance: '0.70' },
  { id: 45, gender: 'men', imgId: 55, age: 33, name: 'Edward', bio: 'Dog dad.', interests: ['Dogs', 'Outdoors'], ghostScore: 19, balance: '1.25' },
  { id: 46, gender: 'women', imgId: 56, age: 32, name: 'Stephanie', bio: 'Travel together.', interests: ['Travel', 'Design'], ghostScore: 29, balance: '2.60' },
  { id: 47, gender: 'men', imgId: 57, age: 30, name: 'Ronald', bio: 'Drinks and fun.', interests: ['Foodie', 'Cooking'], ghostScore: 32, balance: '1.55' },
  { id: 48, gender: 'women', imgId: 58, age: 31, name: 'Rebecca', bio: 'Museum lover.', interests: ['Art', 'Museums'], ghostScore: 8, balance: '3.20' }
];

const generateHex = (len) => Array.from({length: len}, () => Math.floor(Math.random()*16).toString(16)).join('');

window.DEMO_USERS = DEMO_USERS.map(u => ({
  id: u.id,
  username: `user_${u.id}`,
  displayName: u.name,
  age: u.age,
  bio: u.bio,
  interests: u.interests,
  ghostScore: u.ghostScore,
  walletAddress: `0x${generateHex(4)}...${generateHex(4)}`, // Standardized fake ENS/Hex
  walletBalance: u.balance,
  profileImage: `https://randomuser.me/api/portraits/${u.gender}/${u.imgId}.jpg`
}));
