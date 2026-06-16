// Circuit Validation Logic System for EduCare AI

export function validateNetlistCircuit(netlist) {
  const { components = [], connections = [] } = netlist;

  const componentMap = {};
  components.forEach(c => {
    componentMap[c.id] = c;
  });

  // 1. Disconnected Components Check
  const connectedIds = new Set();
  connections.forEach(conn => {
    connectedIds.add(conn.from);
    connectedIds.add(conn.to);
  });

  const disconnected = components.filter(c => !connectedIds.has(c.id));
  if (disconnected.length > 0 && components.length > 1) {
    return {
      status: 'fail',
      message: `🔗 Disconnected component detected: ${disconnected[0].type}! All components must be connected in the wire loop.`,
      hint: `Connect the wires to the ports of ${disconnected[0].id}.`,
      score: 50,
      glow: false,
      rotate: false
    };
  }

  // 2. Battery Existence Check
  const battery = components.find(c => c.type === 'BATTERY');
  if (!battery) {
    return {
      status: 'fail',
      message: "🔋 Missing power! The circuit needs a Battery to push electricity through the loop.",
      hint: "Drag a Battery onto the workspace.",
      score: 20,
      glow: false,
      rotate: false
    };
  }

  // 3. Open Switch check inside placed components
  const openSwitches = components.filter(c => c.type === 'SWITCH' && c.state?.closed === false);

  // 4. Build undirected adjacency list
  // If switch is open, it blocks traversal completely
  const adj = {};
  components.forEach(c => {
    adj[c.id] = [];
  });

  connections.forEach(conn => {
    const fromComp = componentMap[conn.from];
    const toComp = componentMap[conn.to];
    
    if (!fromComp || !toComp) return;

    // Check if either component is an open switch
    const isFromOpenSwitch = fromComp.type === 'SWITCH' && fromComp.state?.closed === false;
    const isToOpenSwitch = toComp.type === 'SWITCH' && toComp.state?.closed === false;

    if (!isFromOpenSwitch && !isToOpenSwitch) {
      adj[conn.from].push(conn.to);
      adj[conn.to].push(conn.from);
    }
  });

  // 5. Closed Loop Check
  // Find battery neighbors
  const batNeighbors = adj[battery.id] || [];
  if (batNeighbors.length < 2) {
    // Check if there's an open switch connected to the battery that prevented neighbors from registering
    if (openSwitches.length > 0) {
      return {
        status: 'fail',
        message: "🔌 Open circuit detected! A switch is currently open.",
        hint: "Flip the switch state to CLOSED to complete the path.",
        score: 60,
        glow: false,
        rotate: false
      };
    }
    return {
      status: 'fail',
      message: "❌ Incomplete path! Wires do not complete a circle back to the battery.",
      hint: "Make sure wires form a complete loop from one terminal of the battery to the other.",
      score: 30,
      glow: false,
      rotate: false
    };
  }

  // Path check from battery neighbor 0 to neighbor 1, avoiding crossing internally through the battery node
  let loopFound = false;
  let pathKeys = new Set();
  const startNode = batNeighbors[0];
  const targetNode = batNeighbors[1];

  const visited = new Set();
  const parent = {};

  const dfs = (node) => {
    visited.add(node);
    if (node === targetNode) {
      loopFound = true;
      return true;
    }
    for (const next of (adj[node] || [])) {
      if (!visited.has(next)) {
        parent[next] = node;
        if (dfs(next)) return true;
      }
    }
    return false;
  };

  visited.add(battery.id); // block battery internal traversal
  if (dfs(startNode)) {
    // Reconstruct loop path
    pathKeys.add(battery.id);
    let curr = targetNode;
    pathKeys.add(curr);
    while (curr !== startNode) {
      curr = parent[curr];
      pathKeys.add(curr);
    }
  }

  if (loopFound) {
    const pathComponents = Array.from(pathKeys).map(k => componentMap[k]);
    const hasLED = pathComponents.some(c => c.type === 'LED' || c.type === 'BULB');
    const hasMotor = pathComponents.some(c => c.type === 'MOTOR' || c.type === 'FAN');
    
    // Short circuit check: no LED, no BULB, no MOTOR
    if (!hasLED && !hasMotor) {
      return {
        status: 'fail',
        message: "⚠️ Short circuit! The battery connects directly to itself with no load. This will get hot and is unsafe.",
        hint: "Place an LED bulb or Motor in the loop path.",
        score: 40,
        glow: false,
        rotate: false
      };
    }

    const ledGlow = hasLED;
    const motorRotate = hasMotor;

    return {
      status: 'success',
      message: `⚡ Success! Loop complete. ${ledGlow ? 'LED is glowing! ' : ''}${motorRotate ? 'Motor is rotating!' : ''}`,
      hint: "Excellent work! The circuit flows perfectly.",
      score: 100,
      glow: ledGlow,
      rotate: motorRotate
    };
  }

  // If DFS failed, check if there's an open switch in the connection pathways
  if (openSwitches.length > 0) {
    return {
      status: 'fail',
      message: "🔌 Open circuit detected! The switch gate is OPEN, stopping the electron flow.",
      hint: "Click the Switch to toggle it CLOSED.",
      score: 60,
      glow: false,
      rotate: false
    };
  }

  return {
    status: 'fail',
    message: "❌ Incomplete path! Wires do not complete a circle back to the battery.",
    hint: "Make sure all wires are connected end-to-end.",
    score: 30,
    glow: false,
    rotate: false
  };
}

