import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, VolumeX, ArrowLeft, Check, Award, BookOpen, Sparkles, 
  Mic, PenTool, Book, RefreshCw, Play, CheckCircle, MessageSquare, Trophy, Star
} from 'lucide-react';
import SoundEngine from './shared/soundEngine';
import { eventBus } from './shared/eventBus';

// Vocabulary Data categorized by difficulty tiers
const VOCABULARY_WORDS = [
  // --- EASY TIER: KG & Grade 1 ---
  {
    word: "Apple",
    meaning: "A crunchy round fruit that can be red, green, or yellow.",
    example: "I love eating a crunchy red apple.",
    category: "Food",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop",
    gradeGroup: "easy",
    emoji: "🍎"
  },
  {
    word: "Banana",
    meaning: "A long yellow fruit that is sweet and soft inside.",
    example: "Peel the banana before you eat it.",
    category: "Food",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop",
    gradeGroup: "easy",
    emoji: "🍌"
  },
  {
    word: "Milk",
    meaning: "A healthy white liquid we drink to build strong bones.",
    example: "I drink a glass of fresh milk every morning.",
    category: "Food",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop",
    gradeGroup: "easy",
    emoji: "🥛"
  },
  {
    word: "Orange",
    meaning: "A round citrus fruit with a sweet and sour juice.",
    example: "He drank a glass of freshly squeezed orange juice.",
    category: "Food",
    image: "https://images.unsplash.com/photo-1547514701-42782101795e?w=400&auto=format&fit=crop",
    gradeGroup: "easy",
    emoji: "🍊"
  },
  {
    word: "Grape",
    meaning: "A small, sweet round fruit that grows in clusters on vines.",
    example: "She popped a juicy purple grape into her mouth.",
    category: "Food",
    image: "https://images.unsplash.com/photo-1423483641154-5411ec9c0ddf?w=400&auto=format&fit=crop",
    gradeGroup: "easy",
    emoji: "🍇"
  },
  {
    word: "Cake",
    meaning: "A sweet baked dessert often decorated with frosting for birthdays.",
    example: "We blew out the candles on the birthday cake.",
    category: "Food",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop",
    gradeGroup: "easy",
    emoji: "🍰"
  },
  {
    word: "Cat",
    meaning: "A fluffy pet animal that says meow and chases mice.",
    example: "The orange cat is sleeping on the rug.",
    category: "Animals",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop",
    gradeGroup: "easy",
    emoji: "🐱"
  },
  {
    word: "Dog",
    meaning: "A friendly pet animal that barks and wags its tail.",
    example: "Our dog Buddy loves to play catch with a ball.",
    category: "Animals",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&auto=format&fit=crop",
    gradeGroup: "easy",
    emoji: "🐶"
  },
  {
    word: "Lion",
    meaning: "A large wild cat known as the king of the jungle.",
    example: "The brave lion let out a loud roar.",
    category: "Animals",
    image: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=400&auto=format&fit=crop",
    gradeGroup: "easy",
    emoji: "🦁"
  },
  {
    word: "Cow",
    meaning: "A farm animal that eats grass and provides us with milk.",
    example: "The black and white cow stood in the green field.",
    category: "Animals",
    image: "https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=400&auto=format&fit=crop",
    gradeGroup: "easy",
    emoji: "🐄"
  },
  {
    word: "Duck",
    meaning: "A water bird with webbed feet that makes a quack sound.",
    example: "The yellow duck is swimming in the pond.",
    category: "Animals",
    image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&auto=format&fit=crop",
    gradeGroup: "easy",
    emoji: "🦆"
  },
  {
    word: "Bird",
    meaning: "A feathered animal with wings that can fly in the sky.",
    example: "A blue bird is singing on the tree branch.",
    category: "Animals",
    image: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400&auto=format&fit=crop",
    gradeGroup: "easy",
    emoji: "🐦"
  },
  {
    word: "Book",
    meaning: "Pages bound together that tell a story or teach things.",
    example: "I am reading a story book about space.",
    category: "School",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop",
    gradeGroup: "easy",
    emoji: "📖"
  },
  {
    word: "Pencil",
    meaning: "A wooden tool with graphite used for writing or drawing.",
    example: "Use your yellow pencil to write your name.",
    category: "School",
    image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&auto=format&fit=crop",
    gradeGroup: "easy",
    emoji: "✏️"
  },
  {
    word: "Desk",
    meaning: "A flat table where we sit to read, write, or work.",
    example: "Place your notebook neatly on your desk.",
    category: "School",
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&auto=format&fit=crop",
    gradeGroup: "easy",
    emoji: "🏫"
  },
  {
    word: "Bag",
    meaning: "A flexible container used to carry school supplies and books.",
    example: "She packed her pencils and notebooks into her bag.",
    category: "School",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop",
    gradeGroup: "easy",
    emoji: "🎒"
  },
  {
    word: "Ruler",
    meaning: "A straight strip of wood or plastic used to measure distance.",
    example: "He drew a straight line using his wooden ruler.",
    category: "School",
    image: "https://images.unsplash.com/photo-1609042597870-c78dbe99d6b6?w=400&auto=format&fit=crop",
    gradeGroup: "easy",
    emoji: "📏"
  },
  {
    word: "Car",
    meaning: "A road vehicle with four wheels powered by an engine.",
    example: "My family drives a blue car to the park.",
    category: "Travel",
    image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&auto=format&fit=crop",
    gradeGroup: "easy",
    emoji: "🚗"
  },
  {
    word: "Bus",
    meaning: "A large motor vehicle designed to carry many passengers.",
    example: "The yellow school bus stops at our corner.",
    category: "Travel",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&auto=format&fit=crop",
    gradeGroup: "easy",
    emoji: "🚌"
  },
  {
    word: "Train",
    meaning: "A series of connected railway carriages pulled by an engine.",
    example: "The train clicked along the steel tracks.",
    category: "Travel",
    image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&auto=format&fit=crop",
    gradeGroup: "easy",
    emoji: "🚆"
  },
  {
    word: "Boat",
    meaning: "A small vehicle for traveling on water like lakes or rivers.",
    example: "We went fishing in a small wooden boat.",
    category: "Travel",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&auto=format&fit=crop",
    gradeGroup: "easy",
    emoji: "⛵"
  },
  {
    word: "Bike",
    meaning: "A two-wheeled vehicle you ride by pushing foot pedals.",
    example: "She rode her new bike around the playground.",
    category: "Travel",
    image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&auto=format&fit=crop",
    gradeGroup: "easy",
    emoji: "🚲"
  },
  {
    word: "Phone",
    meaning: "A device used to speak to people far away.",
    example: "She called her grandmother on the phone.",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400&auto=format&fit=crop",
    gradeGroup: "easy",
    emoji: "📞"
  },
  {
    word: "TV",
    meaning: "A screen that shows moving pictures and sounds.",
    example: "We watch educational cartoons on the TV.",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&auto=format&fit=crop",
    gradeGroup: "easy",
    emoji: "📺"
  },
  {
    word: "Clock",
    meaning: "A tool that shows what time of day it is.",
    example: "The wall clock says it is exactly three o'clock.",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=400&auto=format&fit=crop",
    gradeGroup: "easy",
    emoji: "⏰"
  },
  {
    word: "Radio",
    meaning: "A device that plays music, news, and stories through sound waves.",
    example: "My grandfather listens to local news on his old radio.",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1603539947678-cd3954ed515d?w=400&auto=format&fit=crop",
    gradeGroup: "easy",
    emoji: "📻"
  },

  // --- MEDIUM TIER: Grade 2 & Grade 3 ---
  {
    word: "Cheese",
    meaning: "A dairy food made from pressed milk curds.",
    example: "I love melty yellow cheese on my sandwich.",
    category: "Food",
    image: "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400&auto=format&fit=crop",
    gradeGroup: "medium",
    emoji: "🧀"
  },
  {
    word: "Honey",
    meaning: "A sweet, sticky golden liquid made by busy honeybees.",
    example: "Drizzle some honey onto your warm oatmeal.",
    category: "Food",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&auto=format&fit=crop",
    gradeGroup: "medium",
    emoji: "🍯"
  },
  {
    word: "Salad",
    meaning: "A healthy mixture of raw vegetables or fresh fruits.",
    example: "A fresh green salad with cucumbers is refreshing.",
    category: "Food",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop",
    gradeGroup: "medium",
    emoji: "🥗"
  },
  {
    word: "Butter",
    meaning: "A solid yellow dairy product made by churning cream or milk.",
    example: "She spread creamy butter on the warm toast.",
    category: "Food",
    image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&auto=format&fit=crop",
    gradeGroup: "medium",
    emoji: "🧈"
  },
  {
    word: "Mango",
    meaning: "A sweet tropical fruit with a yellow-orange flesh and a large seed.",
    example: "We sliced a fresh mango for our afternoon snack.",
    category: "Food",
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&auto=format&fit=crop",
    gradeGroup: "medium",
    emoji: "🥭"
  },
  {
    word: "Cookie",
    meaning: "A small baked sweet treat, often containing chocolate chips.",
    example: "Grandma baked a batch of chocolate chip cookies.",
    category: "Food",
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&auto=format&fit=crop",
    gradeGroup: "medium",
    emoji: "🍪"
  },
  {
    word: "Elephant",
    meaning: "A very large wild mammal with thick skin, tusks, and a trunk.",
    example: "The elephant sprayed water over its back with its trunk.",
    category: "Animals",
    image: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&auto=format&fit=crop",
    gradeGroup: "medium",
    emoji: "🐘"
  },
  {
    word: "Dolphin",
    meaning: "A highly intelligent aquatic mammal that breathes air.",
    example: "The dolphin leaped high out of the sparkling ocean waves.",
    category: "Animals",
    image: "https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=400&auto=format&fit=crop",
    gradeGroup: "medium",
    emoji: "🐬"
  },
  {
    word: "Giraffe",
    meaning: "A tall African mammal with a very long neck and patterned coat.",
    example: "The giraffe reached high to eat leaves from the tall trees.",
    category: "Animals",
    image: "https://images.unsplash.com/photo-1547721064-da6cfb341d50?w=400&auto=format&fit=crop",
    gradeGroup: "medium",
    emoji: "🦒"
  },
  {
    word: "Penguin",
    meaning: "A flightless sea bird of the southern hemisphere with black-and-white plumage.",
    example: "The emperor penguin waddled across the frozen ice sheets.",
    category: "Animals",
    image: "https://images.unsplash.com/photo-1551986782-d0169b3f8fa7?w=400&auto=format&fit=crop",
    gradeGroup: "medium",
    emoji: "🐧"
  },
  {
    word: "Monkey",
    meaning: "A clever wild animal with a long tail that climbs trees.",
    example: "The mischievous monkey swung from branch to branch.",
    category: "Animals",
    image: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=400&auto=format&fit=crop",
    gradeGroup: "medium",
    emoji: "🐒"
  },
  {
    word: "Kangaroo",
    meaning: "An Australian mammal with strong hind legs for hopping.",
    example: "The mother kangaroo carried her small joey in her pouch.",
    category: "Animals",
    image: "https://images.unsplash.com/photo-1574068468668-a05a11f871da?w=400&auto=format&fit=crop",
    gradeGroup: "medium",
    emoji: "🦘"
  },
  {
    word: "Teacher",
    meaning: "A guide who helps students gain knowledge and skills.",
    example: "Our school teacher taught us about history today.",
    category: "School",
    image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&auto=format&fit=crop",
    gradeGroup: "medium",
    emoji: "👩‍🏫"
  },
  {
    word: "Library",
    meaning: "A room containing collections of books and resources to read.",
    example: "The community library is a quiet place to read.",
    category: "School",
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&auto=format&fit=crop",
    gradeGroup: "medium",
    emoji: "🏛️"
  },
  {
    word: "Globe",
    meaning: "A spherical representation of the Earth or sky map.",
    example: "Spin the globe to locate where we live.",
    category: "School",
    image: "https://images.unsplash.com/photo-1589519160732-576f165b9c74?w=400&auto=format&fit=crop",
    gradeGroup: "medium",
    emoji: "🌐"
  },
  {
    word: "Calculator",
    meaning: "An electronic tool used for solving math calculations.",
    example: "We solved the long division problem using a calculator.",
    category: "School",
    image: "https://images.unsplash.com/photo-1564939558297-fc396f18e5c7?w=400&auto=format&fit=crop",
    gradeGroup: "medium",
    emoji: "🧮"
  },
  {
    word: "Notebook",
    meaning: "A book with blank pages for writing down school notes.",
    example: "He wrote down the science vocabulary in his notebook.",
    category: "School",
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&auto=format&fit=crop",
    gradeGroup: "medium",
    emoji: "📓"
  },
  {
    word: "Airplane",
    meaning: "A large powered flying vehicle with fixed wings.",
    example: "The silver airplane soared above the puffy white clouds.",
    category: "Travel",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&auto=format&fit=crop",
    gradeGroup: "medium",
    emoji: "✈️"
  },
  {
    word: "Bicycle",
    meaning: "A light vehicle with two wheels that you pedal with your feet.",
    example: "I ride my red bicycle around the neighborhood track.",
    category: "Travel",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop",
    gradeGroup: "medium",
    emoji: "🚲"
  },
  {
    word: "Luggage",
    meaning: "Bags and suitcases packed for a trip or holiday travel.",
    example: "We loaded our heavy luggage into the car trunk.",
    category: "Travel",
    image: "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=400&auto=format&fit=crop",
    gradeGroup: "medium",
    emoji: "🧳"
  },
  {
    word: "Helicopter",
    meaning: "An aircraft with overhead rotating blades that can hover in place.",
    example: "The rescue helicopter landed safely on the hospital roof.",
    category: "Travel",
    image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400&auto=format&fit=crop",
    gradeGroup: "medium",
    emoji: "🚁"
  },
  {
    word: "Subway",
    meaning: "An underground railway system for rapid transport in cities.",
    example: "We took the fast subway to reach the downtown museum.",
    category: "Travel",
    image: "https://images.unsplash.com/photo-1617360564500-c5a01f74b5c9?w=400&auto=format&fit=crop",
    gradeGroup: "medium",
    emoji: "🚇"
  },
  {
    word: "Computer",
    meaning: "An electronic machine that stores, processes, and displays data.",
    example: "We use a desktop computer to search for science projects.",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&auto=format&fit=crop",
    gradeGroup: "medium",
    emoji: "💻"
  },
  {
    word: "Tablet",
    meaning: "A flat, portable computer with a touchscreen display.",
    example: "The tablet lets me draw digital pictures with a stylus.",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&auto=format&fit=crop",
    gradeGroup: "medium",
    emoji: "📱"
  },
  {
    word: "Camera",
    meaning: "A device used to capture photographs or record videos.",
    example: "She pointed the camera to take a photo of the sunrise.",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&auto=format&fit=crop",
    gradeGroup: "medium",
    emoji: "📷"
  },
  {
    word: "Laptop",
    meaning: "A folding, portable computer that is convenient to travel with.",
    example: "My father works on his laptop computer while on the train.",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&auto=format&fit=crop",
    gradeGroup: "medium",
    emoji: "💻"
  },
  {
    word: "Headphones",
    meaning: "A pair of small speakers worn on the ears to listen to private audio.",
    example: "She plugged in her headphones to listen to the audio story.",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop",
    gradeGroup: "medium",
    emoji: "🎧"
  },

  // --- HARD TIER: Grade 4 ---
  {
    word: "Ingredients",
    meaning: "The distinct food elements combined to prepare a dish.",
    example: "Flour, sugar, and butter are key baking ingredients.",
    category: "Food",
    image: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&auto=format&fit=crop",
    gradeGroup: "hard",
    emoji: "🥣"
  },
  {
    word: "Nutritious",
    meaning: "Containing vitamins and minerals that promote health and growth.",
    example: "Vegetables and nuts are highly nutritious snacks.",
    category: "Food",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&auto=format&fit=crop",
    gradeGroup: "hard",
    emoji: "🥗"
  },
  {
    word: "Vegetation",
    meaning: "Plants and plant life considered collectively in a particular area.",
    example: "The tropical rainforest is known for its lush, green vegetation.",
    category: "Food",
    image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&auto=format&fit=crop",
    gradeGroup: "hard",
    emoji: "🌿"
  },
  {
    word: "Preservative",
    meaning: "A substance used to prevent food from decaying or spoiling.",
    example: "Many canned foods contain natural preservatives like salt.",
    category: "Food",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop",
    gradeGroup: "hard",
    emoji: "🥫"
  },
  {
    word: "Camouflage",
    meaning: "Disguising coloring or patterns that help blend into surroundings.",
    example: "A chameleon uses camouflage to hide from forest predators.",
    category: "Animals",
    image: "https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?w=400&auto=format&fit=crop",
    gradeGroup: "hard",
    emoji: "🦎"
  },
  {
    word: "Migration",
    meaning: "Seasonal movement of animals from one region to another.",
    example: "Monarch butterfly migration covers thousands of miles.",
    category: "Animals",
    image: "https://images.unsplash.com/photo-1516908205727-40afad9449a8?w=400&auto=format&fit=crop",
    gradeGroup: "hard",
    emoji: "🦅"
  },
  {
    word: "Predator",
    meaning: "An animal that naturally preys on other animals for food.",
    example: "The tiger is a fierce predator hunting in the tall grass.",
    category: "Animals",
    image: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=400&auto=format&fit=crop",
    gradeGroup: "hard",
    emoji: "🐅"
  },
  {
    word: "Herbivore",
    meaning: "An animal that feeds primarily or exclusively on plants.",
    example: "Koalas and deer are herbivores that feed on leaves and twigs.",
    category: "Animals",
    image: "https://images.unsplash.com/photo-1484406566174-9da000fda645?w=400&auto=format&fit=crop",
    gradeGroup: "hard",
    emoji: "🦌"
  },
  {
    word: "Graduation",
    meaning: "The ceremony of receiving a diploma or completing school.",
    example: "The class celebrated their elementary school graduation.",
    category: "School",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&auto=format&fit=crop",
    gradeGroup: "hard",
    emoji: "🎓"
  },
  {
    word: "Experiment",
    meaning: "A scientific test carried out to learn or prove a hypothesis.",
    example: "Our chemistry class performed a water purification experiment.",
    category: "School",
    image: "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=400&auto=format&fit=crop",
    gradeGroup: "hard",
    emoji: "🧪"
  },
  {
    word: "Curriculum",
    meaning: "The subjects comprising a complete course of study in school.",
    example: "The elementary school curriculum includes mathematics and science.",
    category: "School",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop",
    gradeGroup: "hard",
    emoji: "📚"
  },
  {
    word: "Scholarship",
    meaning: "A financial grant awarded to support a student's education.",
    example: "She earned a prestigious scholarship for her science invention.",
    category: "School",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&auto=format&fit=crop",
    gradeGroup: "hard",
    emoji: "🏆"
  },
  {
    word: "Destination",
    meaning: "The final place to which someone or something is traveling.",
    example: "Our vacation destination was a tropical island.",
    category: "Travel",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop",
    gradeGroup: "hard",
    emoji: "🏝️"
  },
  {
    word: "Expedition",
    meaning: "A journey undertaken by a group with a specific research goal.",
    example: "The scientists embarked on a polar ocean expedition.",
    category: "Travel",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&auto=format&fit=crop",
    gradeGroup: "hard",
    emoji: "🏔️"
  },
  {
    word: "Navigation",
    meaning: "The skill or process of plotting and directing a vehicle's route.",
    example: "The sailor used compass navigation to cross the ocean.",
    category: "Travel",
    image: "https://images.unsplash.com/photo-1569230919100-d3fd5e1132f4?w=400&auto=format&fit=crop",
    gradeGroup: "hard",
    emoji: "🧭"
  },
  {
    word: "Itinerary",
    meaning: "A detailed plan or route for a travel trip or journey.",
    example: "Our travel itinerary included three cities and five museums.",
    category: "Travel",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&auto=format&fit=crop",
    gradeGroup: "hard",
    emoji: "📅"
  },
  {
    word: "Smartphone",
    meaning: "A touchscreen mobile phone with internet access and applications.",
    example: "I use a smartphone to check weather forecasts.",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop",
    gradeGroup: "hard",
    emoji: "📱"
  },
  {
    word: "Electricity",
    meaning: "A form of energy resulting from the flow of charged particles.",
    example: "Lightning is a powerful natural display of electricity.",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop",
    gradeGroup: "hard",
    emoji: "⚡"
  },
  {
    word: "Automation",
    meaning: "The use of automatic machinery and technology to perform tasks.",
    example: "Factory automation increases productivity and speed.",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&auto=format&fit=crop",
    gradeGroup: "hard",
    emoji: "🤖"
  },
  {
    word: "Cybersecurity",
    meaning: "The practice of protecting electronic devices and networks from attacks.",
    example: "A strong firewall is essential for office cybersecurity.",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&auto=format&fit=crop",
    gradeGroup: "hard",
    emoji: "🔒"
  }
];

