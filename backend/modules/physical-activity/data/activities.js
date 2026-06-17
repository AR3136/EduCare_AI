/**
 * Upgraded activities catalog seed data for the Physical Activity Engine.
 * Fully Grade-Aware, Subject-Aware, and Mood-Aware.
 * Includes Grade-wise (KG to Grade 4) and Subject-wise (English, Math, STEM, Logic) frameworks.
 */

export const DEFAULT_ACTIVITIES = [
  // ==========================================
  // KG (Grade-wise) - Very Easy, 30s - 1m
  // ==========================================
  {
    activityId: "act_kg_jump_3",
    title: "Jump 3 Times",
    description: "Boing! Stand up tall and jump as high as you can three times!",
    emoji: "🦘",
    sourceModule: "AI_TUTOR",
    category: "movement",
    moodTags: ["energize", "fun"],
    gradeLevels: ["KG"],
    durationSeconds: 30,
    instructions: [
      {
        stepNumber: 1,
        description: "Stand up straight and bend your knees.",
        durationSeconds: 10,
        voiceCueText: "Get ready to jump!"
      },
      {
        stepNumber: 2,
        description: "Jump up and land softly on your feet. Repeat 3 times: One! Two! Three!",
        durationSeconds: 20,
        voiceCueText: "Jump! One! Two! Three! Land softly like a frog!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_movement_master",
    difficultyLevel: 1, // Very Easy
    subjectTag: null
  },
  {
    activityId: "act_kg_touch_red",
    title: "Touch Something Red",
    description: "Look around your room. Can you find and touch something red?",
    emoji: "🔴",
    sourceModule: "AI_TUTOR",
    category: "color recognition",
    moodTags: ["fun", "focus"],
    gradeLevels: ["KG"],
    durationSeconds: 45,
    instructions: [
      {
        stepNumber: 1,
        description: "Look around! Look for a red toy, a red pencil, or red clothes.",
        durationSeconds: 20,
        voiceCueText: "Look around you, search for something red!"
      },
      {
        stepNumber: 2,
        description: "Walk over, gently touch the red item, and return to your seat.",
        durationSeconds: 25,
        voiceCueText: "Touch the red item and say 'Red' out loud!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_fitness_explorer",
    difficultyLevel: 1, // Very Easy
    subjectTag: null
  },
  {
    activityId: "act_kg_clap_5",
    title: "Clap 5 Times",
    description: "Clap your hands! High, low, and all around. Count to five!",
    emoji: "👏",
    sourceModule: "AI_TUTOR",
    category: "movement",
    moodTags: ["fun", "energize"],
    gradeLevels: ["KG"],
    durationSeconds: 30,
    instructions: [
      {
        stepNumber: 1,
        description: "Reach your hands up high and clap 5 times slowly while counting out loud.",
        durationSeconds: 30,
        voiceCueText: "Clap with me! One, two, three, four, five!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_movement_master",
    difficultyLevel: 1, // Very Easy
    subjectTag: null
  },
  {
    activityId: "act_kg_walk_elephant",
    title: "Walk Like an Elephant",
    description: "Stomp, stomp! Interlock your hands to make a trunk and stomp around.",
    emoji: "🐘",
    sourceModule: "AI_TUTOR",
    category: "animal movements",
    moodTags: ["fun", "energize"],
    gradeLevels: ["KG"],
    durationSeconds: 60,
    instructions: [
      {
        stepNumber: 1,
        description: "Clasp your hands together and let your arms swing in front of you like a trunk.",
        durationSeconds: 20,
        voiceCueText: "Make a trunk with your arms!"
      },
      {
        stepNumber: 2,
        description: "Take big heavy steps around the room, swinging your trunk and stomping gently.",
        durationSeconds: 40,
        voiceCueText: "Stomp! Walk like a big happy elephant!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_movement_master",
    difficultyLevel: 1, // Very Easy
    subjectTag: null
  },
  {
    activityId: "act_kg_stretch_tree",
    title: "Stretch Like a Tree",
    description: "Stand tall and reach for the sunlight like a beautiful growing tree.",
    emoji: "🌳",
    sourceModule: "AI_TUTOR",
    category: "fun exercises",
    moodTags: ["calm", "focus"],
    gradeLevels: ["KG"],
    durationSeconds: 40,
    instructions: [
      {
        stepNumber: 1,
        description: "Reach your branches (arms) high up to the sky. Take a deep breath.",
        durationSeconds: 20,
        voiceCueText: "Reach up tall, breathe in the sun!"
      },
      {
        stepNumber: 2,
        description: "Sway gently in the breeze from side to side. Keep your feet planted like roots.",
        durationSeconds: 20,
        voiceCueText: "Gently sway side to side in the wind."
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_focus_champion",
    difficultyLevel: 1, // Very Easy
    subjectTag: null
  },
  {
    activityId: "act_kg_touch_circle",
    title: "Touch a Circle Shape",
    description: "Can you find a round, circular shape in your room and touch it?",
    emoji: "⭕",
    sourceModule: "AI_TUTOR",
    category: "shape recognition",
    moodTags: ["focus", "fun"],
    gradeLevels: ["KG"],
    durationSeconds: 50,
    instructions: [
      {
        stepNumber: 1,
        description: "Look for something round like a clock, a coin, a lid, or a wheel.",
        durationSeconds: 25,
        voiceCueText: "Look for something that is a circle!"
      },
      {
        stepNumber: 2,
        description: "Go touch it, trace the circle with your finger, and come back.",
        durationSeconds: 25,
        voiceCueText: "Trace the circle shape and trace it in the air too!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_fitness_explorer",
    difficultyLevel: 1, // Very Easy
    subjectTag: null
  },
  {
    activityId: "act_kg_find_blue",
    title: "Find a Blue Object",
    description: "Search search search! Find something blue and point to it.",
    emoji: "🔵",
    sourceModule: "AI_TUTOR",
    category: "color recognition",
    moodTags: ["fun", "focus"],
    gradeLevels: ["KG"],
    durationSeconds: 45,
    instructions: [
      {
        stepNumber: 1,
        description: "Scan your surroundings for anything blue: a book, a shirt, or a block.",
        durationSeconds: 25,
        voiceCueText: "Find something blue like the sky!"
      },
      {
        stepNumber: 2,
        description: "Touch the blue item and do a little wiggle dance!",
        durationSeconds: 20,
        voiceCueText: "Nice! Do a happy wiggle!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_fitness_explorer",
    difficultyLevel: 1, // Very Easy
    subjectTag: null
  },
  {
    activityId: "act_kg_hop_bunny",
    title: "Hop Like a Bunny",
    description: "Put your bunny ears up and hop around like a little rabbit in a garden.",
    emoji: "🐰",
    sourceModule: "AI_TUTOR",
    category: "animal movements",
    moodTags: ["fun", "energize"],
    gradeLevels: ["KG"],
    durationSeconds: 50,
    instructions: [
      {
        stepNumber: 1,
        description: "Hold your hands on your head like bunny ears. Bend your knees.",
        durationSeconds: 15,
        voiceCueText: "Put your bunny ears up!"
      },
      {
        stepNumber: 2,
        description: "Make small, quick hops around, sniffing the air like a curious bunny.",
        durationSeconds: 35,
        voiceCueText: "Hop hop hop! Hop around the garden!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_movement_master",
    difficultyLevel: 1, // Very Easy
    subjectTag: null
  },

  // ==========================================
  // Grade 1 - Easy, 1 - 2 min
  // ==========================================
  {
    activityId: "act_g1_jumping_jacks",
    title: "Jumping Jacks",
    description: "Clap and jump! Get your heart pumping with standard jumping jacks.",
    emoji: "⚡",
    sourceModule: "AI_TUTOR",
    category: "movement",
    moodTags: ["energize", "fun"],
    gradeLevels: ["Grade 1"],
    durationSeconds: 75,
    instructions: [
      {
        stepNumber: 1,
        description: "Stand with feet together, hands at your sides.",
        durationSeconds: 15,
        voiceCueText: "Stand straight, arms down."
      },
      {
        stepNumber: 2,
        description: "Jump your feet out while bringing your hands together above your head. Jump back.",
        durationSeconds: 60,
        voiceCueText: "Jump out, arms up! Jump in, arms down! Keep going!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_energy_hero",
    difficultyLevel: 2, // Easy
    subjectTag: null
  },
  {
    activityId: "act_g1_one_foot",
    title: "One Foot Balance",
    description: "Can you balance on one foot like a flamingo? A core balance challenge.",
    emoji: "🦵",
    sourceModule: "AI_TUTOR",
    category: "balance",
    moodTags: ["calm", "focus"],
    gradeLevels: ["Grade 1"],
    durationSeconds: 80,
    instructions: [
      {
        stepNumber: 1,
        description: "Lift your right foot off the ground. Place hands on hips. Hold for 30 seconds.",
        durationSeconds: 40,
        voiceCueText: "Lift one leg, keep your balance, look at a steady spot."
      },
      {
        stepNumber: 2,
        description: "Switch feet. Lift your left foot off the ground and hold for 30 seconds.",
        durationSeconds: 40,
        voiceCueText: "Now switch! Lift the other leg and balance."
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_focus_champion",
    difficultyLevel: 2, // Easy
    subjectTag: null
  },
  {
    activityId: "act_g1_find_3_red",
    title: "Find 3 Red Objects",
    description: "Search and point to 3 different red items in the room. Move quickly!",
    emoji: "🎒",
    sourceModule: "AI_TUTOR",
    category: "object recognition",
    moodTags: ["focus", "fun"],
    gradeLevels: ["Grade 1"],
    durationSeconds: 90,
    instructions: [
      {
        stepNumber: 1,
        description: "Scan the room and point to red item 1, red item 2, and red item 3.",
        durationSeconds: 50,
        voiceCueText: "Point to three red things in your room. One! Two! Three!"
      },
      {
        stepNumber: 2,
        description: "March in place and count your findings.",
        durationSeconds: 40,
        voiceCueText: "March and say, 'I found three red things!'"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_fitness_explorer",
    difficultyLevel: 2, // Easy
    subjectTag: null
  },
  {
    activityId: "act_g1_reach_sky",
    title: "Reach for the Sky",
    description: "Stretch up on your tippy-toes, reaching as high as you can to stretch your calves and back.",
    emoji: "🌤️",
    sourceModule: "AI_TUTOR",
    category: "movement",
    moodTags: ["calm", "focus"],
    gradeLevels: ["Grade 1"],
    durationSeconds: 65,
    instructions: [
      {
        stepNumber: 1,
        description: "Stand tall. Raise hands and lift your heels to stand on your toes.",
        durationSeconds: 30,
        voiceCueText: "Reach up high on your tippy-toes!"
      },
      {
        stepNumber: 2,
        description: "Relax, drop heels, and slowly fold forward to touch your shins.",
        durationSeconds: 35,
        voiceCueText: "Relax, bend down, and stretch your back."
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_focus_champion",
    difficultyLevel: 2, // Easy
    subjectTag: null
  },
  {
    activityId: "act_g1_dance_30s",
    title: "Dance for 30 Seconds",
    description: "Put on your dancing shoes! Bust out your favorite moves for 30 seconds straight.",
    emoji: "💃",
    sourceModule: "AI_TUTOR",
    category: "color activities",
    moodTags: ["fun", "energize"],
    gradeLevels: ["Grade 1"],
    durationSeconds: 60,
    instructions: [
      {
        stepNumber: 1,
        description: "Shake out your limbs and get ready to groooooove!",
        durationSeconds: 20,
        voiceCueText: "Get loose! Music starting soon!"
      },
      {
        stepNumber: 2,
        description: "Dance, wiggle, and leap! Keep moving until the timer runs out.",
        durationSeconds: 40,
        voiceCueText: "Dance! Shake it! Twirl! Keep dancing!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_energy_hero",
    difficultyLevel: 2, // Easy
    subjectTag: null
  },
  {
    activityId: "act_g1_hop_count",
    title: "Hop and Count",
    description: "Hop on one foot while counting to 10. Switch legs and repeat!",
    emoji: "🔢",
    sourceModule: "AI_TUTOR",
    category: "movement",
    moodTags: ["energize", "fun"],
    gradeLevels: ["Grade 1"],
    durationSeconds: 70,
    instructions: [
      {
        stepNumber: 1,
        description: "Hop on your right foot: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10!",
        durationSeconds: 35,
        voiceCueText: "Hop on your right leg and count to 10!"
      },
      {
        stepNumber: 2,
        description: "Switch to your left foot and hop: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10!",
        durationSeconds: 35,
        voiceCueText: "Switch legs, hop and count to 10!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_movement_master",
    difficultyLevel: 2, // Easy
    subjectTag: null
  },
  {
    activityId: "act_g1_touch_square",
    title: "Touch Square Objects",
    description: "Hunt for square shapes! Find something with four straight sides and touch it.",
    emoji: "🟪",
    sourceModule: "AI_TUTOR",
    category: "object recognition",
    moodTags: ["focus", "fun"],
    gradeLevels: ["Grade 1"],
    durationSeconds: 80,
    instructions: [
      {
        stepNumber: 1,
        description: "Search for squares: a book covers, a photo frame, or a cube box.",
        durationSeconds: 40,
        voiceCueText: "Find something square and touch it!"
      },
      {
        stepNumber: 2,
        description: "Perform 5 squatted jumps next to the square object.",
        durationSeconds: 40,
        voiceCueText: "Squat down and jump up 5 times!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_fitness_explorer",
    difficultyLevel: 2, // Easy
    subjectTag: null
  },

  // ==========================================
  // Grade 2 - Easy-Medium, 2 - 3 min
  // ==========================================
  {
    activityId: "act_g2_simon_says",
    title: "Simon Says",
    description: "Follow the pattern of physical actions only when 'Simon Says'!",
    emoji: "🗣️",
    sourceModule: "AI_TUTOR",
    category: "memory",
    moodTags: ["fun", "focus"],
    gradeLevels: ["Grade 2"],
    durationSeconds: 130,
    instructions: [
      {
        stepNumber: 1,
        description: "Simon Says: Touch your ears. Simon Says: Stand on one foot.",
        durationSeconds: 45,
        voiceCueText: "Simon says: Touch your ears! Now stand on one foot! Did you do it? Good!"
      },
      {
        stepNumber: 2,
        description: "Simon Says: Jump twice. Touch your nose (Don't do it! Simon didn't say!).",
        durationSeconds: 45,
        voiceCueText: "Simon says: Jump twice! Now touch your nose... Ah, Simon didn't say!"
      },
      {
        stepNumber: 3,
        description: "Simon Says: Reach for your toes. Roll your shoulders.",
        durationSeconds: 40,
        voiceCueText: "Simon says: Reach for your toes! Stand up and roll your shoulders!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_focus_champion",
    difficultyLevel: 3, // Easy-Medium
    subjectTag: null
  },
  {
    activityId: "act_g2_follow_pattern",
    title: "Follow Movement Pattern",
    description: "Clap, snap, stomp! Repeat the rhythmic movement sequence.",
    emoji: "🔄",
    sourceModule: "AI_TUTOR",
    category: "movement",
    moodTags: ["focus", "coordination"],
    gradeLevels: ["Grade 2"],
    durationSeconds: 120,
    instructions: [
      {
        stepNumber: 1,
        description: "Perform: Stomp left, Stomp right, Clap hands, Snap fingers. Repeat 4 times.",
        durationSeconds: 60,
        voiceCueText: "Stomp, stomp, clap, snap! Let's do it again!"
      },
      {
        stepNumber: 2,
        description: "Double the speed: Stomp-stomp-clap-snap! Keep the rhythm going.",
        durationSeconds: 60,
        voiceCueText: "Faster now! Stomp-stomp-clap-snap!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_movement_master",
    difficultyLevel: 3, // Easy-Medium
    subjectTag: null
  },
  {
    activityId: "act_g2_number_hop",
    title: "Number Hop Game",
    description: "Hop in patterns: Hop 2 times on right, 1 on left, 3 on right!",
    emoji: "🔢",
    sourceModule: "AI_TUTOR",
    category: "coordination",
    moodTags: ["energize", "fun"],
    gradeLevels: ["Grade 2"],
    durationSeconds: 140,
    instructions: [
      {
        stepNumber: 1,
        description: "Hop twice on your right leg, then once on your left leg. Repeat.",
        durationSeconds: 70,
        voiceCueText: "Two hops on right, one on left! Find your rhythm!"
      },
      {
        stepNumber: 2,
        description: "Hop three times on your left leg, twice on your right leg. Repeat.",
        durationSeconds: 70,
        voiceCueText: "Three hops on left, two on right!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_movement_master",
    difficultyLevel: 3, // Easy-Medium
    subjectTag: null
  },
  {
    activityId: "act_g2_quick_yoga",
    title: "Quick Yoga",
    description: "Three gentle yoga poses: Mountain, Warrior, and Tree pose to calm your mind.",
    emoji: "🧘",
    sourceModule: "AI_TUTOR",
    category: "movement",
    moodTags: ["calm", "focus", "relax"],
    gradeLevels: ["Grade 2"],
    durationSeconds: 150,
    instructions: [
      {
        stepNumber: 1,
        description: "Mountain Pose: Stand firm and tall with arms at your sides, breathing deeply.",
        durationSeconds: 50,
        voiceCueText: "Stand tall like a mountain, feet flat, breathe in."
      },
      {
        stepNumber: 2,
        description: "Warrior Pose: Step one foot back, bend front knee, and extend arms wide.",
        durationSeconds: 50,
        voiceCueText: "Step back, spread your arms wide like a strong warrior!"
      },
      {
        stepNumber: 3,
        description: "Tree Pose: Balance on one foot, bringing the other foot to your shin.",
        durationSeconds: 50,
        voiceCueText: "Place your foot on your calf, join your hands, and balance."
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_focus_champion",
    difficultyLevel: 3, // Easy-Medium
    subjectTag: null
  },
  {
    activityId: "act_g2_memory_walk",
    title: "Memory Walk",
    description: "Take 4 steps forward, touch your head, take 4 steps back, touch your knees.",
    emoji: "🚶",
    sourceModule: "AI_TUTOR",
    category: "memory",
    moodTags: ["focus", "coordination"],
    gradeLevels: ["Grade 2"],
    durationSeconds: 120,
    instructions: [
      {
        stepNumber: 1,
        description: "Walk forward 4 steps, clap, and touch your head.",
        durationSeconds: 60,
        voiceCueText: "One, two, three, four... clap! Touch your head!"
      },
      {
        stepNumber: 2,
        description: "Walk backward 4 steps, jump, and touch your knees.",
        durationSeconds: 60,
        voiceCueText: "One, two, three, four... jump! Touch your knees!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_focus_champion",
    difficultyLevel: 3, // Easy-Medium
    subjectTag: null
  },
  {
    activityId: "act_g2_balance_challenge",
    title: "Balance Challenge",
    description: "Walk in a straight line heel-to-toe like you are on a high tightrope!",
    emoji: "⚖️",
    sourceModule: "AI_TUTOR",
    category: "coordination",
    moodTags: ["focus", "calm"],
    gradeLevels: ["Grade 2"],
    durationSeconds: 130,
    instructions: [
      {
        stepNumber: 1,
        description: "Align your feet in a straight line. Walk forward heel-to-toe for 10 steps.",
        durationSeconds: 65,
        voiceCueText: "Place one foot right in front of the other, heel-to-toe."
      },
      {
        stepNumber: 2,
        description: "Walk backward heel-to-toe in a straight line for 10 steps.",
        durationSeconds: 65,
        voiceCueText: "Now walk backward, toe-to-heel, keep your balance!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_focus_champion",
    difficultyLevel: 3, // Easy-Medium
    subjectTag: null
  },

  // ==========================================
  // Grade 3 - Medium, 3 - 4 min
  // ==========================================
  {
    activityId: "act_g3_reaction",
    title: "Reaction Challenge",
    description: "React instantly when the screen flashes green: freeze or jump!",
    emoji: "⏱️",
    sourceModule: "AI_TUTOR",
    category: "reaction speed",
    moodTags: ["energize", "fun"],
    gradeLevels: ["Grade 3"],
    durationSeconds: 180,
    instructions: [
      {
        stepNumber: 1,
        description: "March in place dynamically. Be ready to react!",
        durationSeconds: 60,
        voiceCueText: "March, march! Keep your eyes on the screen!"
      },
      {
        stepNumber: 2,
        description: "JUMP! When prompt says 'GREEN', freeze when prompt says 'RED'.",
        durationSeconds: 120,
        voiceCueText: "GREEN: JUMP! RED: FREEZE! GREEN! JUMP! RED! FREEZE!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_energy_hero",
    difficultyLevel: 4, // Medium
    subjectTag: null
  },
  {
    activityId: "act_g3_lr_coordination",
    title: "Left-Right Coordination",
    description: "Touch your left elbow to your right knee, then right elbow to left knee. Cross-body exercises.",
    emoji: "🔀",
    sourceModule: "AI_TUTOR",
    category: "coordination",
    moodTags: ["focus", "coordination"],
    gradeLevels: ["Grade 3"],
    durationSeconds: 200,
    instructions: [
      {
        stepNumber: 1,
        description: "Raise arms. Lift right knee and touch it with left elbow. Swap sides. Hold a steady rhythm.",
        durationSeconds: 100,
        voiceCueText: "Left elbow to right knee! Right elbow to left knee! Cross your body!"
      },
      {
        stepNumber: 2,
        description: "Increase tempo. Keep core engaged and back straight.",
        durationSeconds: 100,
        voiceCueText: "Pick up the speed! 1, 2, 1, 2, keep going!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_movement_master",
    difficultyLevel: 4, // Medium
    subjectTag: null
  },
  {
    activityId: "act_g3_balance_count",
    title: "Balance and Count",
    description: "Stand on one leg, close your eyes, and count backward from 20.",
    emoji: "🔢",
    sourceModule: "AI_TUTOR",
    category: "focus",
    moodTags: ["calm", "focus"],
    gradeLevels: ["Grade 3"],
    durationSeconds: 190,
    instructions: [
      {
        stepNumber: 1,
        description: "Stand on right leg. Close eyes and count down from 20 to 0.",
        durationSeconds: 95,
        voiceCueText: "Stand on your right foot, close your eyes, and count down from 20."
      },
      {
        stepNumber: 2,
        description: "Stand on left leg. Close eyes and count down from 20 to 0.",
        durationSeconds: 95,
        voiceCueText: "Switch feet, close eyes, and count down from 20."
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_focus_champion",
    difficultyLevel: 4, // Medium
    subjectTag: null
  },
  {
    activityId: "act_g3_fitness_quiz",
    title: "Fitness Quiz",
    description: "Do squats for True answers and lunges for False answers to our quick questions!",
    emoji: "❓",
    sourceModule: "AI_TUTOR",
    category: "focus",
    moodTags: ["focus", "fun"],
    gradeLevels: ["Grade 3"],
    durationSeconds: 210,
    instructions: [
      {
        stepNumber: 1,
        description: "Question 1: Water is good for your muscles (Squat for YES!).",
        durationSeconds: 70,
        voiceCueText: "Is water good for you? Squat down if yes! Yes, do 5 squats!"
      },
      {
        stepNumber: 2,
        description: "Question 2: Sitting all day makes you run faster (Lunge for NO!).",
        durationSeconds: 70,
        voiceCueText: "Does sitting all day make you faster? Do lunges for NO! Lunge forward!"
      },
      {
        stepNumber: 3,
        description: "Question 3: Sleep helps your body recover (Squat for YES!).",
        durationSeconds: 70,
        voiceCueText: "Does sleep help you grow? Squat for yes!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_fitness_explorer",
    difficultyLevel: 4, // Medium
    subjectTag: null
  },
  {
    activityId: "act_g3_memory_movement",
    title: "Memory Movement",
    description: "Remember the sequence: Touch head, touch toes, jump, clap. Repeat and add steps!",
    emoji: "🧠",
    sourceModule: "AI_TUTOR",
    category: "coordination",
    moodTags: ["focus", "coordination"],
    gradeLevels: ["Grade 3"],
    durationSeconds: 220,
    instructions: [
      {
        stepNumber: 1,
        description: "Perform: Head, toes, jump, clap. Repeat 5 times.",
        durationSeconds: 110,
        voiceCueText: "Head, toes, jump, clap! Keep it in memory!"
      },
      {
        stepNumber: 2,
        description: "Add steps: Head, toes, jump, clap, spin around, lunge. Repeat.",
        durationSeconds: 110,
        voiceCueText: "Head, toes, jump, clap, spin, lunge!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_focus_champion",
    difficultyLevel: 4, // Medium
    subjectTag: null
  },
  {
    activityId: "act_g3_stretch_circuit",
    title: "Quick Stretch Circuit",
    description: "A series of stretches: shoulder roll, side stretch, and hamstring stretch.",
    emoji: "🙆",
    sourceModule: "AI_TUTOR",
    category: "coordination",
    moodTags: ["calm", "relax"],
    gradeLevels: ["Grade 3"],
    durationSeconds: 200,
    instructions: [
      {
        stepNumber: 1,
        description: "Roll shoulders backward 10 times, then forward 10 times.",
        durationSeconds: 60,
        voiceCueText: "Roll your shoulders slowly."
      },
      {
        stepNumber: 2,
        description: "Raise right hand, bend to the left. Swap sides. Hold each for 20 seconds.",
        durationSeconds: 70,
        voiceCueText: "Stretch your side! Reach over!"
      },
      {
        stepNumber: 3,
        description: "Sit on floor, extend legs, reach for your feet. Hold stretch.",
        durationSeconds: 70,
        voiceCueText: "Reach for your toes, breathe out and stretch."
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_focus_champion",
    difficultyLevel: 4, // Medium
    subjectTag: null
  },

  // ==========================================
  // Grade 4 - Medium-Hard, 4 - 5 min
  // ==========================================
  {
    activityId: "act_g4_brain_gym",
    title: "Brain Gym Exercises",
    description: "Draw an infinity sign with your dominant hand, swap, and draw with both hands in the air.",
    emoji: "🧠",
    sourceModule: "AI_TUTOR",
    category: "brain_gym",
    moodTags: ["focus", "coordination"],
    gradeLevels: ["Grade 4"],
    durationSeconds: 240,
    instructions: [
      {
        stepNumber: 1,
        description: "Extend right arm, draw a lazy infinity figure-8 in the air 10 times.",
        durationSeconds: 80,
        voiceCueText: "Draw a lazy 8 in the air with your right hand."
      },
      {
        stepNumber: 2,
        description: "Extend left arm, draw the lazy 8 10 times.",
        durationSeconds: 80,
        voiceCueText: "Draw it with your left hand now."
      },
      {
        stepNumber: 3,
        description: "Use both hands together to trace the figure-8. Promotes left-right brain integration.",
        durationSeconds: 80,
        voiceCueText: "Use both hands together, coordinate your trace!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_focus_champion",
    difficultyLevel: 5, // Medium-Hard
    subjectTag: null
  },
  {
    activityId: "act_g4_focus_breath",
    title: "Focus Breathing",
    description: "Square breathing: inhale 4s, hold 4s, exhale 4s, hold 4s. Excellent for calming nerves.",
    emoji: "😮‍💨",
    sourceModule: "AI_TUTOR",
    category: "focus",
    moodTags: ["calm", "relax"],
    gradeLevels: ["Grade 4"],
    durationSeconds: 250,
    instructions: [
      {
        stepNumber: 1,
        description: "Close your eyes. Inhale for 4 seconds, hold your breath for 4 seconds.",
        durationSeconds: 100,
        voiceCueText: "Inhale... 2... 3... 4... Hold... 2... 3... 4..."
      },
      {
        stepNumber: 2,
        description: "Exhale for 4 seconds, keep lungs empty for 4 seconds. Repeat circuit.",
        durationSeconds: 150,
        voiceCueText: "Exhale... 2... 3... 4... Rest... 2... 3... 4... Inhale again."
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_focus_champion",
    difficultyLevel: 5, // Medium-Hard
    subjectTag: null
  },
  {
    activityId: "act_g4_fitness_circuit",
    title: "Fitness Circuit",
    description: "Fast-paced set of jumping jacks, squats, and running in place.",
    emoji: "🏋️",
    sourceModule: "AI_TUTOR",
    category: "fitness",
    moodTags: ["energize"],
    gradeLevels: ["Grade 4"],
    durationSeconds: 270,
    instructions: [
      {
        stepNumber: 1,
        description: "Jumping Jacks for 60 seconds. Keep high intensity.",
        durationSeconds: 90,
        voiceCueText: "Start with jumping jacks! Let's build up energy!"
      },
      {
        stepNumber: 2,
        description: "Air Squats for 60 seconds. Focus on posture.",
        durationSeconds: 90,
        voiceCueText: "Air squats! Drop down and push back up."
      },
      {
        stepNumber: 3,
        description: "High knees sprint in place for 60 seconds.",
        durationSeconds: 90,
        voiceCueText: "Sprint! Knees high! Finish strong!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_energy_hero",
    difficultyLevel: 5, // Medium-Hard
    subjectTag: null
  },
  {
    activityId: "act_g4_stem_mission",
    title: "STEM Exploration Mission",
    description: "Search your room for items made of plastic, metal, and wood. Compare properties!",
    emoji: "🔬",
    sourceModule: "AI_TUTOR",
    category: "engineering",
    moodTags: ["focus", "fun"],
    gradeLevels: ["Grade 4"],
    durationSeconds: 280,
    instructions: [
      {
        stepNumber: 1,
        description: "Find one object made of metal and one made of plastic.",
        durationSeconds: 140,
        voiceCueText: "Search your desk or room! Find one metal item and one plastic item."
      },
      {
        stepNumber: 2,
        description: "Identify which is a conductor of heat/electricity and return to log them.",
        durationSeconds: 140,
        voiceCueText: "Compare them. Which one feels colder? The metal! It conducts heat away!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_fitness_explorer",
    difficultyLevel: 5, // Medium-Hard
    subjectTag: null
  },
  {
    activityId: "act_g4_cross_lateral",
    title: "Cross-Lateral Movements",
    description: "Draw a circle in the air with your right foot while drawing a square with your left hand.",
    emoji: "🔀",
    sourceModule: "AI_TUTOR",
    category: "brain_gym",
    moodTags: ["focus", "coordination"],
    gradeLevels: ["Grade 4"],
    durationSeconds: 240,
    instructions: [
      {
        stepNumber: 1,
        description: "Sit down. Trace circles in the air with your right big toe.",
        durationSeconds: 80,
        voiceCueText: "Sit back and draw circles with your right foot."
      },
      {
        stepNumber: 2,
        description: "At the same time, trace a square in the air with your left index finger.",
        durationSeconds: 160,
        voiceCueText: "Now try to draw a square with your left hand at the same time! Keep the foot circling!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_focus_champion",
    difficultyLevel: 5, // Medium-Hard
    subjectTag: null
  },
  {
    activityId: "act_g4_energy_challenge",
    title: "Energy Challenge",
    description: "Fast-paced plank-hold and bicycle-crunches circuit to unlock energy points.",
    emoji: "🔥",
    sourceModule: "AI_TUTOR",
    category: "fitness",
    moodTags: ["energize"],
    gradeLevels: ["Grade 4"],
    durationSeconds: 300,
    instructions: [
      {
        stepNumber: 1,
        description: "Plank Hold: Hold a straight arm or forearm plank for 60 seconds.",
        durationSeconds: 100,
        voiceCueText: "Plank hold! Keep your core tight, body flat!"
      },
      {
        stepNumber: 2,
        description: "Bicycle Crunches: Lie on your back and cycle your legs, touching opposite elbows.",
        durationSeconds: 100,
        voiceCueText: "Lie down, lift your shoulders, cycle those legs!"
      },
      {
        stepNumber: 3,
        description: "Child's Pose Rest: Relax and stretch your back.",
        durationSeconds: 100,
        voiceCueText: "Breathe, drop your hips back, and relax your muscles."
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_energy_hero",
    difficultyLevel: 5, // Medium-Hard
    subjectTag: null
  },

  // ==========================================
  // SUBJECT-WISE: English (Tag: ENGLISH_ACTIVITY)
  // ==========================================
  {
    activityId: "act_english_objects_b",
    title: "Find 3 Objects Starting with B",
    description: "Look around your room! Can you find 3 items whose names begin with the letter 'B'?",
    emoji: "🐝",
    sourceModule: "ENGLISH_APP",
    category: "vocabulary",
    moodTags: ["focus", "fun"],
    gradeLevels: ["KG", "Grade 1", "Grade 2", "Grade 3", "Grade 4"],
    durationSeconds: 90,
    instructions: [
      {
        stepNumber: 1,
        description: "Scan your surroundings for things like: Book, Bottle, Box, Bed, Bag, or Brush.",
        durationSeconds: 50,
        voiceCueText: "Search for things starting with B! Find three!"
      },
      {
        stepNumber: 2,
        description: "Touch each item and shout its name out loud: B is for...!",
        durationSeconds: 40,
        voiceCueText: "Touch them and say: B is for book! B is for..."
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_fitness_explorer",
    difficultyLevel: 2,
    subjectTag: "ENGLISH_ACTIVITY"
  },
  {
    activityId: "act_english_character",
    title: "Act Like the Story Character",
    description: "Be an actor! Mimic the movement or posture of your favorite story hero.",
    emoji: "🎭",
    sourceModule: "ENGLISH_APP",
    category: "story acting",
    moodTags: ["fun", "energize"],
    gradeLevels: ["KG", "Grade 1", "Grade 2", "Grade 3", "Grade 4"],
    durationSeconds: 80,
    instructions: [
      {
        stepNumber: 1,
        description: "Think of a story character (like a robot, a wizard, or a brave explorer). Strike their pose!",
        durationSeconds: 30,
        voiceCueText: "Strike a pose like your favorite story character!"
      },
      {
        stepNumber: 2,
        description: "Act out a short action: fly like a superhero or crawl like a detective for 50 seconds.",
        durationSeconds: 50,
        voiceCueText: "Now act! Move around just like they would!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_movement_master",
    difficultyLevel: 2,
    subjectTag: "ENGLISH_ACTIVITY"
  },
  {
    activityId: "act_english_say_words",
    title: "Say 5 New Words Aloud",
    description: "Stretch your vocal cords! Say five new descriptive words aloud while doing a jumping jack for each.",
    emoji: "🗣️",
    sourceModule: "ENGLISH_APP",
    category: "speaking",
    moodTags: ["fun", "energize"],
    gradeLevels: ["KG", "Grade 1", "Grade 2", "Grade 3", "Grade 4"],
    durationSeconds: 60,
    instructions: [
      {
        stepNumber: 1,
        description: "Think of 5 words (e.g. Gigantic, Energetic, Electric, Spark, Joyful).",
        durationSeconds: 15,
        voiceCueText: "Get ready to speak and move!"
      },
      {
        stepNumber: 2,
        description: "Do a jumping jack and shout one word! Repeat 5 times.",
        durationSeconds: 45,
        voiceCueText: "Jump! Shout word 1! Jump! Shout word 2! One, two, three, four, five!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_energy_hero",
    difficultyLevel: 2,
    subjectTag: "ENGLISH_ACTIVITY"
  },

  // ==========================================
  // SUBJECT-WISE: Mathematics (Tag: MATH_ACTIVITY)
  // ==========================================
  {
    activityId: "act_math_jump_10",
    title: "Jump 10 Times",
    description: "Let's count! Do 10 quick vertical jumps and count them off out loud.",
    emoji: "🦘",
    sourceModule: "MATH_APP",
    category: "counting",
    moodTags: ["energize", "fun"],
    gradeLevels: ["KG", "Grade 1", "Grade 2", "Grade 3", "Grade 4"],
    durationSeconds: 60,
    instructions: [
      {
        stepNumber: 1,
        description: "Bend knees, swing arms, and do 10 consecutive jumps. Count 1 to 10.",
        durationSeconds: 60,
        voiceCueText: "Jump 10 times! Count: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_movement_master",
    difficultyLevel: 2,
    subjectTag: "MATH_ACTIVITY"
  },
  {
    activityId: "act_math_find_5_circular",
    title: "Find 5 Circular Objects",
    description: "Scan your surroundings. Point out 5 circular or round objects.",
    emoji: "⭕",
    sourceModule: "MATH_APP",
    category: "shapes",
    moodTags: ["focus", "fun"],
    gradeLevels: ["KG", "Grade 1", "Grade 2", "Grade 3", "Grade 4"],
    durationSeconds: 100,
    instructions: [
      {
        stepNumber: 1,
        description: "Locate 5 round things: clock, buttons, caps, plates, or wheels.",
        durationSeconds: 60,
        voiceCueText: "Find 5 circle shapes around you!"
      },
      {
        stepNumber: 2,
        description: "Trace a giant circle in the air with each arm 5 times.",
        durationSeconds: 40,
        voiceCueText: "Draw big circles in the air with your arms!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_fitness_explorer",
    difficultyLevel: 2,
    subjectTag: "MATH_ACTIVITY"
  },
  {
    activityId: "act_math_count_steps",
    title: "Count Steps Around Room",
    description: "Measure the room! Count how many steps it takes to walk from one wall to another.",
    emoji: "🚶",
    sourceModule: "MATH_APP",
    category: "measurement",
    moodTags: ["focus", "calm"],
    gradeLevels: ["KG", "Grade 1", "Grade 2", "Grade 3", "Grade 4"],
    durationSeconds: 90,
    instructions: [
      {
        stepNumber: 1,
        description: "Walk in a straight line from one side of the room to the other, counting every step.",
        durationSeconds: 45,
        voiceCueText: "Walk and count your paces. One, two, three..."
      },
      {
        stepNumber: 2,
        description: "Turn around and walk back, trying to take the exact same number of steps.",
        durationSeconds: 45,
        voiceCueText: "Now walk back. Can you make it in the same number of steps?"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_focus_champion",
    difficultyLevel: 2,
    subjectTag: "MATH_ACTIVITY"
  },

  // ==========================================
  // SUBJECT-WISE: STEM & Circuits (Tag: STEM_ACTIVITY)
  // ==========================================
  {
    activityId: "act_stem_devices",
    title: "Find 3 Electrical Devices",
    description: "Engineering Hunt! Locate 3 objects in the room that plug into the wall or use batteries.",
    emoji: "🔌",
    sourceModule: "STEM_APP",
    category: "engineering",
    moodTags: ["focus", "fun"],
    gradeLevels: ["KG", "Grade 1", "Grade 2", "Grade 3", "Grade 4"],
    durationSeconds: 120,
    instructions: [
      {
        stepNumber: 1,
        description: "Search for electronics: computer, tablet, lamp, charger, fan, or clock.",
        durationSeconds: 70,
        voiceCueText: "Find three things that use electricity!"
      },
      {
        stepNumber: 2,
        description: "Touch them safely (never touch open sockets!) and stretch your arms out.",
        durationSeconds: 50,
        voiceCueText: "Point to them and stretch your shoulders out."
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_fitness_explorer",
    difficultyLevel: 3,
    subjectTag: "STEM_ACTIVITY"
  },
  {
    activityId: "act_stem_battery",
    title: "Identify Battery-Operated Objects",
    description: "Look for devices powered by portable cells/batteries. Point to at least two!",
    emoji: "🔋",
    sourceModule: "STEM_APP",
    category: "engineering",
    moodTags: ["focus", "fun"],
    gradeLevels: ["KG", "Grade 1", "Grade 2", "Grade 3", "Grade 4"],
    durationSeconds: 100,
    instructions: [
      {
        stepNumber: 1,
        description: "Search for battery items: remote control, wireless mouse, toys, or flashlight.",
        durationSeconds: 60,
        voiceCueText: "Find two objects that have batteries inside!"
      },
      {
        stepNumber: 2,
        description: "Hop 5 times next to each battery-powered object you found.",
        durationSeconds: 40,
        voiceCueText: "Hop 5 times on one foot near the object!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_movement_master",
    difficultyLevel: 3,
    subjectTag: "STEM_ACTIVITY"
  },
  {
    activityId: "act_stem_switch",
    title: "Find one Switch in your Room",
    description: "Circuits in action! Find a light switch or power button and toggle it (or point to it).",
    emoji: "🎛️",
    sourceModule: "STEM_APP",
    category: "engineering",
    moodTags: ["focus", "fun"],
    gradeLevels: ["KG", "Grade 1", "Grade 2", "Grade 3", "Grade 4"],
    durationSeconds: 90,
    instructions: [
      {
        stepNumber: 1,
        description: "Walk to the nearest wall light switch or appliance power button.",
        durationSeconds: 45,
        voiceCueText: "Locate a switch on the wall or on a device."
      },
      {
        stepNumber: 2,
        description: "Stand in front of it and do a deep overhead stretch to reach toward it.",
        durationSeconds: 45,
        voiceCueText: "Reach up tall to point to the switch, hold the stretch!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_focus_champion",
    difficultyLevel: 3,
    subjectTag: "STEM_ACTIVITY"
  },
  {
    activityId: "act_stem_led",
    title: "Observe an LED Indicator",
    description: "LED check! Locate a tiny glowing indicator light on a charger, router, or computer screen.",
    emoji: "🚨",
    sourceModule: "STEM_APP",
    category: "engineering",
    moodTags: ["focus", "calm"],
    gradeLevels: ["KG", "Grade 1", "Grade 2", "Grade 3", "Grade 4"],
    durationSeconds: 90,
    instructions: [
      {
        stepNumber: 1,
        description: "Find a small glowing light indicator (green, red, or blue).",
        durationSeconds: 45,
        voiceCueText: "Look for a tiny glowing light on any electronic box."
      },
      {
        stepNumber: 2,
        description: "Look at it and take 3 deep belly breaths, focusing on its solid glow.",
        durationSeconds: 45,
        voiceCueText: "Look at the light, breathe in slowly, and breathe out."
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_focus_champion",
    difficultyLevel: 3,
    subjectTag: "STEM_ACTIVITY"
  },

  // ==========================================
  // SUBJECT-WISE: Problem Solving & Logic (Tag: LOGIC_ACTIVITY)
  // ==========================================
  {
    activityId: "act_logic_memory",
    title: "Memory Challenge",
    description: "Look at 5 items on your desk. Close your eyes, spin, and recite them from memory!",
    emoji: "🧠",
    sourceModule: "LOGIC_APP",
    category: "brain_gym",
    moodTags: ["focus", "coordination"],
    gradeLevels: ["KG", "Grade 1", "Grade 2", "Grade 3", "Grade 4"],
    durationSeconds: 110,
    instructions: [
      {
        stepNumber: 1,
        description: "Stare at 5 objects for 30 seconds. Close eyes.",
        durationSeconds: 40,
        voiceCueText: "Look at 5 things. Memorize them. Now close your eyes!"
      },
      {
        stepNumber: 2,
        description: "Spin around in a circle twice, then list the 5 items out loud with eyes closed.",
        durationSeconds: 70,
        voiceCueText: "Spin around twice! Now say the 5 items out loud!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_focus_champion",
    difficultyLevel: 3,
    subjectTag: "LOGIC_ACTIVITY"
  },
  {
    activityId: "act_logic_pattern_walk",
    title: "Pattern Walk",
    description: "Walk in patterns: 2 giant steps forward, 1 squat, 2 baby steps back, 1 clap.",
    emoji: "🚶",
    sourceModule: "LOGIC_APP",
    category: "brain_gym",
    moodTags: ["focus", "coordination"],
    gradeLevels: ["KG", "Grade 1", "Grade 2", "Grade 3", "Grade 4"],
    durationSeconds: 120,
    instructions: [
      {
        stepNumber: 1,
        description: "Perform the sequence: 2 giant steps forward, squat down, 2 tiny steps back, clap.",
        durationSeconds: 60,
        voiceCueText: "Giant step, giant step! Squat! Baby step, baby step! Clap!"
      },
      {
        stepNumber: 2,
        description: "Repeat the pattern backward starting with the clap.",
        durationSeconds: 60,
        voiceCueText: "Try it in reverse! Clap! Baby steps! Squat! Giant steps!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_focus_champion",
    difficultyLevel: 3,
    subjectTag: "LOGIC_ACTIVITY"
  },
  {
    activityId: "act_logic_simon_says",
    title: "Simon Says (Logic Break)",
    description: "Perform opposite actions: when Simon says JUMP, you SQUAT. If Simon says TOUCH EARS, touch toes!",
    emoji: "🗣️",
    sourceModule: "LOGIC_APP",
    category: "brain_gym",
    moodTags: ["focus", "fun"],
    gradeLevels: ["KG", "Grade 1", "Grade 2", "Grade 3", "Grade 4"],
    durationSeconds: 120,
    instructions: [
      {
        stepNumber: 1,
        description: "Simon Says JUMP -> You SQUAT! Simon Says STAND -> You LIE DOWN!",
        durationSeconds: 60,
        voiceCueText: "Opposite Simon says! Simon says: JUMP! (You squat!) Simon says: STAND! (You sit!)"
      },
      {
        stepNumber: 2,
        description: "Simon Says CLAP -> You STOMP! Touch head -> Do nothing!",
        durationSeconds: 60,
        voiceCueText: "Simon says: CLAP! (You stomp!) Touch your nose! (Simon didn't say!)"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_focus_champion",
    difficultyLevel: 3,
    subjectTag: "LOGIC_ACTIVITY"
  },
  {
    activityId: "act_logic_coordination",
    title: "Coordination Challenge",
    description: "Tap your head with your right hand while rubbing your stomach in a circle with your left hand.",
    emoji: "🔀",
    sourceModule: "LOGIC_APP",
    category: "brain_gym",
    moodTags: ["focus", "coordination"],
    gradeLevels: ["KG", "Grade 1", "Grade 2", "Grade 3", "Grade 4"],
    durationSeconds: 100,
    instructions: [
      {
        stepNumber: 1,
        description: "Tap your head up and down with your right hand. Establish a steady tapping.",
        durationSeconds: 30,
        voiceCueText: "Tap your head with your right hand."
      },
      {
        stepNumber: 2,
        description: "Rub your stomach in circles with your left hand at the same time. Keep tapping!",
        durationSeconds: 70,
        voiceCueText: "Now rub your tummy with your left hand at the same time! Don't stop tapping!"
      }
    ],
    starsOnCompletion: 5,
    badgeId: "badge_focus_champion",
    difficultyLevel: 3,
    subjectTag: "LOGIC_ACTIVITY"
  }
];