export function validateCircuit(config) {
  // Check if configuration uses the new advanced Netlist graph format
  if (config.components || config.connections) {
    return validateNetlistCircuit(config);
  }

  // Legacy slots configuration validation
  const {
    slots = [],
    switchClosed = false,
    selectedMaterial = null,
    batteryPolarity = 'correct',
    resistance = 10
  } = config;

  const hasBattery = slots.some(s => s === 'BATTERY' || s.id === 'BATTERY');
  const hasLED = slots.some(s => s === 'BULB' || s.id === 'BULB');
  const hasSwitch = slots.some(s => s === 'SWITCH' || s.id === 'SWITCH');
  const hasMaterialSlot = slots.some(s => s === 'TEST_SLOT' || s.id === 'TEST_SLOT');
  const hasResistor = slots.some(s => s === 'RESISTOR' || s.id === 'RESISTOR');
  const hasBuzzer = slots.some(s => s === 'BUZZER' || s.id === 'BUZZER');
  const hasFan = slots.some(s => s === 'FAN' || s.id === 'FAN');

  const hasConsumer = hasLED || hasBuzzer || hasFan;

  // 1. Missing Power Check
  if (!hasBattery) {
    return {
      status: 'fail',
      glow: false,
      circuitState: 'broken',
      message: "Your circuit doesn't have a power source! A battery is needed to push electrons around the loop.",
      hint: "Try adding a Battery 🔋 to your board.",
      score: 20
    };
  }

  // 2. Battery Polarity Check
  if (hasLED && batteryPolarity === 'reversed') {
    return {
      status: 'fail',
      glow: false,
      circuitState: 'closed-incorrect',
      message: "The battery is connected backwards! LEDs are one-way streets for electricity. If you block the road, the bulb cannot glow.",
      hint: "Flip the battery 🔋 polarity so the positive (+) side faces the correct direction.",
      score: 50
    };
  }

  // 3. Open Circuit Check (Switch)
  if (hasSwitch && !switchClosed) {
    return {
      status: 'fail',
      glow: false,
      circuitState: 'open',
      message: "The switch is open! An open switch acts like a raised drawbridge, leaving a gap in the road so electrons cannot cross.",
      hint: "Click on the Switch 🔌 to close it and complete the pathway.",
      score: 60
    };
  }

  // 4. Open Circuit Check (Insulator in Material Slot)
  if (hasMaterialSlot) {
    const isConductor = selectedMaterial && (selectedMaterial.conductor || selectedMaterial.isConductor);
    if (!isConductor) {
      const materialName = selectedMaterial ? selectedMaterial.name : 'empty slot';
      return {
        status: 'fail',
        glow: false,
        circuitState: 'open',
        message: `Your material (${materialName}) is an insulator! Insulators do not let electrons pass through.`,
        hint: "Try testing a metal item like the Gold Coin 🪙 or Metal Paperclip 📎.",
        score: 50
      };
    }
  }

  // 5. Short Circuit Check
  const hasLoad = hasConsumer || (hasResistor && resistance > 2) || (hasMaterialSlot && selectedMaterial && !selectedMaterial.conductor);
  if (hasBattery && !hasLoad) {
    return {
      status: 'fail',
      glow: false,
      circuitState: 'closed',
      message: "⚠️ Short circuit detected! The battery is connected directly to itself with no resistance. This makes the battery get very hot and is unsafe.",
      hint: "Add a Light Bulb 💡, Fan 🌀, or Resistor 🚧 to protect the battery.",
      score: 40
    };
  }

  // 6. Successful Closed Loop
  return {
    status: 'success',
    glow: true,
    circuitState: 'closed',
    message: "Hooray! The circuit is CLOSED, and the battery polarity is correct. Electrons are flowing happily and lighting up the LED! ⚡",
    hint: "Excellent work! Your circuit is 100% correct.",
    score: 100
  };
}