// Reading Data
const STORIES = [
  {
    id: "s1",
    title: "The Lazy Dog",
    level: "Beginner",
    gradeGroup: "easy",
    emoji: "🐶",
    content: "Once upon a time, there was a very lazy dog named Max. Max loved to sleep all day. He slept on the couch, he slept on the rug, and he slept under the table. One day, a little mouse ran past Max. Max opened one eye, looked at the mouse, and then went back to sleep. The mouse was surprised. 'Why don't you chase me?' asked the mouse. Max replied, 'I am too lazy. Sleep is better.'",
    questions: [
      { question: "What is the dog's name?", options: ["Max", "Buddy", "Charlie"], correctOptionIndex: 0 },
      { question: "What does the dog love to do?", options: ["Run", "Eat", "Sleep"], correctOptionIndex: 2 },
      { question: "What animal ran past the dog?", options: ["Cat", "Mouse", "Bird"], correctOptionIndex: 1 },
    ],
  },
  {
    id: "s2",
    title: "A Trip to the City",
    level: "Intermediate",
    gradeGroup: "medium",
    emoji: "🏙️",
    content: "Last weekend, Sarah took a train to the city. It was her first time visiting a big metropolis. The buildings were so tall they seemed to touch the clouds. She visited a museum, ate pizza at a famous restaurant, and walked through a large park. The city was noisy and crowded, but Sarah found it exciting. She took many photos to show her friends when she returned home.",
    questions: [
      { question: "How did Sarah travel to the city?", options: ["By bus", "By car", "By train"], correctOptionIndex: 2 },
      { question: "What did Sarah eat in the city?", options: ["Sushi", "Pizza", "Burger"], correctOptionIndex: 1 },
      { question: "How did Sarah feel about the city?", options: ["Excited", "Bored", "Scared"], correctOptionIndex: 0 },
    ],
  },
  {
    id: "s3",
    title: "The Mystery of the Old Clock",
    level: "Advanced",
    gradeGroup: "hard",
    emoji: "🕰️",
    content: "In the dusty attic of her grandmother's house, Lily discovered an antique grandfather clock that hadn't ticked in decades. According to family legend, the clock stopped at the exact moment a great storm swept through the town. Curious, Lily carefully wound the rusty key. To her amazement, the pendulum began to swing, and a hidden drawer popped open, revealing a faded map leading to a forgotten treasure.",
    questions: [
      { question: "Where did Lily find the clock?", options: ["In the basement", "In the attic", "In the garage"], correctOptionIndex: 1 },
      { question: "What happened when she wound the clock?", options: ["It broke", "It played music", "A hidden drawer opened"], correctOptionIndex: 2 },
      { question: "What did the family legend say about the clock?", options: ["It was cursed", "It stopped during a storm", "It belonged to a king"], correctOptionIndex: 1 },
    ],
  }
];

