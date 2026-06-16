const SYLLABUS = {
  'KG': [
    {
      id: 'lesson-kg-1',
      grade: 'KG',
      type: 'quiz',
      icon: '⚡',
      title: 'What is Electricity? ⚡',
      topic: 'Introduction to Electricity',
      description: 'Electricity gives power to things around us so they can work!',
      learningObjective: 'Understand that electricity provides power to objects.',
      realWorldApp: 'Flashlights, toys, and tablets all need electricity to turn on.',
      vocab: ['Electricity', 'Power', 'Device'],
      quiz: {
        question: 'Which of these needs electricity to work?',
        options: ['A wooden block', 'A flashlight', 'An apple'],
        correctIndex: 1
      }
    },
    {
      id: 'lesson-kg-2',
      grade: 'KG',
      type: 'quiz',
      icon: '🛡️',
      title: 'Safe and Unsafe 🛡️',
      topic: 'Electrical Safety',
      description: 'Not everything is safe to touch! We must be careful around electricity.',
      learningObjective: 'Identify safe and unsafe electrical behaviors.',
      realWorldApp: 'Never put water near plugs or play with broken wires.',
      vocab: ['Safe', 'Unsafe', 'Plug'],
      quiz: {
        question: 'Is it safe to play with a broken wire?',
        options: ['Yes, it is fun', 'No, it is dangerous', 'Only if it is colorful'],
        correctIndex: 1
      }
    },
    {
      id: 'lesson-kg-3',
      grade: 'KG',
      type: 'activity',
      icon: '🔋',
      title: 'Light Up Sparky! 🔋',
      topic: 'Batteries & Bulbs',
      description: 'Oh no, Sparky the lightbulb is asleep! Can you complete the wire loop to wake him up?',
      learningObjective: 'Complete a basic circuit using a battery and a bulb.',
      realWorldApp: 'Just like putting a battery in a toy to make it move!',
      challengeInstructions: 'Ensure you have a Battery in the left slot and a Bulb in the right slot. Connect them to form a complete circular path.',
      vocab: ['Battery', 'Bulb', 'Loop'],
      circuitConfig: ['BATTERY', 'WIRE', 'BULB', 'WIRE'],
      targetConditions: { requiresBulb: true, requiresFlowing: true }
    },
    {
      id: 'lesson-kg-4',
      grade: 'KG',
      type: 'activity',
      icon: '🌟',
      title: 'Double Sparky Glow! 🌟',
      topic: 'Batteries & Bulbs',
      description: 'Let\'s double the power! Can you connect two bulbs in the loop?',
      learningObjective: 'Understand that multiple items can be powered in a loop.',
      realWorldApp: 'Holiday lights have many bulbs connected together.',
      challengeInstructions: 'Place two bulbs in the circuit loop so both can glow at the same time.',
      vocab: ['Battery', 'Bulb', 'Voltage'],
      circuitConfig: ['BATTERY', 'BULB', 'BULB', 'WIRE'],
      targetConditions: { requiresBulbCount: 2, requiresFlowing: true }
    },
    {
      id: 'lesson-kg-5',
      grade: 'KG',
      type: 'quiz',
      icon: '🔋',
      title: 'Battery Basics 🔋',
      topic: 'Batteries',
      description: 'Batteries store electricity so we can take it anywhere.',
      learningObjective: 'Learn that batteries are portable power sources.',
      realWorldApp: 'Remote controls use batteries so they don\'t need a wall plug.',
      vocab: ['Battery', 'Store', 'Portable'],
      quiz: {
        question: 'What does a battery do?',
        options: ['Makes water cold', 'Stores electricity', 'Plays music'],
        correctIndex: 1
      }
    },
    {
      id: 'lesson-kg-6',
      grade: 'KG',
      type: 'activity',
      icon: '🔄',
      title: 'Make it Flow 🔄',
      topic: 'Circuit Loops',
      description: 'Electricity needs a full circle to flow. Let\'s build one!',
      learningObjective: 'Identify that a closed loop is needed for electricity to flow.',
      realWorldApp: 'If a wire is broken, a toy car will stop moving.',
      challengeInstructions: 'Place a Battery and connect all the wires to make a full circle.',
      vocab: ['Circle', 'Flow', 'Connect'],
      circuitConfig: ['BATTERY', 'WIRE', 'WIRE', 'WIRE'],
      targetConditions: { requiresFlowing: true }
    },
    {
      id: 'lesson-kg-7',
      grade: 'KG',
      type: 'quiz',
      icon: '💡',
      title: 'Light and Dark 💡',
      topic: 'Light Bulbs',
      description: 'Bulbs turn electricity into light to help us see in the dark.',
      learningObjective: 'Understand the function of a light bulb.',
      realWorldApp: 'Lamps light up our rooms at night.',
      vocab: ['Light', 'Dark', 'See'],
      quiz: {
        question: 'Why do we use light bulbs?',
        options: ['To see in the dark', 'To make noise', 'To fly'],
        correctIndex: 0
      }
    },
    {
      id: 'lesson-kg-8',
      grade: 'KG',
      type: 'activity',
      icon: '✨',
      title: 'Sparky & Friends ✨',
      topic: 'Circuit Building',
      description: 'Use what you learned to make Sparky shine super bright!',
      learningObjective: 'Combine previous knowledge to build a working circuit.',
      realWorldApp: 'You are an engineer building a real machine!',
      challengeInstructions: 'Add a Battery, a Wire, and a Bulb to complete the level.',
      vocab: ['Engineer', 'Build', 'Shine'],
      circuitConfig: ['BATTERY', 'WIRE', 'BULB', 'WIRE'],
      targetConditions: { requiresBulb: true, requiresFlowing: true }
    }
  ],
  'Grade 1': [
    {
      id: 'lesson-g1-1',
      grade: 'Grade 1',
      type: 'quiz',
      icon: '🪙',
      title: 'What is a Conductor? 🪙',
      topic: 'Conductors',
      description: 'Some materials let electricity pass through them easily. They are called conductors.',
      learningObjective: 'Define what a conductor is.',
      realWorldApp: 'Wires are made of metal because metal is a great conductor.',
      vocab: ['Conductor', 'Metal', 'Electricity'],
      quiz: {
        question: 'Which of these is a good conductor?',
        options: ['A metal coin', 'A wooden stick', 'A plastic block'],
        correctIndex: 0
      }
    },
    {
      id: 'lesson-g1-2',
      grade: 'Grade 1',
      type: 'quiz',
      icon: '🪵',
      title: 'What is an Insulator? 🪵',
      topic: 'Insulators',
      description: 'Some materials stop electricity from flowing. They are called insulators.',
      learningObjective: 'Define what an insulator is.',
      realWorldApp: 'Wires are covered in plastic (an insulator) so we don\'t get shocked.',
      vocab: ['Insulator', 'Plastic', 'Wood'],
      quiz: {
        question: 'Why do we use insulators?',
        options: ['To make electricity go faster', 'To stop electricity from flowing', 'To make things shiny'],
        correctIndex: 1
      }
    },
    {
      id: 'lesson-g1-3',
      grade: 'Grade 1',
      type: 'activity',
      icon: '🪙',
      title: 'Metal vs Wood (Conductors) 🪙',
      topic: 'Conductors & Insulators',
      description: 'Test different household materials to find out which ones let electrical current pass!',
      learningObjective: 'Test materials to classify them as conductors or insulators.',
      realWorldApp: 'Electricians test materials before using them to build houses.',
      challengeInstructions: 'Select a conductive material (like a Gold Coin or Metal Paperclip) to place in the Material Slot and close the loop.',
      vocab: ['Conductor', 'Insulator', 'Material'],
      circuitConfig: ['BATTERY', 'WIRE', 'TEST_SLOT', 'WIRE'],
      targetConditions: { requiresConductor: true, requiresFlowing: true }
    },
    {
      id: 'lesson-g1-4',
      grade: 'Grade 1',
      type: 'activity',
      icon: '📎',
      title: 'Double Metal Test 🪙📎',
      topic: 'Conductors & Insulators',
      description: 'Can you complete a circuit with multiple conductive materials?',
      learningObjective: 'Demonstrate that electricity can flow through multiple conductors.',
      realWorldApp: 'Long power lines use many pieces of metal connected together.',
      challengeInstructions: 'Add conductive materials to both slots to let the current travel safely through both.',
      vocab: ['Conductor', 'Pathway', 'Connect'],
      circuitConfig: ['BATTERY', 'TEST_SLOT', 'TEST_SLOT', 'WIRE'],
      targetConditions: { requiresMultipleConducers: true, requiresFlowing: true }
    },
    {
      id: 'lesson-g1-5',
      grade: 'Grade 1',
      type: 'activity',
      icon: '🌉',
      title: 'Paperclip Bridge 🌉',
      topic: 'Conductors',
      description: 'Use a paperclip to bridge the gap and light up the bulb!',
      learningObjective: 'Use a specific metal object as a conductor.',
      realWorldApp: 'Paperclips are made of steel, which conducts electricity.',
      challengeInstructions: 'Put a Paperclip in the test slot and a Bulb in another slot to see it glow.',
      vocab: ['Bridge', 'Steel', 'Glow'],
      circuitConfig: ['BATTERY', 'TEST_SLOT', 'BULB', 'WIRE'],
      targetConditions: { requiresConductor: true, requiresBulb: true, requiresFlowing: true }
    },
    {
      id: 'lesson-g1-6',
      grade: 'Grade 1',
      type: 'quiz',
      icon: '🔌',
      title: 'Wire check 🔌',
      topic: 'Wires',
      description: 'Wires are the roads that electricity travels on.',
      learningObjective: 'Understand that wires provide a path for electricity.',
      realWorldApp: 'Look behind a TV—you will see many wire roads!',
      vocab: ['Wire', 'Travel', 'Path'],
      quiz: {
        question: 'What is inside a wire?',
        options: ['Water', 'Metal', 'Air'],
        correctIndex: 1
      }
    },
    {
      id: 'lesson-g1-7',
      grade: 'Grade 1',
      type: 'activity',
      icon: '💡',
      title: 'Glowing Coins 💡',
      topic: 'Testing Materials',
      description: 'Can a coin make a lightbulb turn on? Let\'s find out!',
      learningObjective: 'Observe the effect of a conductor in a circuit with a bulb.',
      realWorldApp: 'Coins are made of metals like copper and zinc.',
      challengeInstructions: 'Place a Coin in the test slot and a Bulb in the circuit.',
      vocab: ['Coin', 'Copper', 'Zinc'],
      circuitConfig: ['BATTERY', 'WIRE', 'BULB', 'TEST_SLOT'],
      targetConditions: { requiresConductor: true, requiresBulb: true, requiresFlowing: true }
    },
    {
      id: 'lesson-g1-8',
      grade: 'Grade 1',
      type: 'quiz',
      icon: '🏁',
      title: 'Energy Flow 🏁',
      topic: 'Review',
      description: 'Electricity flows from the battery, through the wires, and back!',
      learningObjective: 'Review how energy flows through a complete circuit.',
      realWorldApp: 'Everything must be connected for the magic to happen.',
      vocab: ['Flow', 'Energy', 'Complete'],
      quiz: {
        question: 'If a wire is broken, what happens to the light bulb?',
        options: ['It gets brighter', 'It turns off', 'It changes color'],
        correctIndex: 1
      }
    }
  ],
  'Grade 2': [
    {
      id: 'lesson-g2-1',
      grade: 'Grade 2',
      type: 'quiz',
      icon: '🎚️',
      title: 'What is a Switch? 🎚️',
      topic: 'Switches',
      description: 'A switch is like a drawbridge. It can open or close the path for electricity.',
      learningObjective: 'Understand the basic function of a switch in a circuit.',
      realWorldApp: 'We use light switches every day to turn lights on and off.',
      vocab: ['Switch', 'Bridge', 'Control'],
      quiz: {
        question: 'What does a switch do?',
        options: ['Creates electricity', 'Opens or closes the circuit', 'Makes things heavy'],
        correctIndex: 1
      }
    },
    {
      id: 'lesson-g2-2',
      grade: 'Grade 2',
      type: 'activity',
      icon: '🔌',
      title: 'The Secret Switch 🔌',
      topic: 'Switches & Controls',
      description: 'Add a switch gate to safely turn your electrical current on and off!',
      learningObjective: 'Insert a switch into a circuit and operate it.',
      realWorldApp: 'When you turn off a toy, a switch inside breaks the circuit.',
      challengeInstructions: 'Place a Switch component in the circuit. Click the switch on the board to toggle it CLOSED.',
      vocab: ['Switch', 'Open Gate', 'Closed Gate'],
      circuitConfig: ['BATTERY', 'SWITCH', 'BULB', 'WIRE'],
      targetConditions: { requiresSwitch: true, requiresSwitchClosed: true, requiresFlowing: true }
    },
    {
      id: 'lesson-g2-3',
      grade: 'Grade 2',
      type: 'quiz',
      icon: '🔓',
      title: 'Open vs Closed 🔓',
      topic: 'Switch States',
      description: 'An OPEN switch stops electricity. A CLOSED switch lets it flow.',
      learningObjective: 'Differentiate between open and closed circuits.',
      realWorldApp: 'When a door is closed, you can walk across it if it\'s a trapdoor!',
      vocab: ['Open', 'Closed', 'State'],
      quiz: {
        question: 'To turn ON a light, the switch must be...',
        options: ['Open', 'Closed', 'Broken'],
        correctIndex: 1
      }
    },
    {
      id: 'lesson-g2-4',
      grade: 'Grade 2',
      type: 'activity',
      icon: '🎛️',
      title: 'Double Switch Control 🎛️',
      topic: 'Logic with Switches',
      description: 'Add two switches in the loop so both must be closed to turn the light on!',
      learningObjective: 'Create a series circuit with two switches.',
      realWorldApp: 'Some big machines require two buttons to be pressed at once for safety.',
      challengeInstructions: 'Place two switches in the loop. Click both switches on the board to toggle them CLOSED.',
      vocab: ['Switch', 'Logic', 'Gate'],
      circuitConfig: ['BATTERY', 'SWITCH', 'BULB', 'SWITCH'],
      targetConditions: { requiresMultipleSwitches: true, requiresSwitchesClosed: true, requiresFlowing: true }
    },
    {
      id: 'lesson-g2-5',
      grade: 'Grade 2',
      type: 'activity',
      icon: '💡',
      title: 'Switch off the light 💡',
      topic: 'Controlling Output',
      description: 'Can you build a circuit and use a switch to turn it OFF?',
      learningObjective: 'Demonstrate breaking a circuit intentionally.',
      realWorldApp: 'Turning off lights saves energy when we leave a room.',
      challengeInstructions: 'Add a battery, a bulb, and a switch. Leave the switch OPEN so the bulb is off!',
      vocab: ['Energy', 'Save', 'Off'],
      circuitConfig: ['BATTERY', 'SWITCH', 'BULB', 'WIRE'],
      targetConditions: { requiresSwitch: true, requiresSwitchOpen: true, requiresBulb: true }
    },
    {
      id: 'lesson-g2-6',
      grade: 'Grade 2',
      type: 'quiz',
      icon: '👷',
      title: 'Safety First 👷',
      topic: 'Safety',
      description: 'Switches help us safely control electricity without touching wires.',
      learningObjective: 'Identify safety benefits of using switches.',
      realWorldApp: 'Wall switches keep our hands far away from the electrical wires inside the wall.',
      vocab: ['Safety', 'Protect', 'Touch'],
      quiz: {
        question: 'Why do we use plastic switches on walls?',
        options: ['Because plastic looks nice', 'Plastic is an insulator so we don\'t get shocked', 'Plastic makes the electricity stronger'],
        correctIndex: 1
      }
    },
    {
      id: 'lesson-g2-7',
      grade: 'Grade 2',
      type: 'activity',
      icon: '⚙️',
      title: 'Series Switch ⚙️',
      topic: 'Circuit Building',
      description: 'Build a full loop with a switch, but put the switch on the bottom!',
      learningObjective: 'Understand that a switch can be placed anywhere in a series circuit.',
      realWorldApp: 'It doesn\'t matter where the switch is on a wire, it still stops the flow!',
      challengeInstructions: 'Place the Battery on the left, the Bulb on top, and the Switch on the bottom. Close the switch!',
      vocab: ['Series', 'Bottom', 'Anywhere'],
      circuitConfig: ['BATTERY', 'BULB', 'WIRE', 'SWITCH'],
      targetConditions: { requiresSwitch: true, requiresSwitchClosed: true, requiresBulb: true, requiresFlowing: true }
    },
    {
      id: 'lesson-g2-8',
      grade: 'Grade 2',
      type: 'activity',
      icon: '🏁',
      title: 'Master Controller 🏁',
      topic: 'Review Activity',
      description: 'Time for the final Grade 2 challenge. Two bulbs and a switch!',
      learningObjective: 'Control multiple outputs with a single switch.',
      realWorldApp: 'One wall switch can turn on all the lights in the ceiling.',
      challengeInstructions: 'Add a Battery, a Switch, and TWO Bulbs. Close the switch to light them both!',
      vocab: ['Master', 'Control', 'Multiple'],
      circuitConfig: ['BATTERY', 'SWITCH', 'BULB', 'BULB'],
      targetConditions: { requiresSwitch: true, requiresSwitchClosed: true, requiresBulbCount: 2, requiresFlowing: true }
    }
  ],
  'Grade 3': [
    {
      id: 'lesson-g3-1',
      grade: 'Grade 3',
      type: 'quiz',
      icon: '🌀',
      title: 'What is a Motor? 🌀',
      topic: 'Motors',
      description: 'Motors turn electrical energy into movement or motion.',
      learningObjective: 'Understand energy conversion in motors.',
      realWorldApp: 'Electric cars and desk fans use motors to spin!',
      vocab: ['Motor', 'Motion', 'Spin'],
      quiz: {
        question: 'A motor turns electricity into...',
        options: ['Light', 'Movement', 'Water'],
        correctIndex: 1
      }
    },
    {
      id: 'lesson-g3-2',
      grade: 'Grade 3',
      type: 'activity',
      icon: '🌀',
      title: 'Spinning Fan Motor 🌀',
      topic: 'Electric Motors',
      description: 'Convert electricity into motion by powering a fast-spinning fan motor!',
      learningObjective: 'Build a circuit containing a motor.',
      realWorldApp: 'When you turn on a fan, electricity flows through the motor to spin the blades.',
      challengeInstructions: 'Insert a Fan Motor in the consumer slot. Turn on the switch and watch the blades spin!',
      vocab: ['Motor', 'Energy Conversion', 'Force'],
      circuitConfig: ['BATTERY', 'SWITCH', 'FAN', 'WIRE'],
      targetConditions: { requiresFan: true, requiresSwitchClosed: true, requiresFlowing: true }
    },
    {
      id: 'lesson-g3-3',
      grade: 'Grade 3',
      type: 'quiz',
      icon: '⚖️',
      title: 'Voltage Share ⚖️',
      topic: 'Sharing Power',
      description: 'When we put two things in a loop, they have to share the battery\'s power.',
      learningObjective: 'Understand voltage drop across multiple components in series.',
      realWorldApp: 'If you plug too many things into a weak battery, they won\'t work well.',
      vocab: ['Share', 'Voltage', 'Weak'],
      quiz: {
        question: 'If you add a bulb and a fan to the same battery loop, what happens?',
        options: ['They explode', 'They share the power and might be weaker', 'They get much stronger'],
        correctIndex: 1
      }
    },
    {
      id: 'lesson-g3-4',
      grade: 'Grade 3',
      type: 'activity',
      icon: '💡',
      title: 'Spin & Shine 🌀💡',
      topic: 'Electric Motors & Bulbs',
      description: 'Power a fan motor and a lightbulb at the same time in the same loop!',
      learningObjective: 'Create a circuit with different types of loads.',
      realWorldApp: 'A hairdryer has a motor for the fan and a heater—two different components!',
      challengeInstructions: 'Insert a Fan Motor and a Lightbulb in the circuit loop. Turn on the switch to see both work!',
      vocab: ['Motor', 'Bulb', 'Voltage Share'],
      circuitConfig: ['BATTERY', 'SWITCH', 'BULB', 'FAN'],
      targetConditions: { requiresFanBulbCombo: true, requiresSwitchClosed: true, requiresFlowing: true }
    },
    {
      id: 'lesson-g3-5',
      grade: 'Grade 3',
      type: 'activity',
      icon: '💨',
      title: 'Double Fan Power 💨',
      topic: 'Multiple Motors',
      description: 'Can you run two fans from one battery?',
      learningObjective: 'Operate multiple motors in series.',
      realWorldApp: 'Drones use 4 small motors to fly!',
      challengeInstructions: 'Place TWO Fan Motors in the circuit. Close the switch to spin them.',
      vocab: ['Drone', 'Double', 'Spin'],
      circuitConfig: ['BATTERY', 'SWITCH', 'FAN', 'FAN'],
      targetConditions: { requiresFanCount: 2, requiresSwitchClosed: true, requiresFlowing: true }
    },
    {
      id: 'lesson-g3-6',
      grade: 'Grade 3',
      type: 'quiz',
      icon: '🔄',
      title: 'Energy Conversion 🔄',
      topic: 'Energy',
      description: 'Electricity can become light, heat, sound, or motion!',
      learningObjective: 'Identify different forms of energy conversion.',
      realWorldApp: 'A toaster turns electricity into heat. A TV turns it into light and sound.',
      vocab: ['Conversion', 'Heat', 'Sound'],
      quiz: {
        question: 'What does a buzzer turn electricity into?',
        options: ['Light', 'Sound', 'Motion'],
        correctIndex: 1
      }
    },
    {
      id: 'lesson-g3-7',
      grade: 'Grade 3',
      type: 'activity',
      icon: '🔔',
      title: 'Make some Noise! 🔔',
      topic: 'Buzzers',
      description: 'Let\'s turn electricity into sound using a buzzer!',
      learningObjective: 'Incorporate an audio output device into a circuit.',
      realWorldApp: 'Doorbells use buzzers to let you know someone is there.',
      challengeInstructions: 'Place a Buzzer and a Switch in the circuit. Close the switch to hear it!',
      vocab: ['Buzzer', 'Sound', 'Alarm'],
      circuitConfig: ['BATTERY', 'SWITCH', 'BUZZER', 'WIRE'],
      targetConditions: { requiresBuzzer: true, requiresSwitchClosed: true, requiresFlowing: true }
    },
    {
      id: 'lesson-g3-8',
      grade: 'Grade 3',
      type: 'activity',
      icon: '🎉',
      title: 'The Party Circuit 🎉',
      topic: 'Review Activity',
      description: 'Let\'s make noise and light at the same time!',
      learningObjective: 'Combine a light source and a sound source in one circuit.',
      realWorldApp: 'Fire alarms flash lights and make loud sounds to keep us safe.',
      challengeInstructions: 'Add a Bulb, a Buzzer, and a Switch. Close the switch to start the party!',
      vocab: ['Party', 'Combine', 'Alarm'],
      circuitConfig: ['BATTERY', 'SWITCH', 'BULB', 'BUZZER'],
      targetConditions: { requiresBuzzer: true, requiresBulb: true, requiresSwitchClosed: true, requiresFlowing: true }
    }
  ],
  'Grade 4': [
    {
      id: 'lesson-g4-1',
      grade: 'Grade 4',
      type: 'quiz',
      icon: '🛡️',
      title: 'What is Resistance? 🛡️',
      topic: 'Resistance',
      description: 'Resistance is like a speed-bump for electricity. It slows down the flow.',
      learningObjective: 'Define resistance and its purpose in a circuit.',
      realWorldApp: 'Resistors stop too much electricity from burning out small LED lights.',
      vocab: ['Resistance', 'Speed-bump', 'Flow'],
      quiz: {
        question: 'What does a resistor do?',
        options: ['Makes electricity go faster', 'Slows down the flow of electricity', 'Stores electricity'],
        correctIndex: 1
      }
    },
    {
      id: 'lesson-g4-2',
      grade: 'Grade 4',
      type: 'activity',
      icon: '🔔',
      title: 'Buzzer Safety Shield 🛡️',
      topic: 'Resistance & Safety',
      description: 'Build a warning system with a buzzer and protect it using a Resistor speed-bump!',
      learningObjective: 'Use a resistor to limit current flow to an output device.',
      realWorldApp: 'Without resistors, sensitive electronics like computers would break instantly.',
      challengeInstructions: 'Wire a Battery, Switch, Buzzer, and Resistor in a loop. Close the switch and slide the resistor size to change the current.',
      vocab: ['Resistor', 'Ohm\'s Law', 'Buzzer'],
      circuitConfig: ['BATTERY', 'SWITCH', 'BUZZER', 'RESISTOR'],
      targetConditions: { requiresBuzzer: true, requiresResistor: true, requiresSwitchClosed: true }
    },
    {
      id: 'lesson-g4-3',
      grade: 'Grade 4',
      type: 'quiz',
      icon: '⚖️',
      title: 'Ohm\'s Law Basics ⚖️',
      topic: 'Ohm\'s Law',
      description: 'More resistance means less current. Less resistance means more current!',
      learningObjective: 'Understand the inverse relationship between resistance and current.',
      realWorldApp: 'When you turn a volume knob down, you are actually increasing resistance!',
      vocab: ['Ohm', 'Current', 'Inverse'],
      quiz: {
        question: 'If you add MORE resistance, what happens to the electricity flow?',
        options: ['It flows more', 'It flows less', 'It stays the same'],
        correctIndex: 1
      }
    },
    {
      id: 'lesson-g4-4',
      grade: 'Grade 4',
      type: 'activity',
      icon: '💡',
      title: 'Dimming the Light 💡',
      topic: 'Variable Resistance',
      description: 'Use a resistor to change how bright the bulb is!',
      learningObjective: 'Observe how changing resistance affects a bulb\'s brightness.',
      realWorldApp: 'Dimmer switches on walls use variable resistors to change the light level.',
      challengeInstructions: 'Place a Battery, Switch, Bulb, and Resistor. Adjust the resistor slider while the switch is closed.',
      vocab: ['Dimmer', 'Brightness', 'Variable'],
      circuitConfig: ['BATTERY', 'SWITCH', 'BULB', 'RESISTOR'],
      targetConditions: { requiresBulb: true, requiresResistor: true, requiresSwitchClosed: true }
    },
    {
      id: 'lesson-g4-5',
      grade: 'Grade 4',
      type: 'quiz',
      icon: '🌡️',
      title: 'Heat from Resistance 🌡️',
      topic: 'Resistance Effects',
      description: 'When electricity pushes hard against a resistor, it makes HEAT!',
      learningObjective: 'Understand that resistance can generate heat.',
      realWorldApp: 'Electric heaters and hair dryers use special wires with high resistance to create heat.',
      vocab: ['Heat', 'Friction', 'Push'],
      quiz: {
        question: 'What do high-resistance wires often create?',
        options: ['Ice', 'Heat', 'Water'],
        correctIndex: 1
      }
    },
    {
      id: 'lesson-g4-6',
      grade: 'Grade 4',
      type: 'activity',
      icon: '🛡️',
      title: 'Triple Loop Safety 🛡️💡🔔',
      topic: 'Complex Circuits',
      description: 'Connect a resistor, a lightbulb, and a buzzer in the same circuit safely!',
      learningObjective: 'Combine multiple output types and a resistor in a single circuit.',
      realWorldApp: 'A microwave has a light inside, a buzzer when it finishes, and resistors to control everything.',
      challengeInstructions: 'Wire a Battery, Switch, Resistor, Lightbulb, and Buzzer. Close the switch and adjust resistance.',
      vocab: ['Resistor', 'Buzzer', 'Safety'],
      circuitConfig: ['BATTERY', 'SWITCH', 'BULB', 'RESISTOR'],
      targetConditions: { requiresTripleLoad: true } 
    },
    {
      id: 'lesson-g4-7',
      grade: 'Grade 4',
      type: 'activity',
      icon: '⚙️',
      title: 'Fan Protection ⚙️',
      topic: 'Protecting Motors',
      description: 'Motors can spin too fast and break. Protect it with a resistor!',
      learningObjective: 'Use a resistor to control the speed of a motor.',
      realWorldApp: 'Electric scooter throttles use resistors to let you control your speed safely.',
      challengeInstructions: 'Add a Battery, a Switch, a Fan Motor, and a Resistor. Close the switch.',
      vocab: ['Throttle', 'Protect', 'Speed'],
      circuitConfig: ['BATTERY', 'SWITCH', 'FAN', 'RESISTOR'],
      targetConditions: { requiresFan: true, requiresResistor: true, requiresSwitchClosed: true }
    },
    {
      id: 'lesson-g4-8',
      grade: 'Grade 4',
      type: 'activity',
      icon: '🏆',
      title: 'Ultimate Challenge 🏆',
      topic: 'Final Exam',
      description: 'You are now a Circuit Master! Build any safe circuit with a resistor to pass.',
      learningObjective: 'Demonstrate mastery of basic electronics.',
      realWorldApp: 'You have the knowledge to understand the electronics all around you!',
      challengeInstructions: 'Create a closed circuit with a Battery, a Resistor, and ANY two outputs (Bulb, Fan, or Buzzer).',
      vocab: ['Master', 'Electronics', 'Graduate'],
      circuitConfig: ['BATTERY', 'RESISTOR', 'WIRE', 'WIRE'],
      targetConditions: { requiresResistor: true, requiresFlowing: true }
    }
  ]
};

export { SYLLABUS };