// Grammar Lessons
const GRAMMAR_LESSONS = [
  {
    id: "g1",
    title: "Nouns and Verbs",
    description: "Learn about the naming and action words.",
    gradeGroup: "easy",
    content: "A noun is a person, place, or thing (e.g., Cat, School, Apple). A verb is an action word (e.g., Run, Jump, Sleep).\n\nExamples:\n- The cat (noun) sleeps (verb).",
    quizzes: [
      { question: "Which word is a noun?", options: ["Run", "Apple", "Quickly"], correctOptionIndex: 1 },
      { question: "Which word is a verb?", options: ["Jump", "Blue", "Car"], correctOptionIndex: 0 },
    ],
  },
  {
    id: "g2",
    title: "Present Simple & Continuous",
    description: "Learn how to express habits vs actions happening now.",
    gradeGroup: "medium",
    content: "The Present Simple describes habits or facts (I play tennis).\nThe Present Continuous describes actions happening right now (I am reading a book).",
    quizzes: [
      { question: "Which sentence is in the Present Simple tense?", options: ["I am eating", "I eat apples", "I will eat"], correctOptionIndex: 1 },
      { question: "We ____ watching TV right now.", options: ["am", "is", "are"], correctOptionIndex: 2 },
    ],
  },
  {
    id: "g3",
    title: "Complex Sentences & Conjunctions",
    description: "Learn how to connect clauses using conjunctions.",
    gradeGroup: "hard",
    content: "A complex sentence contains an independent clause and one or more dependent clauses connected by a subordinating conjunction (because, although, since).\n\nExample:\n- Although it was raining, we went for a walk.",
    quizzes: [
      { question: "Identify the subordinating conjunction:", options: ["And", "Although", "But"], correctOptionIndex: 1 },
      { question: "Which is a complex sentence?", options: ["I ran fast.", "I slept because I was tired.", "The cat sat on the mat."], correctOptionIndex: 1 },
    ],
  },
];

// Writing Prompts
const WRITING_PROMPTS = [
  { text: "Write about your favorite toy.", gradeGroup: "easy" },
  { text: "Describe your pet or an animal you like.", gradeGroup: "easy" },
  { text: "Describe a memorable trip you took with your family.", gradeGroup: "medium" },
  { text: "Write a short paragraph about your favorite hobby.", gradeGroup: "medium" },
  { text: "Write an essay on the importance of protecting the environment.", gradeGroup: "hard" },
  { text: "If you could invent a new machine, what would it do? Describe it.", gradeGroup: "hard" }
];

// Target Speaking Sentences
const SPEAKING_SENTENCES = [
  { text: "I see a red apple.", gradeGroup: "easy" },
  { text: "The dog is playing.", gradeGroup: "easy" },
  { text: "Reading books opens new worlds for us.", gradeGroup: "medium" },
  { text: "Learning new words is a wonderful adventure.", gradeGroup: "medium" },
  { text: "The intricacies of grammatical structures can be quite fascinating.", gradeGroup: "hard" },
  { text: "Technological advancements significantly impact our daily communication.", gradeGroup: "hard" }
];

// Helper for grading
const getGradeGroup = (g) => {
  if (g === 'KG' || g === 'Grade 1') return 'easy';
  if (g === 'Grade 2' || g === 'Grade 3') return 'medium';
  return 'hard'; // Grade 4
};

export default function EnglishAIModule({
  studentId = 'student_123',
  onExit = null
}) {
  const [activeTab, setActiveTab] = useState('vocab'); // vocab | reading | grammar | writing | speaking
  const [muted, setMuted] = useState(false);
  const [stars, setStars] = useState(() => {
    return parseInt(localStorage.getItem(`educare_stars_${studentId}`) || '15');
  });
  const [xp, setXp] = useState(0);

  // Active Grade Sync
  const [activeGrade, setActiveGrade] = useState(() => {
    return localStorage.getItem(`educare_grade_${studentId}`) || 'KG';
  });

  useEffect(() => {
    const unsubscribe = eventBus.subscribe('GRADE_CHANGED', (data) => {
      if (data && data.grade) {
        setActiveGrade(data.grade);
      }
    });
    return unsubscribe;
  }, []);

  // Speech Ref
  const synthRef = useRef(window.speechSynthesis);
  const [voice, setVoice] = useState(null);

  // Initialize Speech Synthesis voice
  useEffect(() => {
    const loadVoices = () => {
      if (!synthRef.current) return;
      const voices = synthRef.current.getVoices();
      const chosenVoice = voices.find(v => v.lang.includes('en') && 
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Zira') || v.name.includes('Samantha'))
      ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
      setVoice(chosenVoice);
    };

    loadVoices();
    if (synthRef.current) {
      synthRef.current.onvoiceschanged = loadVoices;
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const speak = (text) => {
    if (muted || !synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) {
      utterance.voice = voice;
    }
    utterance.pitch = 1.3;
    utterance.rate = 0.95;
    synthRef.current.speak(utterance);
  };

  // Star award notifier helper
  const earnRewards = (starsCount, xpCount) => {
    SoundEngine.playSuccess();
    const nextStars = stars + starsCount;
    setStars(nextStars);
    setXp(prev => prev + xpCount);
    
    // Sync globally
    localStorage.setItem(`educare_stars_${studentId}`, nextStars.toString());
    eventBus.publish('STARS_UPDATED', { stars: nextStars });
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 select-none font-sans">
      
      {/* Header Panel */}
      <header className="flex justify-between items-center bg-slate-900 text-white border-4 border-slate-800 p-4 rounded-3xl mb-6 shadow-cartoon">
        <div className="flex items-center gap-3">
          {onExit && (
            <button 
              onClick={onExit} 
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl border-2 border-slate-700 active:translate-y-0.5 shadow-cartoon-sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-lg font-black flex items-center gap-1.5">
              📚 Astra English AI Lab <span className="text-xs bg-rose-500 px-2 py-0.5 rounded-full font-bold uppercase">Language</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Unified Literacy Workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              SoundEngine.playPop();
              setMuted(!muted);
              if (synthRef.current && !muted) synthRef.current.cancel();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
          >
            {muted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-rose-300" />}
          </button>
          
          <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-2xl text-xs font-black">
            <Star className="w-4 h-4 fill-amber-300" />
            <span>{stars} Stars</span>
          </div>

          <div className="flex items-center gap-1.5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 px-3 py-1 rounded-2xl text-xs font-black">
            <Trophy className="w-4 h-4" />
            <span>{xp} XP</span>
          </div>
        </div>
      </header>

      {/* Primary Tab Navigation */}
      <nav className="flex flex-wrap gap-2.5 justify-center mb-6">
        {[
          { id: 'vocab', label: 'Flashcards', icon: Sparkles, color: 'bg-rose-500 border-rose-700 text-rose-950' },
          { id: 'reading', label: 'Reading Stories', icon: BookOpen, color: 'bg-emerald-500 border-emerald-700 text-emerald-950' },
          { id: 'grammar', label: 'Grammar lessons', icon: Book, color: 'bg-amber-500 border-amber-700 text-amber-950' },
          { id: 'writing', label: 'Writing prompts', icon: PenTool, color: 'bg-purple-500 border-purple-700 text-purple-950' },
          { id: 'speaking', label: 'Speaking Coach', icon: Mic, color: 'bg-indigo-500 border-indigo-700 text-indigo-950' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                SoundEngine.playPop();
                setActiveTab(tab.id);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 border-3 rounded-2xl font-black text-xs shadow-cartoon transition-all hover:scale-102 active:scale-98 ${
                isActive 
                  ? `${tab.color} translate-y-0.5 shadow-cartoon-sm` 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Tab Render Container */}
      <main className="min-h-[480px]">
        {activeTab === 'vocab' && <VocabularySection speak={speak} earnRewards={earnRewards} activeGrade={activeGrade} />}
        {activeTab === 'reading' && <ReadingSection speak={speak} earnRewards={earnRewards} activeGrade={activeGrade} />}
        {activeTab === 'grammar' && <GrammarSection speak={speak} earnRewards={earnRewards} activeGrade={activeGrade} />}
        {activeTab === 'writing' && <WritingSection earnRewards={earnRewards} activeGrade={activeGrade} />}
        {activeTab === 'speaking' && <SpeakingSection earnRewards={earnRewards} muted={muted} activeGrade={activeGrade} />}
      </main>

    </div>
  );
}

// ─── SUB-COMPONENTS ───

// 1. Vocabulary Flashcards
function VocabularySection({ speak, earnRewards, activeGrade }) {
  const categories = ["All", "Food", "Animals", "School", "Travel", "Technology"];
  const [selectedCat, setSelectedCat] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [learnedWords, setLearnedWords] = useState(() => {
    return JSON.parse(localStorage.getItem('educare_learned_vocab') || '[]');
  });
  const [imageError, setImageError] = useState(false);

  // Map activeGrade to difficulty tier group
  const getGradeGroup = (g) => {
    if (g === 'KG' || g === 'Grade 1') return 'easy';
    if (g === 'Grade 2' || g === 'Grade 3') return 'medium';
    return 'hard'; // Grade 4
  };

  const targetGroup = getGradeGroup(activeGrade);
  const filteredWords = VOCABULARY_WORDS.filter(w => 
    w.gradeGroup === targetGroup && (selectedCat === "All" || w.category === selectedCat)
  );
  const currentWord = filteredWords[currentIndex] || null;

  // Reset image error state whenever card changes
  useEffect(() => {
    setImageError(false);
  }, [currentIndex, selectedCat, activeGrade]);

  const getCategoryGradient = (cat) => {
    switch ((cat || "").toLowerCase()) {
      case 'food':
        return 'from-amber-100 to-rose-200 text-rose-800 border-rose-300';
      case 'animals':
        return 'from-emerald-100 to-teal-200 text-teal-800 border-teal-300';
      case 'school':
        return 'from-purple-100 to-indigo-200 text-indigo-800 border-indigo-300';
      case 'travel':
        return 'from-sky-100 to-blue-200 text-blue-800 border-blue-300';
      case 'technology':
        return 'from-cyan-100 to-violet-200 text-violet-850 border-violet-300';
      default:
        return 'from-rose-100 to-pink-200 text-pink-800 border-pink-300';
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredWords.length - 1) {
      SoundEngine.playPop();
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      SoundEngine.playPop();
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleMarkLearned = () => {
    if (!currentWord || learnedWords.includes(currentWord.word)) return;
    const nextLearned = [...learnedWords, currentWord.word];
    setLearnedWords(nextLearned);
    localStorage.setItem('educare_learned_vocab', JSON.stringify(nextLearned));
    earnRewards(1, 10);
  };

  return (
    <div className="bg-white border-4 border-slate-800 rounded-3xl p-6 shadow-cartoon max-w-xl mx-auto space-y-6">
      
      {/* Grade difficulty indicator */}
      <div className="flex justify-between items-center bg-slate-50 border-2 border-slate-205 px-4 py-2 rounded-2xl text-[10px] font-black uppercase text-slate-700">
        <span>🏫 Grade: {activeGrade}</span>
        <span>Tier: {targetGroup === 'easy' ? 'Junior 👶' : targetGroup === 'medium' ? 'Intermediate 👦' : 'Advanced 🚀'}</span>
      </div>
      
      {/* Category selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 justify-center">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => {
              SoundEngine.playPop();
              setSelectedCat(cat);
              setCurrentIndex(0);
            }}
            className={`px-3 py-1 rounded-full border-2 text-[10px] font-black tracking-wide uppercase transition-all ${
              selectedCat === cat 
                ? 'bg-rose-100 border-rose-400 text-rose-800' 
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {currentWord ? (
        <div className="space-y-4 text-center">
          
          <div className="bg-slate-50 border-4 border-slate-800 rounded-2xl overflow-hidden shadow-cartoon-sm max-w-xs mx-auto h-40 flex items-center justify-center relative">
            {!imageError ? (
              <img 
                src={currentWord.image} 
                alt={currentWord.word}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${getCategoryGradient(currentWord.category)} p-4 relative overflow-hidden select-none`}>
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <span className="text-6xl filter drop-shadow-md animate-bounce relative z-10">{currentWord.emoji || "📚"}</span>
                <span className="text-[9px] font-black uppercase tracking-wider relative z-10 mt-2 opacity-75">Visual Representation</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-2">
            <h2 className="text-3xl font-black text-slate-800 tracking-wide">{currentWord.word}</h2>
            <button 
              onClick={() => speak(currentWord.word)}
              className="p-2 bg-rose-50 hover:bg-rose-100 border-2 border-rose-350 text-rose-700 rounded-xl shadow-cartoon-sm active:translate-y-0.5"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-rose-50/50 border border-rose-200 p-4 rounded-2xl max-w-md mx-auto space-y-2">
            <p className="text-slate-700 font-bold text-sm leading-relaxed">{currentWord.meaning}</p>
            <p className="text-slate-400 font-bold text-xs italic">"{currentWord.example}"</p>
          </div>

          <div className="pt-2">
            {learnedWords.includes(currentWord.word) ? (
              <span className="inline-flex items-center gap-1.5 bg-emerald-100 border-2 border-emerald-300 text-emerald-800 text-xs font-black px-5 py-2.5 rounded-full shadow-cartoon-sm">
                <Check className="w-4 h-4 stroke-[3]" /> Word Learned!
              </span>
            ) : (
              <button
                onClick={handleMarkLearned}
                className="bg-rose-500 hover:bg-rose-600 text-white border-2 border-slate-800 text-xs font-black px-6 py-2.5 rounded-full shadow-cartoon hover:scale-102 active:translate-y-0.5"
              >
                Mark as Learned (+10 XP) ⭐
              </button>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100 max-w-md mx-auto">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-4 py-2 bg-slate-100 border-2 border-slate-300 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none active:translate-y-0.5 shadow-cartoon-sm"
            >
              ◀ Prev
            </button>
            <span className="text-xs text-slate-400 font-extrabold uppercase">
              Word {currentIndex + 1} of {filteredWords.length}
            </span>
            <button
              onClick={handleNext}
              disabled={currentIndex === filteredWords.length - 1}
              className="px-4 py-2 bg-slate-100 border-2 border-slate-300 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none active:translate-y-0.5 shadow-cartoon-sm"
            >
              Next ▶
            </button>
          </div>

        </div>
      ) : (
        <div className="text-center font-bold text-slate-400 py-12">No words found in this category!</div>
      )}

    </div>
  );
}

// 2. Reading comprehension Stories
function ReadingSection({ speak, earnRewards, activeGrade }) {
  const targetGroup = getGradeGroup(activeGrade);
  const filteredStories = STORIES.filter(s => s.gradeGroup === targetGroup);

  const [selectedStory, setSelectedStory] = useState(null);
  const [quizMode, setQuizMode] = useState(false);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  const startQuiz = () => {
    SoundEngine.playPop();
    setQuizMode(true);
    setAnswers({});
    setScore(null);
  };

  const submitQuiz = () => {
    if (!selectedStory) return;
    
    let correctCount = 0;
    selectedStory.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    setScore(correctCount);

    if (correctCount === selectedStory.questions.length) {
      earnRewards(3, 30);
    } else {
      SoundEngine.playSad();
    }
  };

  if (selectedStory) {
    return (
      <div className="bg-white border-4 border-slate-800 rounded-3xl p-6 shadow-cartoon max-w-2xl mx-auto space-y-6">
        
        <header className="flex justify-between items-center border-b-2 border-slate-100 pb-4">
          <button 
            onClick={() => { SoundEngine.playPop(); setSelectedStory(null); setQuizMode(false); }}
            className="px-3.5 py-1.5 bg-slate-100 border-2 border-slate-300 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 active:translate-y-0.5"
          >
            ◀ Back to Stories
          </button>
          <div className="flex gap-2">
            <span className="text-xs font-black uppercase bg-emerald-100 border-2 border-emerald-300 text-emerald-800 px-3 py-0.5 rounded-full">
              {selectedStory.level}
            </span>
          </div>
        </header>

        {!quizMode ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <span className="text-5xl">{selectedStory.emoji}</span>
              <h2 className="text-2xl font-black text-slate-800">{selectedStory.title}</h2>
              <button 
                onClick={() => speak(selectedStory.content)}
                className="flex items-center gap-1.5 mx-auto bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-350 text-emerald-700 px-4 py-2 rounded-xl text-xs font-black shadow-cartoon-sm"
              >
                <Volume2 className="w-4 h-4" /> Listen to Story Aloud
              </button>
            </div>

            <p className="bg-slate-50/50 border-2 border-slate-200 p-6 rounded-2xl text-slate-700 font-bold text-base leading-relaxed tracking-wide text-justify">
              {selectedStory.content}
            </p>

            <button
              onClick={startQuiz}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white border-3 border-slate-800 rounded-2xl font-black text-sm shadow-cartoon hover:scale-102 active:translate-y-0.5"
            >
              Start Comprehension Quiz ✍️
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-lg font-black text-slate-800">Quiz: {selectedStory.title}</h3>

            <div className="space-y-6">
              {selectedStory.questions.map((q, qIdx) => (
                <div key={qIdx} className="bg-slate-50 border-2 border-slate-200 p-5 rounded-2xl space-y-3">
                  <h4 className="font-extrabold text-sm text-slate-700">{qIdx + 1}. {q.question}</h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = answers[qIdx] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => {
                            SoundEngine.playPop();
                            setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
                          }}
                          className={`w-full py-3 px-4 rounded-xl border-2 text-left text-xs font-bold transition-all ${
                            isSelected 
                              ? 'bg-emerald-100 border-emerald-500 text-emerald-800 font-black scale-101' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {score !== null ? (
              <div className={`p-6 rounded-2xl border-4 text-center space-y-2 ${
                score === selectedStory.questions.length 
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-800' 
                  : 'bg-rose-100 border-rose-400 text-rose-800'
              }`}>
                <h4 className="text-2xl font-black">
                  {score === selectedStory.questions.length ? "Excellent! Perfect Score! 🏆" : "Keep Trying!"}
                </h4>
                <p className="text-sm font-bold">You answered {score} of {selectedStory.questions.length} questions correctly.</p>
                {score === selectedStory.questions.length ? (
                  <p className="text-xs font-extrabold uppercase tracking-wide text-emerald-700">+3 Stars awarded!</p>
                ) : (
                  <button 
                    onClick={startQuiz}
                    className="mt-3 px-4 py-2 bg-white hover:bg-slate-150 border-2 border-rose-350 text-rose-800 text-xs font-black rounded-full"
                  >
                    Retry Quiz
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={submitQuiz}
                disabled={Object.keys(answers).length < selectedStory.questions.length}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white border-3 border-slate-800 rounded-2xl font-black text-sm shadow-cartoon disabled:opacity-40 disabled:pointer-events-none active:translate-y-0.5"
              >
                Submit Answers 🚀
              </button>
            )}
          </div>
        )}

      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
      {filteredStories.map(story => (
        <div 
          key={story.id}
          className="bg-white border-4 border-slate-800 rounded-3xl p-6 shadow-cartoon hover:shadow-cartoon-hover hover:scale-102 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-start mb-3">
              <span className="text-4xl">{story.emoji}</span>
              <span className="text-[10px] bg-emerald-100 border border-emerald-350 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold uppercase">
                {story.level}
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">{story.title}</h3>
            <p className="text-xs text-slate-500 font-semibold line-clamp-3 leading-relaxed mb-4">
              {story.content}
            </p>
          </div>
          <button
            onClick={() => { SoundEngine.playPop(); setSelectedStory(story); }}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-slate-850 rounded-xl font-black text-xs shadow-cartoon-sm active:translate-y-0.5"
          >
            Read Story & Play Quiz 📖
          </button>
        </div>
      ))}
    </div>
  );
}

// 3. Grammar lessons
function GrammarSection({ speak, earnRewards, activeGrade }) {
  const targetGroup = getGradeGroup(activeGrade);
  const filteredLessons = GRAMMAR_LESSONS.filter(l => l.gradeGroup === targetGroup);

  const [selectedLesson, setSelectedLesson] = useState(null);
  const [answers, setAnswers] = useState({});
  const [quizResults, setQuizResults] = useState(null);

  const handleSubmitQuiz = () => {
    if (!selectedLesson) return;
    let correctCount = 0;
    selectedLesson.quizzes.forEach((q, idx) => {
      if (answers[idx] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    setQuizResults(correctCount);

    if (correctCount === selectedLesson.quizzes.length) {
      earnRewards(2, 20);
    } else {
      SoundEngine.playSad();
    }
  };

  if (selectedLesson) {
    return (
      <div className="bg-white border-4 border-slate-800 rounded-3xl p-6 shadow-cartoon max-w-2xl mx-auto space-y-6">
        
        <header className="flex justify-between items-center border-b-2 border-slate-100 pb-4">
          <button 
            onClick={() => { SoundEngine.playPop(); setSelectedLesson(null); setQuizResults(null); setAnswers({}); }}
            className="px-3.5 py-1.5 bg-slate-100 border-2 border-slate-300 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 active:translate-y-0.5"
          >
            ◀ Back to Lessons
          </button>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Grammar Coach</span>
        </header>

        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-slate-800">{selectedLesson.title}</h2>
            <p className="text-xs text-slate-400 font-bold uppercase">{selectedLesson.description}</p>
          </div>

          <div className="bg-slate-50 border-2 border-slate-200 p-6 rounded-2xl text-slate-700 text-sm whitespace-pre-line leading-relaxed font-bold">
            {selectedLesson.content}
          </div>

          {/* Grammar Quiz Mini Section */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
              <span>✍️ Lesson Quiz</span>
            </h3>

            <div className="space-y-5">
              {selectedLesson.quizzes.map((q, qIdx) => (
                <div key={qIdx} className="bg-slate-50/50 border border-slate-200 p-4 rounded-xl space-y-2">
                  <h4 className="font-extrabold text-xs text-slate-700">{qIdx + 1}. {q.question}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = answers[qIdx] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => {
                            SoundEngine.playPop();
                            setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
                          }}
                          className={`w-full py-2.5 px-3 rounded-lg border-2 text-left text-xs font-extrabold transition-all ${
                            isSelected 
                              ? 'bg-amber-100 border-amber-400 text-amber-800 font-black' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {quizResults !== null ? (
              <div className={`p-4 rounded-xl border-2 text-center ${
                quizResults === selectedLesson.quizzes.length ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-rose-100 border-rose-400 text-rose-800'
              }`}>
                <p className="text-sm font-black">
                  {quizResults === selectedLesson.quizzes.length ? 'Awesome! Passed! +2 Stars' : 'Good try! Retry grammar quiz.'}
                </p>
                {quizResults !== selectedLesson.quizzes.length && (
                  <button 
                    onClick={() => { setQuizResults(null); setAnswers({}); }}
                    className="mt-2 text-xs font-black underline bg-transparent border-none text-rose-800"
                  >
                    Retry Quiz
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(answers).length < selectedLesson.quizzes.length}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white border-2 border-slate-850 rounded-xl font-black text-xs shadow-cartoon-sm disabled:opacity-40 disabled:pointer-events-none active:translate-y-0.5"
              >
                Validate Lesson Quiz 🚀
              </button>
            )}
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {filteredLessons.map(lesson => (
        <div 
          key={lesson.id}
          className="bg-white border-4 border-slate-800 rounded-3xl p-6 shadow-cartoon hover:shadow-cartoon-hover hover:scale-102 transition-all flex flex-col justify-between"
        >
          <div>
            <span className="text-3xl">📝</span>
            <h3 className="text-lg font-black text-slate-800 mt-2 mb-1">{lesson.title}</h3>
            <p className="text-xs text-slate-500 font-bold mb-4">{lesson.description}</p>
          </div>
          <button
            onClick={() => { SoundEngine.playPop(); setSelectedLesson(lesson); }}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white border-2 border-slate-850 rounded-xl font-black text-xs shadow-cartoon-sm active:translate-y-0.5"
          >
            Study Lesson 🚀
          </button>
        </div>
      ))}
    </div>
  );
}

// 4. Writing Practice with draft saving & local AI feedback
function WritingSection({ earnRewards, activeGrade }) {
  const targetGroup = getGradeGroup(activeGrade);
  const filteredPrompts = WRITING_PROMPTS.filter(p => p.gradeGroup === targetGroup).map(p => p.text);

  const [selectedPrompt, setSelectedPrompt] = useState(filteredPrompts[0] || "Write a story.");
  const [inputText, setInputText] = useState(() => {
    return localStorage.getItem(`educare_draft_${selectedPrompt}`) || '';
  });
  const [aiFeedback, setAiFeedback] = useState(null);

  // Sync input draft text when prompt changes
  useEffect(() => {
    setInputText(localStorage.getItem(`educare_draft_${selectedPrompt}`) || '');
    setAiFeedback(null);
  }, [selectedPrompt]);

  const handleSaveDraft = () => {
    SoundEngine.playPop();
    localStorage.setItem(`educare_draft_${selectedPrompt}`, inputText);
    alert("Draft saved successfully to local storage!");
  };

  const handleSubmitToTeacher = () => {
    if (!inputText.trim()) return;
    SoundEngine.playSuccess();
    
    // Simple checks for dynamic response feedback
    const wordCount = inputText.split(/\s+/).filter(w => w.length > 0).length;
    let qualityRating = 3;
    let critique = "Good draft explorer! Let's try adding more details, descriptive adjectives, or complex punctuation like commas and quotes.";

    if (wordCount > 35) {
      qualityRating = 5;
      critique = "Absolutely magical! Your vocabulary choices are rich, spelling looks solid, and flow is excellent! Great job! Rating: 5/5 Stars! 🌟";
      earnRewards(2, 20);
    } else if (wordCount > 15) {
      qualityRating = 4;
      critique = "Lovely writing! Good sentence structure. Add a concluding sentence to wrap it up neatly! Rating: 4/5 Stars! 🌟";
      earnRewards(1, 10);
    }

    setAiFeedback({
      words: wordCount,
      rating: qualityRating,
      critique: critique
    });
  };

  return (
    <div className="bg-white border-4 border-slate-800 rounded-3xl p-6 shadow-cartoon max-w-2xl mx-auto space-y-6">
      
      <div className="space-y-1">
        <label className="text-xs font-black uppercase text-slate-400">Select Writing Prompt</label>
        <select
          value={selectedPrompt}
          onChange={(e) => { SoundEngine.playPop(); setSelectedPrompt(e.target.value); }}
          className="w-full border-2 border-slate-200 focus:border-purple-400 focus:outline-none rounded-xl px-3 py-2 font-bold text-xs bg-white cursor-pointer"
        >
          {filteredPrompts.map((pr, i) => (
            <option key={i} value={pr}>{pr}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1 flex-1 flex flex-col min-h-[220px]">
        <label className="text-xs font-black uppercase text-slate-400">Your Story Workspace</label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Start typing your story or response here..."
          className="w-full flex-1 min-h-[160px] border-2 border-slate-200 focus:border-purple-400 focus:outline-none rounded-2xl p-4 font-bold text-sm leading-relaxed"
        />
      </div>

      {aiFeedback && (
        <div className="bg-purple-50/50 border-2 border-purple-200 p-5 rounded-2xl space-y-1.5 text-left">
          <h4 className="font-black text-purple-700 text-sm flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" /> Astra AI Teacher Evaluation
          </h4>
          <div className="flex gap-1">
            {Array.from({ length: aiFeedback.rating }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-300 stroke-slate-700 stroke-[2]" />
            ))}
          </div>
          <p className="text-slate-600 font-bold text-xs leading-relaxed">{aiFeedback.critique}</p>
          <span className="text-[9px] text-slate-400 font-extrabold uppercase block mt-1">Telemetry Metrics: {aiFeedback.words} words written</span>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleSaveDraft}
          className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-700 rounded-xl font-bold text-xs active:translate-y-0.5 shadow-cartoon-sm"
        >
          Save Draft 💾
        </button>
        <button
          onClick={handleSubmitToTeacher}
          disabled={!inputText.trim()}
          className="flex-1 py-3 bg-purple-500 hover:bg-purple-600 text-white border-2 border-slate-850 rounded-xl font-black text-xs shadow-cartoon-sm disabled:opacity-40 disabled:pointer-events-none active:translate-y-0.5"
        >
          Submit to AI Teacher 🚀
        </button>
      </div>

    </div>
  );
}

// 5. Speaking Coach using Web Speech STT
function SpeakingSection({ earnRewards, muted, activeGrade }) {
  const targetGroup = getGradeGroup(activeGrade);
  const filteredSentences = SPEAKING_SENTENCES.filter(s => s.gradeGroup === targetGroup).map(s => s.text);

  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const targetSentence = filteredSentences[currentSentenceIndex] || "I am learning English.";

  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('Click mic to start speaking...');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setSpokenText("Listening... speak now!");
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error in Speaking Coach:', e.error);
        setIsListening(false);
        setSpokenText("Could not capture speech. Try again!");
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSpokenText(transcript);
        verifySpeech(transcript);
      };

      recognitionRef.current = rec;
    }
  }, [currentSentenceIndex]);

  const toggleListen = () => {
    SoundEngine.playPop();
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported on this browser browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const verifySpeech = (speech) => {
    const cleanTarget = targetSentence.toLowerCase().replaceAll(/[^\w\s]/g, '').trim();
    const cleanSpoken = speech.toLowerCase().replaceAll(/[^\w\s]/g, '').trim();

    if (cleanTarget === cleanSpoken) {
      earnRewards(2, 20);
      setSpokenText(`Perfect! "${speech}" (+20 XP / +2 Stars) 🎉`);
    } else {
      SoundEngine.playSad();
      setSpokenText(`Good try! You said: "${speech}". Target is: "${targetSentence}". Keep practicing!`);
    }
  };

  const handleNextSentence = () => {
    SoundEngine.playPop();
    setCurrentSentenceIndex((currentSentenceIndex + 1) % Math.max(1, filteredSentences.length));
    setSpokenText('Click mic to start speaking...');
  };

  return (
    <div className="bg-white border-4 border-slate-800 rounded-3xl p-6 shadow-cartoon max-w-xl mx-auto space-y-6 text-center">
      
      <div className="bg-slate-50 border-2 border-slate-200 p-5 rounded-2xl space-y-3">
        <span className="text-xs font-black uppercase text-slate-400">Target Speaking Sentence</span>
        <h2 className="text-2xl font-black text-indigo-700 leading-snug px-2">"{targetSentence}"</h2>
      </div>

      <div className="bg-[#1e293b] border-4 border-slate-800 text-slate-200 p-6 rounded-2xl text-sm min-h-[100px] flex items-center justify-center font-bold tracking-wide italic">
        {spokenText}
      </div>

      {isListening && (
        <div className="flex justify-center items-center gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <span 
              key={i} 
              className="w-1 bg-rose-500 rounded-full animate-bounce"
              style={{
                height: `${Math.random() * 20 + 8}px`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
          <span className="text-xs font-bold text-rose-500 ml-1">Mic Active...</span>
        </div>
      )}

      <div className="flex gap-4 items-center">
        <button
          onClick={toggleListen}
          className={`flex-1 py-4 border-3 border-slate-850 rounded-2xl font-black text-sm shadow-cartoon flex justify-center items-center gap-2 active:translate-y-0.5 ${
            isListening 
              ? 'bg-rose-500 text-white animate-pulse' 
              : 'bg-indigo-500 hover:bg-indigo-600 text-white'
          }`}
        >
          <Mic className="w-5 h-5" />
          <span>{isListening ? 'Stop Recording' : 'Start Speaking Coach'}</span>
        </button>

        <button
          onClick={handleNextSentence}
          className="p-4 bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-700 rounded-2xl active:translate-y-0.5 shadow-cartoon-sm"
          title="Try another sentence"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}
